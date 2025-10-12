"""
UniPrep Question Analyzer
Analyzes university questions and predicts probable questions using AI
"""
import pandas as pd
import numpy as np
import warnings
from datetime import datetime
import re
import os

# Optional heavy deps: guard imports so the module can load without them
try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None

try:
    from keybert import KeyBERT
except Exception:
    KeyBERT = None

# Optional ML deps
try:
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import LabelEncoder
except Exception:
    RandomForestRegressor = None
    LabelEncoder = None

try:
    from sklearn.cluster import AgglomerativeClustering
except Exception:
    AgglomerativeClustering = None
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import KMeans
except Exception:
    TfidfVectorizer = None
    KMeans = None

warnings.simplefilter(action='ignore', category=FutureWarning)

class UniPrepAnalyzer:
    """
    Handles loading, processing, and analyzing university question data.
    Designed to be efficient by loading data and models only once.
    """
    def __init__(self, file_path):
        """
        file_path can be:
        - a single CSV file path
        - a directory containing CSV files
        - a list of CSV file paths (joined internally)
        """
        self.file_path = file_path
        self.df = None
        self.models = {}
        self.rf_model = None
        self.encoders = {}
        self.is_ready = False
        self.light_mode = False  # when AI models are not available
        self.prediction_year = datetime.now().year
        # Additional temporal model (TSP-style)
        self.temporal_model = None
        self.pattern_to_code = {
            "Infrequent": 0,
            "Sporadic": 1,
            "Recent Activity": 2,
            # Keep generic labels to map existing rule outputs
            "Fixed Gap": 3,
            "Fixed Gap (2y)": 3,
            "Fixed Gap (3y)": 3,
            "Odd/Even Cycle": 4,
            "Odd Year Cycle": 4,
            "Even Year Cycle": 4,
            "Annual Trend": 5,
        }
        self._load_all()

    def _load_all(self):
        """Private method to load data and AI models at initialization."""
        print("Initializing Analyzer...")
        try:
            # Collect CSV files
            csv_files = []
            if isinstance(self.file_path, list):
                csv_files = [p for p in self.file_path if os.path.isfile(p)]
            elif os.path.isdir(self.file_path):
                csv_files = [
                    os.path.join(self.file_path, f)
                    for f in os.listdir(self.file_path)
                    if f.lower().endswith('.csv')
                ]
            elif os.path.isfile(self.file_path):
                csv_files = [self.file_path]
            else:
                print(f"WARNING: CSV path not found: '{self.file_path}'")
                self.df = pd.DataFrame()
                return

            if not csv_files:
                print("WARNING: No CSV files found to load.")
                self.df = pd.DataFrame()
                return

            # Read and concat all CSVs
            frames = []
            for fp in csv_files:
                try:
                    frames.append(pd.read_csv(fp))
                    print(f"[OK] Loaded CSV: {os.path.basename(fp)}")
                except Exception as fe:
                    print(f"[WARN] Failed to read {fp}: {fe}")

            self.df = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()
            
            # Remove duplicate header rows (where year='year')
            self.df = self.df[self.df['year'] != 'year']
            
            # Column normalization/aliasing
            # Standardize column name: 'year' is the academic year (FY/SY/TY), 'Qyear' is question year
            if 'year' in self.df.columns:
                self.df['study_year'] = self.df['year']
            # Some CSVs may use 'Qtest' for the question text; alias it to 'question_text'
            if 'question_text' not in self.df.columns and 'Qtest' in self.df.columns:
                self.df = self.df.rename(columns={'Qtest': 'question_text'})
            
            required_columns = ['branch', 'study_year', 'subject', 'mark_weightage', 'Qyear', 'question_text']
            if not all(col in self.df.columns for col in required_columns):
                raise KeyError(f"CSV is missing required columns. Found: {list(self.df.columns)}")
            
            self.df['mark_weightage'] = pd.to_numeric(self.df['mark_weightage'], errors='coerce')
            self.df['Qyear'] = pd.to_numeric(self.df['Qyear'], errors='coerce')
            self.df.dropna(subset=required_columns, inplace=True)
            self.df['Qyear'] = self.df['Qyear'].astype(int)
            # Normalize common columns
            self.df['branch'] = self.df['branch'].astype(str).str.strip().str.upper()
            self.df['study_year'] = self.df['study_year'].astype(str).str.strip()
            # Normalize variant year labels
            self.df['study_year'] = self.df['study_year'].replace({
                'FINAL': 'Final Year',
                'FINAL YEAR': 'Final Year',
                'F.Y.': 'FY', 'S.Y.': 'SY', 'T.Y.': 'TY'
            })

            print(f"[OK] Data loaded and cleaned. Total records: {len(self.df)}")

            # Set default prediction year to one year after the latest Qyear in the dataset
            try:
                max_qy = int(self.df['Qyear'].max())
                if max_qy > 0:
                    self.prediction_year = max_qy + 1
            except Exception:
                pass

            # Try to load AI models, but don't fail if unavailable
            try:
                print("-> Loading AI models...")
                if SentenceTransformer is None or KeyBERT is None:
                    raise RuntimeError("Transformer/KeyBERT not available")
                self.models = {
                    'sentence_model': SentenceTransformer('all-MiniLM-L6-v2'),
                    'kw_model': KeyBERT()
                }
                print("[OK] AI models loaded.")
            except Exception as me:
                print(f"[WARN] AI models unavailable, running in light mode: {me}")
                self.models = {}
                self.light_mode = True

            # Mark ready as long as CSV is loaded
            self.is_ready = True
            print("Initialization complete. Analyzer is ready.\n")

            # Train Random Forest for hidden pattern learning if sklearn is available
            try:
                self._train_random_forest()
            except Exception as e:
                print(f"[WARN] RF training skipped: {e}")

            # Train TSP-style temporal model
            try:
                self._train_temporal_tsp()
            except Exception as e:
                print(f"[WARN] Temporal TSP training skipped: {e}")

        except Exception as e:
            print(f"ERROR during initialization: {e}")
            self.df = pd.DataFrame()

    def get_subjects_from_csv(self, branch=None, year=None):
        """Returns all unique subjects from the CSV with optional filters"""
        if not self.is_ready or self.df.empty:
            return []
        
        filtered_df = self.df.copy()
        # Normalize columns for robust matching
        filtered_df['branch_norm'] = filtered_df['branch'].astype(str).str.strip().str.upper()
        filtered_df['year_norm'] = filtered_df['study_year'].astype(str).str.strip()
        filtered_df['subject_norm'] = filtered_df['subject'].astype(str).str.strip()
        if branch:
            filtered_df = filtered_df[filtered_df['branch_norm'] == str(branch).strip().upper()]
        if year:
            filtered_df = filtered_df[filtered_df['year_norm'] == str(year).strip()]
        
        subjects = filtered_df['subject_norm'].unique().tolist()
        return sorted(subjects)
    
    def get_branches_from_csv(self):
        """Returns all unique branches from the CSV"""
        if not self.is_ready or self.df.empty:
            return []
        return sorted(self.df['branch'].astype(str).str.strip().str.upper().unique().tolist())
    
    def get_years_from_csv(self, branch=None):
        """Returns all unique years from the CSV"""
        if not self.is_ready or self.df.empty:
            return []
        
        filtered_df = self.df.copy()
        if branch:
            filtered_df = filtered_df[filtered_df['branch'].astype(str).str.strip().str.upper() == str(branch).strip().upper()]
        
        years = filtered_df['study_year'].astype(str).str.strip().unique().tolist()
        return sorted(years)

    def analyze_subject(self, subject_name, study_year=None):
        """
        Analyzes questions for a specific subject and returns prioritized questions
        Returns: dict with 'easy', 'medium', 'hard' categories
        """
        if not self.is_ready or self.df.empty:
            return {'easy': [], 'medium': [], 'hard': []}

        # Filter for the specific subject (case-insensitive)
        subject_df = self.df.copy()
        subject_df = subject_df[subject_df['subject'].astype(str).str.strip().str.lower() == str(subject_name).strip().lower()].copy()
        if study_year:
            subject_df = subject_df[subject_df['study_year'].astype(str).str.strip() == str(study_year).strip()].copy()

        if subject_df.empty:
            print(f"No data found for subject: {subject_name}")
            return {'easy': [], 'medium': [], 'hard': []}

        print(f"\n[ANALYZING] Subject: {subject_name}")
        
        # Extract topics and question types
        subject_df['topic'] = subject_df['question_text'].apply(lambda x: self._extract_key_concept(x))
        subject_df['question_type'] = subject_df['question_text'].apply(lambda x: self._infer_question_type(x))
        
        # Enhanced semantic grouping using multiple strategies
        if not self.light_mode and 'sentence_model' in self.models:
            embeddings = self.models['sentence_model'].encode(subject_df['question_text'].tolist(), show_progress_bar=False)
        else:
            embeddings = None
        
        # Group similar questions using multiple strategies
        n_clusters = min(len(subject_df), 15)  # Increased clusters for better grouping
        
        if len(subject_df) > 1 and embeddings is not None and AgglomerativeClustering is not None:
            # Use semantic embeddings for grouping
            subject_df['group_id'] = AgglomerativeClustering(n_clusters=n_clusters, linkage='ward').fit_predict(embeddings)
        elif len(subject_df) > 1 and TfidfVectorizer is not None and KMeans is not None:
            # Fallback to TF-IDF + KMeans
            try:
                vec = TfidfVectorizer(stop_words='english', ngram_range=(1, 3), min_df=1, max_features=1000)
                X = vec.fit_transform(subject_df['question_text'].astype(str).tolist())
                k = max(1, min(n_clusters, len(subject_df)))
                labels = KMeans(n_clusters=k, random_state=42, n_init=10).fit_predict(X)
                subject_df['group_id'] = labels
            except Exception:
                # Final fallback: normalize and group by similarity
                subject_df['qnorm'] = subject_df['question_text'].astype(str).str.lower().str.replace(r'[^a-z0-9\s]+', ' ', regex=True).str.replace(r'\s+', ' ', regex=True).str.strip()
                subject_df['group_key'] = subject_df['qnorm'] + '||' + subject_df['topic'].astype(str)
                subject_df['group_id'] = pd.factorize(subject_df['group_key'])[0]
        else:
            # Final fallback: normalize and group by similarity
            subject_df['qnorm'] = subject_df['question_text'].astype(str).str.lower().str.replace(r'[^a-z0-9\s]+', ' ', regex=True).str.replace(r'\s+', ' ', regex=True).str.strip()
            subject_df['group_key'] = subject_df['qnorm'] + '||' + subject_df['topic'].astype(str)
            subject_df['group_id'] = pd.factorize(subject_df['group_key'])[0]
        
        results = []
        total_years_in_data = subject_df['Qyear'].nunique()
        if total_years_in_data == 0:
            return {'easy': [], 'medium': [], 'hard': []}

        for group in subject_df['group_id'].unique():
            group_df = subject_df[subject_df['group_id'] == group]
            years = sorted(group_df['Qyear'].unique())
            pattern, p_multiplier = self._find_temporal_patterns(years)
            
            results.append({
                'question': group_df.iloc[0]['question_text'],
                'topic': group_df.iloc[0]['topic'],
                'base_priority': (len(group_df) / total_years_in_data) * 100,
                'avg_marks': group_df['mark_weightage'].mean(),
                'years_since_last': self.prediction_year - max(years),
                'pattern': pattern,
                'pattern_multiplier': p_multiplier,
                'year': int(max(years))
            })
        
        # Calculate final scores
        analysis_df = pd.DataFrame(results)
        analysis_df['final_score'] = analysis_df.apply(self._calculate_final_score, axis=1)
        
        # Sort by priority
        prioritized = analysis_df.sort_values(by='final_score', ascending=False)
        
        # Categorize by difficulty based on marks
        categorized = {'easy': [], 'medium': [], 'hard': []}
        
        for row in prioritized.itertuples():
            difficulty = self._determine_difficulty(row.avg_marks)
            question_data = {
                'question': row.question,
                'year': row.year,
                'topic': row.topic,
                'marks': int(row.avg_marks),
                'answer': f"This is a {difficulty} level question about {row.topic}. "
                         f"Pattern detected: {row.pattern}. "
                         f"Last asked in {row.year}."
            }
            categorized[difficulty].append(question_data)
        
        print(f"[OK] Analysis complete: {len(prioritized)} questions categorized")
        return categorized

    def get_prioritized_questions(self, subject_name, study_year=None):
        """
        Returns a flat, prioritized list of questions with priority_percent for a
        given subject and optional study_year filter (e.g., 'FY','SY','TY','Final Year').
        """
        if not self.is_ready or self.df.empty:
            return []

        # Filter for subject and optional study year
        df = self.df.copy()
        df = df[df['subject'].astype(str).str.strip().str.lower() == str(subject_name).strip().lower()].copy()
        if study_year:
            df = df[df['study_year'].astype(str).str.strip() == str(study_year).strip()]

        if df.empty:
            return []

        # Extract topics and question types
        df['topic'] = df['question_text'].apply(lambda x: self._extract_key_concept(x))
        df['question_type'] = df['question_text'].apply(lambda x: self._infer_question_type(x))
        
        # Enhanced semantic grouping using multiple strategies
        if not self.light_mode and 'sentence_model' in self.models:
            embeddings = self.models['sentence_model'].encode(df['question_text'].tolist(), show_progress_bar=False)
        else:
            embeddings = None

        # Group similar questions using multiple strategies
        n_clusters = min(len(df), 15)  # Increased clusters for better grouping
        
        if len(df) > 1 and embeddings is not None and AgglomerativeClustering is not None:
            # Use semantic embeddings for grouping
            df['group_id'] = AgglomerativeClustering(n_clusters=n_clusters, linkage='ward').fit_predict(embeddings)
        elif len(df) > 1 and TfidfVectorizer is not None and KMeans is not None:
            # Fallback to TF-IDF + KMeans
            try:
                vec = TfidfVectorizer(stop_words='english', ngram_range=(1, 3), min_df=1, max_features=1000)
                X = vec.fit_transform(df['question_text'].astype(str).tolist())
                k = max(1, min(n_clusters, len(df)))
                labels = KMeans(n_clusters=k, random_state=42, n_init=10).fit_predict(X)
                df['group_id'] = labels
            except Exception:
                # Final fallback: normalize and group by similarity
                df['qnorm'] = df['question_text'].astype(str).str.lower().str.replace(r'[^a-z0-9\s]+', ' ', regex=True).str.replace(r'\s+', ' ', regex=True).str.strip()
                df['group_key'] = df['qnorm'] + '||' + df['topic'].astype(str)
                df['group_id'] = pd.factorize(df['group_key'])[0]
        else:
            # Final fallback: normalize and group by similarity
            df['qnorm'] = df['question_text'].astype(str).str.lower().str.replace(r'[^a-z0-9\s]+', ' ', regex=True).str.replace(r'\s+', ' ', regex=True).str.strip()
            df['group_key'] = df['qnorm'] + '||' + df['topic'].astype(str)
            df['group_id'] = pd.factorize(df['group_key'])[0]

        results = []
        total_years_in_data = df['Qyear'].nunique()
        if total_years_in_data == 0:
            return []

        # Prepare enhanced RF features if model is available
        use_rf = self.rf_model is not None and LabelEncoder is not None and 'branch' in self.df.columns

        for group in df['group_id'].unique():
            group_df = df[df['group_id'] == group]
            years = sorted(group_df['Qyear'].unique())
            pattern, p_multiplier = self._find_temporal_patterns(years)

            rf_score = 1.0
            if use_rf:
                try:
                    # Enhanced encoding with question type
                    b_enc = self.encoders.get('branch')
                    s_enc = self.encoders.get('subject')
                    t_enc = self.encoders.get('topic')
                    type_enc = self.encoders.get('type')
                    
                    # Use first row as representative
                    _row = group_df.iloc[0]
                    branch_enc = b_enc.transform([_row['branch']])[0]
                    subject_enc = s_enc.transform([_row['subject']])[0]
                    topic_enc = t_enc.transform([_row['topic']])[0]
                    type_enc_val = type_enc.transform([_row['question_type']])[0]
                    
                    # Calculate enhanced features
                    frequency = len(group_df)
                    avg_gap = np.mean(np.diff(years)) if len(years) > 1 else 0
                    years_since_last_group = self.prediction_year - max(years)
                    
                    # Enhanced feature vector
                    X = np.array([[branch_enc, subject_enc, topic_enc, type_enc_val, 
                                 float(group_df['mark_weightage'].mean()), frequency, avg_gap, years_since_last_group]])
                    rf_score = float(self.rf_model.predict(X)[0])
                    # Keep rf_score within a reasonable positive range
                    rf_score = max(0.1, rf_score)
                except Exception:
                    rf_score = 1.0

            # Extract question type for this group
            question_type = self._infer_question_type(group_df.iloc[0]['question_text'])
            q_type_code = self._infer_question_type_code(group_df.iloc[0]['question_text'])

            # Temporal TSP priority multiplier
            tsp_score = self._predict_temporal_priority(years, float(group_df['mark_weightage'].mean()), q_type_code)
            
            results.append({
                'question': group_df.iloc[0]['question_text'],
                'topic': group_df.iloc[0]['topic'],
                'question_type': question_type,
                'base_priority': (len(group_df) / total_years_in_data) * 100,
                'avg_marks': group_df['mark_weightage'].mean(),
                'years_since_last': self.prediction_year - max(years),
                'pattern': pattern,
                'pattern_multiplier': p_multiplier,
                'rf_score': rf_score,
                'tsp_score': tsp_score,
                'years': years,
                'year': int(max(years))
            })

        analysis_df = pd.DataFrame(results)
        # Combine heuristic score with RF hidden pattern score and TSP temporal score
        analysis_df['heuristic_score'] = analysis_df.apply(self._calculate_final_score, axis=1)
        final = analysis_df['heuristic_score']
        if 'rf_score' in analysis_df.columns:
            final = final * analysis_df['rf_score']
        if 'tsp_score' in analysis_df.columns:
            final = final * analysis_df['tsp_score']
        analysis_df['final_score'] = final
        total_score = analysis_df['final_score'].sum() or 1.0
        analysis_df['priority_percent'] = (analysis_df['final_score'] / total_score * 100.0).round().astype(int)
        analysis_df = analysis_df.sort_values(by='final_score', ascending=False)

        prioritized = []
        for row in analysis_df.itertuples():
            prioritized.append({
                'question': row.question,
                'topic': row.topic,
                'year': row.year,
                'years': row.years,
                'marks': int(row.avg_marks),
                'priority_percent': int(row.priority_percent),
                'pattern': row.pattern,
                'final_score': float(row.final_score),
            })
        return prioritized

    def _determine_difficulty(self, marks):
        """Categorize question difficulty based on marks"""
        if marks <= 3:
            return 'easy'
        elif marks <= 7:
            return 'medium'
        else:
            return 'hard'

    def _calculate_final_score(self, row):
        """Calculate priority score using hybrid temporal analysis with enhanced weighting."""
        # Foundation score: frequency analysis (more aggressive)
        base_score = max(0.0, row['base_priority']) ** 1.5
        
        # Enhanced marks multiplier
        marks_mult = 1 + (row['avg_marks'] / 5.0)  # More aggressive marks weighting
        
        # Enhanced recency analysis
        years_since = row['years_since_last']
        if years_since == 1:
            recency_mult = 0.3  # Asked last year, heavily down-weight
        elif years_since == 2:
            recency_mult = 3.0  # Prime candidate - heavily boost
        elif years_since == 3:
            recency_mult = 2.2  # Good candidate
        elif years_since == 4:
            recency_mult = 1.8  # Still relevant
        else:
            recency_mult = 1.0  # Neutral for older questions
        
        # Enhanced temporal pattern multiplier
        pattern_mult = max(0.5, float(row['pattern_multiplier']))
        
        # Question type bonus (Theory questions often more important)
        type_bonus = 1.2 if row.get('question_type') == 'Theory' else 1.0
        
        # Combine all factors with more aggressive weighting
        final_score = base_score * marks_mult * recency_mult * pattern_mult * type_bonus
        return float(final_score)

    def _extract_key_concept(self, text):
        """Extract main topic from question text.
        If KeyBERT is unavailable, fall back to a lightweight keyword heuristic.
        """
        # Try KeyBERT if available
        try:
            if self.models and 'kw_model' in self.models:
                keywords = self.models['kw_model'].extract_keywords(
                    text,
                    keyphrase_ngram_range=(1, 2),
                    stop_words='english',
                    top_n=1
                )
                if keywords:
                    return keywords[0][0].title()
        except Exception:
            pass

        # Heuristic fallback: pick the longest meaningful token as topic
        try:
            stop = {
                'the','a','an','and','or','of','to','in','for','on','with','by','is','are','what','explain','describe','derive','working','principle','model','law','state','define','give','show'
            }
            tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9'-]{2,}", str(text))
            candidates = [t for t in tokens if t.lower() not in stop]
            if not candidates:
                return "General"
            best = sorted(candidates, key=lambda t: (-len(t), t.lower()))[0]
            return best.title()
        except Exception:
            return "General"

    def _infer_question_type(self, text):
        """Infer question type: Numerical or Theory based on keywords."""
        text_lower = str(text).lower()
        numerical_keywords = ['calculate', 'compute', 'find', 'derive', 'solve', 'determine', 'evaluate', 'numerical', 'value', 'result']
        theory_keywords = ['explain', 'describe', 'state', 'define', 'what is', 'principle', 'concept', 'theory', 'working', 'difference']
        
        num_score = sum(1 for kw in numerical_keywords if kw in text_lower)
        theory_score = sum(1 for kw in theory_keywords if kw in text_lower)
        
        return 'Numerical' if num_score > theory_score else 'Theory'

    def _rule_based_pattern_finder(self, years):
        """Rule-based pattern detection (Stage 1 of Temporal Analysis)."""
        if len(years) < 2:
            return "Infrequent", 1.0

        ys = sorted(set(int(y) for y in years))
        gaps = np.diff(ys)

        # Annual trend: require a clear recent consecutive streak (>= 3 years)
        if len(ys) >= 3:
            # Compute longest run of consecutive years and whether the latest years are consecutive
            longest_run = 1
            current_run = 1
            for i in range(1, len(ys)):
                if ys[i] - ys[i-1] == 1:
                    current_run += 1
                    longest_run = max(longest_run, current_run)
                else:
                    current_run = 1
            latest_consecutive = (ys[-1] - ys[-2] == 1) if len(ys) >= 2 else False
            if longest_run >= 3 and latest_consecutive:
                recent_gap = self.prediction_year - max(ys)
                mult = 1.3 if recent_gap <= 1 else 1.6
                return "Annual Trend", mult

        # Odd/Even cycles: all years share same parity and not consecutive
        if all(y % 2 != 0 for y in ys):
            return "Odd Year Cycle", 2.0 if self.prediction_year % 2 != 0 else 0.7
        if all(y % 2 == 0 for y in ys):
            return "Even Year Cycle", 2.0 if self.prediction_year % 2 == 0 else 0.7

        # Fixed gap > 1 year
        if len(gaps) > 0 and np.all(gaps == gaps[0]) and gaps[0] > 1:
            gap = int(gaps[0])
            return f"Fixed Gap ({gap}y)", 1.8 if (self.prediction_year - max(ys)) == gap else 0.9

        # Recent activity catch
        if max(ys) >= self.prediction_year - 2:
            return "Recent Activity", 1.1

        return "Sporadic", 1.0

    def _find_temporal_patterns(self, years):
        """Detect patterns in question appearance over years (wrapper for rule-based)."""
        return self._rule_based_pattern_finder(years)

    def _pattern_code(self, label: str) -> int:
        return self.pattern_to_code.get(str(label), 1)

    def _infer_question_type_code(self, text: str) -> int:
        return 1 if self._infer_question_type(text) == 'Numerical' else 0

    def _create_temporal_features(self, history_years, avg_marks, q_type_code, prediction_year):
        try:
            years = sorted(set(int(y) for y in history_years))
        except Exception:
            years = []
        pattern_label, _ = self._rule_based_pattern_finder(years)
        pattern_code = self._pattern_code(pattern_label)
        years_since_last = prediction_year - max(years) if years else 99
        frequency = len(years)
        gaps = np.diff(sorted(years)) if len(years) > 1 else np.array([])
        avg_gap = float(np.mean(gaps)) if gaps.size > 0 else 0.0
        std_gap = float(np.std(gaps)) if gaps.size > 1 else 0.0
        return [years_since_last, frequency, float(avg_marks or 0.0), avg_gap, std_gap, pattern_code, int(q_type_code)]

    def _train_temporal_tsp(self):
        """Train a temporal RF on synthetic next-year prediction tasks per question group (TSP-style)."""
        if self.df is None or self.df.empty:
            return
        if RandomForestRegressor is None:
            print("[INFO] sklearn not available; skipping Temporal TSP training.")
            return
        df = self.df.copy()
        if not {'question_text', 'Qyear', 'mark_weightage'}.issubset(df.columns):
            return
        min_year = int(df['Qyear'].min())
        max_year = int(df['Qyear'].max())
        if max_year - min_year < 1:
            return
        features, targets = [], []
        # Train across all subjects so model generalizes
        for qtext, g in df.groupby('question_text'):
            years = sorted(set(int(y) for y in g['Qyear'].tolist()))
            if not years:
                continue
            avg_marks = float(g['mark_weightage'].mean())
            q_type_code = self._infer_question_type_code(qtext)
            for year_to_predict in range(min_year + 1, max_year + 1):
                history = [y for y in years if y < year_to_predict]
                if not history:
                    continue
                x = self._create_temporal_features(history, avg_marks, q_type_code, year_to_predict)
                y_t = 1 if year_to_predict in years else 0
                features.append(x)
                targets.append(y_t)
        if not features:
            self.temporal_model = None
            return
        try:
            model = RandomForestRegressor(n_estimators=150, random_state=42, n_jobs=-1, min_samples_leaf=3)
            model.fit(np.array(features), np.array(targets))
            self.temporal_model = model
            print("[OK] Temporal TSP model trained.")
        except Exception as e:
            print(f"[WARN] Temporal TSP training failed: {e}")
            self.temporal_model = None

    def _predict_temporal_priority(self, years, avg_marks, q_type_code):
        if self.temporal_model is None or years is None or len(years) == 0:
            return 1.0
        try:
            x = self._create_temporal_features(years, avg_marks, q_type_code, self.prediction_year)
            score = float(self.temporal_model.predict([x])[0])
            return 1.0 + max(0.0, score)
        except Exception:
            return 1.0

    def _train_random_forest(self):
        """Train a Random Forest model to learn hidden repetition patterns.
        Uses branch, subject, topic, marks, recency, question type, and temporal features.
        """
        if self.df is None or self.df.empty:
            return
        if RandomForestRegressor is None or LabelEncoder is None:
            print("[INFO] sklearn not available; skipping RF training.")
            return

        df = self.df.copy()
        # Ensure basic columns exist
        for col in ['branch', 'subject', 'question_text', 'mark_weightage', 'Qyear']:
            if col not in df.columns:
                print("[WARN] Missing columns for RF training; skipped.")
                return

        # Enhanced feature extraction
        df['topic'] = df['question_text'].apply(lambda x: self._extract_key_concept(x))
        df['question_type'] = df['question_text'].apply(lambda x: self._infer_question_type(x))
        df['years_since_last'] = self.prediction_year - df['Qyear'].astype(int)
        
        # Calculate temporal features for each question group
        df['frequency'] = df.groupby('question_text')['Qyear'].transform('count')
        df['avg_gap'] = df.groupby('question_text')['Qyear'].transform(lambda x: np.mean(np.diff(sorted(x))) if len(x) > 1 else 0)
        df['last_year'] = df.groupby('question_text')['Qyear'].transform('max')
        df['years_since_last_group'] = self.prediction_year - df['last_year']

        # Label encoders
        enc_branch = LabelEncoder()
        enc_subject = LabelEncoder()
        enc_topic = LabelEncoder()
        enc_type = LabelEncoder()
        try:
            df['branch_enc'] = enc_branch.fit_transform(df['branch'].astype(str))
            df['subject_enc'] = enc_subject.fit_transform(df['subject'].astype(str))
            df['topic_enc'] = enc_topic.fit_transform(df['topic'].astype(str))
            df['type_enc'] = enc_type.fit_transform(df['question_type'].astype(str))
        except Exception as e:
            print(f"[WARN] Encoding failed: {e}")
            return

        # Enhanced features: branch, subject, topic, type, marks, frequency, avg_gap, years_since_last
        feature_cols = ['branch_enc', 'subject_enc', 'topic_enc', 'type_enc', 'mark_weightage', 
                       'frequency', 'avg_gap', 'years_since_last_group']
        X = df[feature_cols].astype(float).values
        
        # Target: enhanced frequency score with recency boost
        try:
            freq = df.groupby('question_text')['Qyear'].transform('count').astype(float)
            total_years = max(1, df['Qyear'].nunique())
            base_freq = freq / total_years
            
            # Boost recent questions (asked in 2024)
            recent_boost = np.where(df['last_year'] == 2024, 1.5, 1.0)
            y = (base_freq * recent_boost).values
        except Exception as e:
            print(f"[WARN] Target creation failed: {e}")
            return

        # Train enhanced RF
        try:
            rf = RandomForestRegressor(n_estimators=200, max_depth=15, min_samples_split=5, 
                                     min_samples_leaf=2, random_state=42)
            rf.fit(X, y)
            self.rf_model = rf
            self.encoders = {'branch': enc_branch, 'subject': enc_subject, 'topic': enc_topic, 'type': enc_type}
            print("[OK] Enhanced Random Forest trained for hidden pattern detection.")
        except Exception as e:
            print(f"[WARN] RF training failed: {e}")


# Global analyzer instance (singleton pattern)
_analyzer_instance = None

def get_analyzer():
    """Get or create the global analyzer instance"""
    global _analyzer_instance
    if _analyzer_instance is None:
        # Load all CSVs from data directory to support all branches/years/subjects
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        data_dir = os.path.abspath(os.path.join(base_dir, 'data'))
        _analyzer_instance = UniPrepAnalyzer(data_dir)
    return _analyzer_instance

def reload_analyzer():
    """Force reload of the global analyzer instance (useful after data/code changes)."""
    global _analyzer_instance
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    data_dir = os.path.abspath(os.path.join(base_dir, 'data'))
    _analyzer_instance = UniPrepAnalyzer(data_dir)
    return _analyzer_instance
