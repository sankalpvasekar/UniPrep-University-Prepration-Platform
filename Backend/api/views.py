from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Branch, Subject, Question, Paper, Video, UserProfile
from .serializers import (
    BranchSerializer, BranchListSerializer, SubjectSerializer,
    QuestionSerializer, PaperSerializer, VideoSerializer,
    UserProfileSerializer, RegisterSerializer, UserSerializer
)
import numpy as np
# Import analyzer with error handling
try:
    from .uniprep_analyzer import get_analyzer, reload_analyzer
    ANALYZER_AVAILABLE = True
except ImportError as e:
    print(f"Warning: AI Analyzer not available: {e}")
    ANALYZER_AVAILABLE = False
    def get_analyzer():
        return None

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint to verify server is running and dataset is loaded."""
    return Response({
        'status': 'ok',
        'server': 'running',
        'message': 'Backend server is running'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def analyzer_reload(request):
    """Force reload the global analyzer (use after data/code changes)."""
    try:
        if not ANALYZER_AVAILABLE:
            return Response({'status': 'not_available'})
        reload_analyzer()
        return Response({'status': 'ok'})
    except Exception as e:
        return Response({'status': 'error', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint"""
    print("Registration data received:", request.data)  # Debug logging
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_201_CREATED)
    print("Registration errors:", serializer.errors)  # Debug logging
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login endpoint"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Please provide both email and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate using email as username
    user = authenticate(username=email, password=password)
    
    if user:
        token, created = Token.objects.get_or_create(user=user)
        
        # Get user profile
        try:
            profile = user.profile
            branch_id = profile.branch.id if profile.branch else None
        except UserProfile.DoesNotExist:
            UserProfile.objects.create(user=user)
            branch_id = None
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'branch': branch_id,
            }
        })
    
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """User logout endpoint"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'error': 'Something went wrong'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current user details"""
    serializer = UserSerializer(request.user)
    try:
        profile = request.user.profile
        branch_id = profile.branch.id if profile.branch else None
    except UserProfile.DoesNotExist:
        branch_id = None
    
    data = serializer.data
    data['branch'] = branch_id
    return Response(data)


class BranchViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for branches"""
    queryset = Branch.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BranchListSerializer
        return BranchSerializer


class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for subjects"""
    queryset = Subject.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SubjectListSerializer
        return SubjectSerializer
    
    def get_queryset(self):
        queryset = Subject.objects.all()
        branch_id = self.request.query_params.get('branch', None)
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        return queryset


class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for questions"""
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    
    def get_queryset(self):
        queryset = Question.objects.all()
        subject_id = self.request.query_params.get('subject', None)
        difficulty = self.request.query_params.get('difficulty', None)
        
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        return queryset


class PaperViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for papers"""
    queryset = Paper.objects.all()
    serializer_class = PaperSerializer
    
    def get_queryset(self):
        queryset = Paper.objects.all()
        subject_id = self.request.query_params.get('subject', None)
        
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        return queryset


