"""
UniPrep Question Analyzer
Analyzes university questions and predicts probable questions using AI
"""
import pandas as pd
import numpy as np
import warnings
from datetime import datetime
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

try:
    from sklearn.cluster import AgglomerativeClustering
except Exception:
    AgglomerativeClustering = None

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
        self.is_ready = False
        self.light_mode = False  # when AI models are not available
        self.prediction_year = datetime.now().year
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
            
            # Standardize column name: 'year' is the academic year (FY/SY/TY), 'Qyear' is question year
            if 'year' in self.df.columns:
                self.df['study_year'] = self.df['year']
            
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

    def analyze_subject(self, subject_name):
        """
        Analyzes questions for a specific subject and returns prioritized questions
        Returns: dict with 'easy', 'medium', 'hard' categories
        """
        if not self.is_ready or self.df.empty:
            return {'easy': [], 'medium': [], 'hard': []}

        # Filter for the specific subject (case-insensitive)
        subject_df = self.df.copy()
        subject_df = subject_df[subject_df['subject'].astype(str).str.strip().str.lower() == str(subject_name).strip().lower()].copy()

        if subject_df.empty:
            print(f"No data found for subject: {subject_name}")
            return {'easy': [], 'medium': [], 'hard': []}

        print(f"\n[ANALYZING] Subject: {subject_name}")
        
        # Extract topics and (optionally) create embeddings
        subject_df['topic'] = subject_df['question_text'].apply(lambda x: self._extract_key_concept(x))
        if not self.light_mode and 'sentence_model' in self.models:
            embeddings = self.models['sentence_model'].encode(subject_df['question_text'].tolist(), show_progress_bar=False)
        else:
            embeddings = None
        
        # Group similar questions (skip clustering in light mode)
        n_clusters = min(len(subject_df), 10)  # Max 10 clusters
        if len(subject_df) > 1 and embeddings is not None and AgglomerativeClustering is not None:
            subject_df['group_id'] = AgglomerativeClustering(n_clusters=n_clusters, linkage='ward').fit_predict(embeddings)
        else:
            # treat each row as its own group to avoid losing items
            subject_df['group_id'] = range(len(subject_df)) if len(subject_df) > 1 else 0
        
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

        # Extract topics
        df['topic'] = df['question_text'].apply(lambda x: self._extract_key_concept(x))
        if not self.light_mode and 'sentence_model' in self.models:
            embeddings = self.models['sentence_model'].encode(df['question_text'].tolist(), show_progress_bar=False)
        else:
            embeddings = None

        # Group similar questions
        n_clusters = min(len(df), 10)
        if len(df) > 1 and embeddings is not None and AgglomerativeClustering is not None:
            df['group_id'] = AgglomerativeClustering(n_clusters=n_clusters, linkage='ward').fit_predict(embeddings)
        else:
            df['group_id'] = range(len(df)) if len(df) > 1 else 0

        results = []
        total_years_in_data = df['Qyear'].nunique()
        if total_years_in_data == 0:
            return []

        for group in df['group_id'].unique():
            group_df = df[df['group_id'] == group]
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

        analysis_df = pd.DataFrame(results)
        analysis_df['final_score'] = analysis_df.apply(self._calculate_final_score, axis=1)
        total_score = analysis_df['final_score'].sum() or 1.0
        analysis_df['priority_percent'] = (analysis_df['final_score'] / total_score * 100.0).round().astype(int)
        analysis_df = analysis_df.sort_values(by='final_score', ascending=False)

        prioritized = []
        for row in analysis_df.itertuples():
            prioritized.append({
                'question': row.question,
                'topic': row.topic,
                'year': row.year,
                'marks': int(row.avg_marks),
                'priority_percent': int(row.priority_percent),
                'pattern': row.pattern,
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
        """Calculate priority score for a question"""
        score = row['base_priority'] * (1 + (row['avg_marks'] / 20.0))
        
        # Recency multiplier
        if row['years_since_last'] == 1:
            score *= 0.7  # Asked last year, less likely
        elif row['years_since_last'] == 2:
            score *= 1.5  # Prime candidate
        elif row['years_since_last'] > 2:
            score *= 1.2  # Overdue
        
        score *= row['pattern_multiplier']
        return score

    def _extract_key_concept(self, text):
        """Extract main topic from question text"""
        try:
            keywords = self.models['kw_model'].extract_keywords(
                text, 
                keyphrase_ngram_range=(1, 2), 
                stop_words='english', 
                top_n=1
            )
            return keywords[0][0].title() if keywords else "General"
        except:
            return "General"

    def _find_temporal_patterns(self, years):
        """Detect patterns in question appearance over years"""
        if len(years) < 2:
            return "Infrequent", 1.0
        
        # Check for odd/even year patterns
        if all(y % 2 != 0 for y in years):
            return "Odd Year Cycle", 2.0 if self.prediction_year % 2 != 0 else 0.7
        if all(y % 2 == 0 for y in years):
            return "Even Year Cycle", 2.0 if self.prediction_year % 2 == 0 else 0.7
        
        # Check for fixed gaps
        gaps = np.diff(sorted(years))
        if len(gaps) > 0 and np.all(gaps == gaps[0]):
            gap = gaps[0]
            return f"Fixed Gap ({gap}y)", 1.8 if (self.prediction_year - max(years)) == gap else 0.9
        
        # Recent activity
        if max(years) >= self.prediction_year - 2:
            return "Recent Activity", 1.1
        
        return "Sporadic", 1.0


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