class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for videos"""
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    
    def get_queryset(self):
        queryset = Video.objects.all()
        subject_id = self.request.query_params.get('subject', None)
        
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        return queryset


@api_view(['GET'])
@permission_classes([AllowAny])
def dataset_subjects(request):
    """
    Get subjects from CSV dataset
    Query params: branch, year
    """
    try:
        if not ANALYZER_AVAILABLE:
            return Response({
                'subjects': [],
                'source': 'analyzer_not_available'
            })
        
        analyzer = get_analyzer()
        
        if not analyzer or not analyzer.is_ready:
            return Response({
                'subjects': [],
                'source': 'dataset_not_ready'
            })
        
        branch_param = request.query_params.get('branch', None)
        year = request.query_params.get('year', None)
        
        # Map frontend branch IDs to dataset branch codes
        branch_to_code = {
            'cse': 'CSE',
            'mech': 'ME',
            'entc': 'ENTC',
            'civil': 'CIVIL',
            'electrical': 'ELECTRICAL',
        }
        
        # Convert branch ID to uppercase code for analyzer
        branch = branch_to_code.get(branch_param.lower() if branch_param else None, branch_param)
        
        subjects = analyzer.get_subjects_from_csv(branch=branch, year=year)
        
        # Format subjects for frontend
        subjects_data = []
        for idx, subject_name in enumerate(subjects):
            subjects_data.append({
                'id': subject_name.lower().replace(' ', '-'),
                'name': subject_name,
                'description': f'Study materials for {subject_name}',
                'icon': ['🌳', '⚙️', '🗄️', '🧮', '🌐', '🤖', '📚', '🔬', '💡', '🎯'][idx % 10],
                'color': ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 
                         'from-green-500 to-teal-500', 'from-orange-500 to-red-500',
                         'from-indigo-500 to-purple-500', 'from-pink-500 to-rose-500'][idx % 6]
            })
        
        return Response({
            'subjects': subjects_data,
            'source': 'dataset'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def concepts(request, subject_id):
    """
    Concept distribution for a subject, optionally filtered by study year.
    Query param: year=FY|SY|TY|Final Year
    Returns: { concepts: [{name, percent}], year }
    """
    try:
        if not ANALYZER_AVAILABLE:
            return Response({'concepts': [], 'source': 'analyzer_not_available'})

        analyzer = get_analyzer()
        if not analyzer or not analyzer.is_ready:
            return Response({'concepts': [], 'source': 'dataset_not_ready'})

        subject_name = subject_id.replace('-', ' ').title()
        study_year = request.query_params.get('year')
        predict_year = request.query_params.get('predict_year')
        seed_param = request.query_params.get('seed')

        # Temporarily override prediction year and random seed for reproducibility
        old_year = analyzer.prediction_year
        old_state = np.random.get_state()
        try:
            if predict_year:
                try:
                    analyzer.prediction_year = int(predict_year)
                except Exception:
                    pass
            if seed_param is not None:
                try:
                    np.random.seed(int(seed_param))
                except Exception:
                    pass

            prioritized = analyzer.get_prioritized_questions(subject_name, study_year=study_year)
            if not prioritized:
                return Response({'concepts': [], 'source': 'ai_analyzer', 'year': study_year})

            # Compute topic priorities using final_score (sharper, consistent with questions list)
            from collections import defaultdict
            topic_to_score = defaultdict(float)
            for item in prioritized:
                topic = item.get('topic', 'General') or 'General'
                score = float(item.get('final_score', 0.0))
                # Fallback if final_score missing: weight by priority_percent
                if score <= 0 and 'priority_percent' in item:
                    score = float(item['priority_percent'])
                topic_to_score[topic] += max(0.0, score)

            # Take top 5 topics and rescale to 100%
            ranked = sorted(topic_to_score.items(), key=lambda kv: kv[1], reverse=True)[:5]
            total_score = sum(s for _, s in ranked) or 1.0
            percents = [int(round((s / total_score) * 100)) for _, s in ranked]
            diff = 100 - sum(percents)
            if len(percents) > 0 and diff != 0:
                percents[0] = max(0, percents[0] + diff)
            concepts_list = [
                {'name': name, 'percent': percents[i]}
                for i, (name, _) in enumerate(ranked)
            ]
            return Response({'concepts': concepts_list, 'source': 'ai_analyzer', 'year': study_year})
        finally:
            # Restore analyzer year and RNG state
            analyzer.prediction_year = old_year
            try:
                np.random.set_state(old_state)
            except Exception:
                pass
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def dataset_past_papers(request, subject_id):
    """
    Build past papers from the CSV dataset by grouping questions per subject and Qyear.
    Query params:
      - year: optional filter for study year (FY|SY|TY|Final Year)
    Returns: { papers: [ { id, title, description, duration, totalMarks, difficulty, downloadCount, sections, url, qyear, study_year } ] }
    """
    try:
        if not ANALYZER_AVAILABLE:
            return Response({'papers': [], 'source': 'analyzer_not_available'})

        analyzer = get_analyzer()
        if not analyzer or not analyzer.is_ready or analyzer.df is None or analyzer.df.empty:
            return Response({'papers': [], 'source': 'dataset_not_ready'})

        subject_name = subject_id.replace('-', ' ').title()
        study_year = request.query_params.get('year')  # FY|SY|TY|Final Year

        df = analyzer.df.copy()
        # Normalize for robust filtering
        df['subject_norm'] = df['subject'].astype(str).str.strip().str.lower()
        df['study_year_norm'] = df['study_year'].astype(str).str.strip()
        df = df[df['subject_norm'] == subject_name.strip().lower()]
        if study_year:
            df = df[df['study_year_norm'] == str(study_year).strip()]

        if df.empty:
            return Response({'papers': [], 'subject': subject_name, 'year': study_year, 'source': 'dataset'})

        # Ensure numeric
        df['Qyear'] = pd.to_numeric(df['Qyear'], errors='coerce').astype('Int64')
        df = df.dropna(subset=['Qyear'])

        papers = []
        for (qy), g in df.groupby('Qyear'):
            qyear = int(qy)
            questions = g[['question_text', 'mark_weightage']].dropna().to_dict('records')
            total_marks = int(pd.to_numeric(g['mark_weightage'], errors='coerce').fillna(0).sum())
            # Difficulty heuristic: based on avg marks
            avg_marks = float(pd.to_numeric(g['mark_weightage'], errors='coerce').fillna(0).mean()) if len(g) > 0 else 0.0
            if avg_marks <= 3:
                difficulty = 'Easy'
            elif avg_marks <= 7:
                difficulty = 'Medium'
            else:
                difficulty = 'Hard'

            # Sections: top topics from question_text quick heuristic
            try:
                topics = g['question_text'].astype(str).str.extractall(r"([A-Za-z][A-Za-z0-9\-]{3,})").droplevel(1)[0].str.title()
                common = topics.value_counts().head(5).index.tolist()
            except Exception:
                common = []

            paper_obj = {
                'id': f"{subject_id}-{qyear}-{(study_year or 'ALL').replace(' ', '').lower()}",
                'title': f"{subject_name} {qyear}{f' - {study_year}' if study_year else ''}",
                'description': f"Auto-generated from dataset: {len(questions)} questions",
                'duration': '3 hours',
                'totalMarks': total_marks,
                'difficulty': difficulty,
                'downloadCount': 0,
                'sections': common,
                'url': '#',
                'qyear': qyear,
                'study_year': study_year or None,
                'questions': questions,
            }
            papers.append(paper_obj)

        # Sort by year descending
        papers = sorted(papers, key=lambda p: p['qyear'], reverse=True)

        return Response({'papers': papers, 'subject': subject_name, 'year': study_year, 'source': 'dataset'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def dataset_years(request):
    """
    Get available study years (FY/SY/TY/Final Year) from CSV for a branch.
    Query params: branch (optional)
    """
    try:
        if not ANALYZER_AVAILABLE:
            return Response({'years': [], 'source': 'analyzer_not_available'})
        analyzer = get_analyzer()
        if not analyzer or not analyzer.is_ready:
            return Response({'years': [], 'source': 'dataset_not_ready'})
        
        branch_param = request.query_params.get('branch')
        
        # Map frontend branch IDs to dataset branch codes
        branch_to_code = {
            'cse': 'CSE',
            'mech': 'ME',
            'entc': 'ENTC',
            'civil': 'CIVIL',
            'electrical': 'ELECTRICAL',
        }
        
        branch = branch_to_code.get(branch_param.lower() if branch_param else None, branch_param)
        years = analyzer.get_years_from_csv(branch=branch)
        return Response({'years': years, 'source': 'dataset'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def dataset_branches(request):
    """
    Get branches from CSV dataset via analyzer
    """
    try:
        if not ANALYZER_AVAILABLE:
            return Response({'branches': [], 'source': 'analyzer_not_available'})

        analyzer = get_analyzer()
        if not analyzer or not analyzer.is_ready:
            return Response({'branches': [], 'source': 'dataset_not_ready'})

        raw = analyzer.get_branches_from_csv()  # e.g., ['CSE','ENTC','ME','CIVIL','ELECTRICAL']
        # Map to frontend-friendly IDs
        id_map = {
            'ELECTRICAL': 'electrical',
            'CIVIL': 'civil',
            'ME': 'mech',
            'ENTC': 'entc',
            'CSE': 'cse',
        }
        name_map = {
            'cse': 'Computer Science Engineering',
            'entc': 'Electronics and Telecommunication Engineering',
            'mech': 'Mechanical Engineering',
            'civil': 'Civil Engineering',
            'electrical': 'Electrical Engineering',
        }
        palette = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-green-500 to-teal-500',
            'from-orange-500 to-red-500',
            'from-yellow-500 to-orange-500',
        ]
        emoji = ['💻','📡','🔧','🏗️','⚡']
        branches = []
        for i, b in enumerate(raw):
            bid = id_map.get(b, b.lower())
            branches.append({
                'id': bid,
                'name': name_map.get(bid, b),
                'icon': emoji[i % len(emoji)],
                'color': palette[i % len(palette)],
            })
        return Response({'branches': branches, 'source': 'dataset'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def ai_questions(request, subject_id):
    """
    Get AI-powered prioritized questions for a subject
    Uses the UniPrep analyzer algorithm
    """
    try:
        if not ANALYZER_AVAILABLE:
            # Fallback to database
            try:
                subject = Subject.objects.get(id=subject_id)
                questions_db = Question.objects.filter(subject=subject)
                easy = [{'question': q.text, 'year': 2023, 'topic': 'General', 'marks': q.marks} 
                       for q in questions_db.filter(difficulty='easy')]
                medium = [{'question': q.text, 'year': 2023, 'topic': 'General', 'marks': q.marks} 
                         for q in questions_db.filter(difficulty='medium')]
                hard = [{'question': q.text, 'year': 2023, 'topic': 'General', 'marks': q.marks} 
                       for q in questions_db.filter(difficulty='hard')]
                
                return Response({
                    'easy': easy,
                    'medium': medium,
                    'hard': hard,
                    'source': 'database'
                })
            except Subject.DoesNotExist:
                return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
        
        analyzer = get_analyzer()
        
        # Try to find subject in dataset by name
        subject_name = subject_id.replace('-', ' ').title()
        
        if not analyzer or not analyzer.is_ready:
            # Fallback to database
            try:
                subject = Subject.objects.get(id=subject_id)
                questions_db = Question.objects.filter(subject=subject)
                easy = [{'question': q.text, 'year': 2023, 'topic': 'General', 'marks': q.marks} 
                       for q in questions_db.filter(difficulty='easy')]
                medium = [{'question': q.text, 'year': 2023, 'topic': 'General', 'marks': q.marks} 
                         for q in questions_db.filter(difficulty='medium')]
                hard = [{'question': q.text, 'year': 2023, 'topic': 'General', 'marks': q.marks} 
                       for q in questions_db.filter(difficulty='hard')]
                
                return Response({
                    'easy': easy,
                    'medium': medium,
                    'hard': hard,
                    'source': 'database'
                })
            except Subject.DoesNotExist:
                return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Use AI analyzer with dataset
        study_year = request.query_params.get('year')  # e.g., FY/SY/TY/Final Year
        predict_year = request.query_params.get('predict_year')
        seed_param = request.query_params.get('seed')
        top_param = request.query_params.get('top')
        try:
            top_n = int(top_param) if top_param is not None else 14
        except ValueError:
            top_n = 14
        # Temporarily override prediction year and random seed for reproducibility
        old_year = analyzer.prediction_year
        old_state = np.random.get_state()
        try:
            if predict_year:
                try:
                    analyzer.prediction_year = int(predict_year)
                except Exception:
                    pass
            if seed_param is not None:
                try:
                    np.random.seed(int(seed_param))
                except Exception:
                    pass

            try:
                categorized_questions = analyzer.analyze_subject(subject_name, study_year=study_year)
            except Exception as e:
                categorized_questions = {'easy': [], 'medium': [], 'hard': []}
                print(f"analyze_subject error for {subject_name}: {e}")
            try:
                prioritized_all = analyzer.get_prioritized_questions(subject_name, study_year=study_year)
            except Exception as e:
                print(f"get_prioritized_questions error for {subject_name} ({study_year}): {e}")
                prioritized_all = []
            total_prioritized = len(prioritized_all)
            # Colab-like scaling: relative to max score, cap at 99
            prioritized_top = prioritized_all[:max(0, top_n)]
            try:
                scores = [max(0.0, float(item.get('final_score', 0.0))) for item in prioritized_top]
                max_score = max(scores) if scores else 1.0
                max_score = max(1e-9, max_score)
                for i, item in enumerate(prioritized_top):
                    s = max(0.0, float(item.get('final_score', 0.0)))
                    pct = int((s / max_score) * 100)
                    item['priority_percent'] = min(99, pct)
            except Exception:
                pass
            prioritized = prioritized_top
            return Response({
                **categorized_questions,
                'prioritized': prioritized,
                'total_prioritized': total_prioritized,
                'year': study_year,
                'source': 'ai_analyzer'
            })
        finally:
            # Restore analyzer year and RNG state
            analyzer.prediction_year = old_year
            try:
                np.random.set_state(old_state)
            except Exception:
                pass
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
