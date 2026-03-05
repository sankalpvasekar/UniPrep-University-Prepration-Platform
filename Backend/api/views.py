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
from .ai_service import generate_ai_answer, test_gemini_connection
from .mongodb_service import mongodb_service
import numpy as np
import re
# Import analyzer with error handling
try:
    from .uniprep_analyzer import get_analyzer, reload_analyzer
    ANALYZER_AVAILABLE = True
except ImportError as e:
    print(f"Warning: AI Analyzer not available: {e}")
    ANALYZER_AVAILABLE = False
    def get_analyzer():
        return None

def slugify_subject(name: str) -> str:
    """Create a URL-safe slug from a subject name (lowercase, dash-separated, no special chars)."""
    s = re.sub(r"[^a-z0-9]+", "-", str(name).lower())
    s = re.sub(r"-+", "-", s).strip("-")
    return s

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
    """User login endpoint - supports both username and email login"""
    login_field = request.data.get('email') or request.data.get('username')
    password = request.data.get('password')
    
    if not login_field or not password:
        return Response(
            {'error': 'Please provide both email/username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Try to authenticate using the provided field as username first
    user = authenticate(username=login_field, password=password)
    
    # If that fails, try to find user by email and authenticate with username
    if not user:
        try:
            user_by_email = User.objects.get(email=login_field)
            user = authenticate(username=user_by_email.username, password=password)
        except User.DoesNotExist:
            pass
    
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
        # Normalize year aliases from frontend routing to dataset labels
        if year:
            ykey = str(year).strip().lower()
            year_alias = {
                'fy': 'FY', 'first year': 'FY', 'first-year': 'FY', 'firstyear': 'FY',
                'sy': 'SY', 'second year': 'SY', 'second-year': 'SY', 'secondyear': 'SY',
                'ty': 'TY', 'third year': 'TY', 'third-year': 'TY', 'thirdyear': 'TY',
                'final': 'Final Year', 'final year': 'Final Year', 'final-year': 'Final Year', 'finalyear': 'Final Year', 'final yr': 'Final Year'
            }
            year = year_alias.get(ykey, year)
        
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
                'id': slugify_subject(subject_name),
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


@api_view(['POST'])
@permission_classes([AllowAny])
def ask_ai(request):
    """
    AI-powered question answering endpoint using Gemini API
    """
    try:
        question = request.data.get('question', '').strip()
        subject_id = request.data.get('subject_id', '')
        difficulty = request.data.get('difficulty', '')
        marks = request.data.get('marks', '')
        
        if not question:
            return Response(
                {'success': False, 'error': 'Question is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get subject context if subject_id is provided
        subject_context = None
        if subject_id:
            try:
                # Try to get subject from database first (only if it's a numeric ID)
                if subject_id.isdigit():
                    subject = Subject.objects.get(id=int(subject_id))
                    subject_context = f"{subject.name} ({subject.code})"
                else:
                    # If it's a string ID, use it as context
                    subject_context = subject_id.replace('-', ' ').title()
            except (Subject.DoesNotExist, ValueError):
                # If not in database or not numeric, use the subject_id as context
                subject_context = subject_id.replace('-', ' ').title()
        
        # Generate AI answer
        result = generate_ai_answer(
            question=question,
            subject_context=subject_context,
            difficulty=difficulty,
            marks=marks
        )
        
        if result['success']:
            return Response({
                'success': True,
                'answer': result['answer'],
                'model': result.get('model', 'gemini-flash-latest'),
                'question': question,
                'subject_context': subject_context
            })
        else:
            return Response({
                'success': False,
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response(
            {'success': False, 'error': f'Server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def test_ai_connection(request):
    """
    Test endpoint to verify AI service connection
    """
    try:
        result = test_gemini_connection()
        if result['success']:
            return Response(result)
        else:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response(
            {'success': False, 'error': f'Test failed: {str(e)}'},
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
def dataset_paper_pdf(request, subject_id, qyear: int):
    """Generate a simple PDF for a given subject (slug) and Qyear from the CSV dataset.
    Optional query param: year=FY|SY|TY|Final Year to filter study year.
    """
    try:
        if not ANALYZER_AVAILABLE:
            return Response({'error': 'Analyzer not available'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        analyzer = get_analyzer()
        if not analyzer or not analyzer.is_ready or analyzer.df is None or analyzer.df.empty:
            return Response({'error': 'Dataset not ready'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        subject_name = subject_id.replace('-', ' ').title()
        study_year = request.query_params.get('year')

        # Filter rows
        df = analyzer.df.copy()
        df['subject_norm'] = df['subject'].astype(str).str.strip().str.lower()
        df = df[df['subject_norm'] == subject_name.strip().lower()]
        if study_year:
            df['study_year_norm'] = df['study_year'].astype(str).str.strip()
            df = df[df['study_year_norm'] == str(study_year).strip()]
        try:
            df['Qyear'] = pd.to_numeric(df['Qyear'], errors='coerce').astype('Int64')
            df = df.dropna(subset=['Qyear'])
        except Exception:
            pass
        df = df[df['Qyear'] == int(qyear)]

        if df.empty:
            return Response({'error': 'No questions found for requested paper'}, status=status.HTTP_404_NOT_FOUND)

        questions = df[['question_text', 'mark_weightage']].dropna().to_dict('records')

        # Try to generate PDF with reportlab
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
            from reportlab.lib.units import cm
            from io import BytesIO

            buffer = BytesIO()
            c = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            title = f"{subject_name} - {qyear}{f' ({study_year})' if study_year else ''}"
            c.setFont("Helvetica-Bold", 14)
            c.drawString(2*cm, height - 2*cm, title)
            c.setFont("Helvetica", 10)
            y = height - 3*cm
            qnum = 1
            for item in questions:
                text = str(item.get('question_text', ''))
                marks = int(pd.to_numeric(item.get('mark_weightage', 0), errors='coerce') or 0)
                line = f"{qnum}. ({marks} marks) {text}"
                # Wrap text roughly at 100 chars
                import textwrap
                wrapped = textwrap.wrap(line, width=95)
                for w in wrapped:
                    if y < 2*cm:
                        c.showPage()
                        c.setFont("Helvetica", 10)
                        y = height - 2*cm
                    c.drawString(2*cm, y, w)
                    y -= 0.6*cm
                y -= 0.2*cm
                qnum += 1

            c.showPage()
            c.save()
            pdf = buffer.getvalue()
            buffer.close()

            from django.http import HttpResponse
            resp = HttpResponse(pdf, content_type='application/pdf')
            filename = f"{subject_id}-{qyear}{f'-{study_year}' if study_year else ''}.pdf"
            resp['Content-Disposition'] = f'inline; filename="{filename}"'
            return resp
        except Exception as e:
            # Reportlab not installed or PDF generation failed
            return Response({
                'error': 'PDF generation unavailable. Install reportlab or check server logs.',
                'detail': str(e),
                'fallback': {
                    'subject': subject_name,
                    'qyear': qyear,
                    'year': study_year,
                    'questions': questions,
                }
            }, status=status.HTTP_501_NOT_IMPLEMENTED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def dataset_past_papers_all(request):
    """Build past papers (one per Qyear) for every subject from the CSV dataset.
    Query params:
      - branch: optional dataset branch code or frontend id
      - year: optional study year filter (FY|SY|TY|Final Year)
    Returns: { subjects: [ { subject, subject_id, papers: [...] } ] }
    """
    try:
        if not ANALYZER_AVAILABLE:
            return Response({'subjects': [], 'source': 'analyzer_not_available'})

        analyzer = get_analyzer()
        if not analyzer or not analyzer.is_ready or analyzer.df is None or analyzer.df.empty:
            return Response({'subjects': [], 'source': 'dataset_not_ready'})

        # Map optional branch id to dataset code
        branch_param = request.query_params.get('branch')
        year_filter = request.query_params.get('year')  # FY|SY|TY|Final Year
        branch_to_code = {
            'cse': 'CSE',
            'mech': 'ME',
            'entc': 'ENTC',
            'civil': 'CIVIL',
            'electrical': 'ELECTRICAL',
        }
        branch_code = branch_to_code.get(branch_param.lower() if branch_param else None, branch_param)

        # Resolve subjects from dataset with optional filters
        subjects = analyzer.get_subjects_from_csv(branch=branch_code, year=year_filter)
        results = []

        df = analyzer.df.copy()
        # Pre-normalize columns used for filtering
        df['subject_norm'] = df['subject'].astype(str).str.strip().str.lower()
        df['study_year_norm'] = df['study_year'].astype(str).str.strip()
        if branch_code:
            df['branch_norm'] = df['branch'].astype(str).str.strip().str.upper()
            df = df[df['branch_norm'] == str(branch_code).strip().upper()]

        for subj in subjects:
            sname = str(subj)
            sdf = df[df['subject_norm'] == sname.strip().lower()]
            if year_filter:
                sdf = sdf[sdf['study_year_norm'] == str(year_filter).strip()]
            if sdf.empty:
                continue

            # Group by Qyear using pure Python aggregation to avoid new imports
            by_year = {}
            for row in sdf.itertuples(index=False):
                try:
                    qy = int(getattr(row, 'Qyear'))
                except Exception:
                    # Skip rows with invalid year
                    continue
                qtext = str(getattr(row, 'question_text', '')).strip()
                try:
                    marks = float(getattr(row, 'mark_weightage', 0) or 0)
                except Exception:
                    marks = 0.0
                if qy not in by_year:
                    by_year[qy] = []
                by_year[qy].append({'question_text': qtext, 'mark_weightage': marks})

            papers = []
            for qyear, items in by_year.items():
                total_marks = int(sum((i.get('mark_weightage') or 0) for i in items))
                avg_marks = (sum((i.get('mark_weightage') or 0) for i in items) / max(1, len(items))) if items else 0.0
                if avg_marks <= 3:
                    difficulty = 'Easy'
                elif avg_marks <= 7:
                    difficulty = 'Medium'
                else:
                    difficulty = 'Hard'

                # Build paper object similar to dataset_past_papers
                subject_id = sname.lower().replace(' ', '-')
                questions = [{'question': i['question_text'], 'year': qyear, 'topic': None, 'marks': int(i.get('mark_weightage') or 0)} for i in items]
                paper_obj = {
                    'id': f"{subject_id}-{qyear}-{(year_filter or 'ALL').replace(' ', '').lower()}",
                    'title': f"{sname} {qyear}{f' - {year_filter}' if year_filter else ''}",
                    'description': f"Auto-generated from dataset: {len(questions)} questions",
                    'duration': '3 hours',
                    'totalMarks': total_marks,
                    'difficulty': difficulty,
                    'downloadCount': 0,
                    'sections': [],
                    'url': f"/api/dataset/papers/{subject_id}/{qyear}/pdf{f'?year={year_filter}' if year_filter else ''}",
                    'qyear': int(qyear),
                    'study_year': year_filter or None,
                    'questions': questions,
                }
                papers.append(paper_obj)

            papers = sorted(papers, key=lambda p: p['qyear'], reverse=True)
            results.append({'subject': sname, 'subject_id': sname.lower().replace(' ', '-'), 'papers': papers})

        return Response({'subjects': results, 'source': 'dataset'})
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
                'url': f"/api/dataset/papers/{subject_id}/{qyear}/pdf{f'?year={study_year}' if study_year else ''}",
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
            # Fallback to MongoDB
            try:
                # Get questions from MongoDB
                questions_mongo = mongodb_service.get_questions_by_subject(subject_id)
                
                # Group by difficulty
                easy = [{'question': q['text'], 'year': q.get('year', 2023), 'topic': q.get('topic', 'General'), 'marks': q.get('marks', 5)} 
                       for q in questions_mongo if q.get('difficulty') == 'easy']
                medium = [{'question': q['text'], 'year': q.get('year', 2023), 'topic': q.get('topic', 'General'), 'marks': q.get('marks', 5)} 
                         for q in questions_mongo if q.get('difficulty') == 'medium']
                hard = [{'question': q['text'], 'year': q.get('year', 2023), 'topic': q.get('topic', 'General'), 'marks': q.get('marks', 5)} 
                       for q in questions_mongo if q.get('difficulty') == 'hard']
                
                return Response({
                    'easy': easy,
                    'medium': medium,
                    'hard': hard,
                    'source': 'mongodb'
                })
            except Subject.DoesNotExist:
                return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
        
        analyzer = get_analyzer()
        
        # Resolve slug back to exact subject name from dataset using the same slug function
        # Fallback to title-cased hyphen replacement if not found
        try:
            all_subjects = analyzer.get_subjects_from_csv()
        except Exception:
            all_subjects = []
        slug_map = {slugify_subject(s): s for s in all_subjects}
        subject_name = slug_map.get(subject_id, subject_id.replace('-', ' ').title())
        
        if not analyzer or not analyzer.is_ready:
            # Fallback to MongoDB
            try:
                # Get questions from MongoDB
                questions_mongo = mongodb_service.get_questions_by_subject(subject_id)
                
                # Group by difficulty
                easy = [{'question': q['text'], 'year': q.get('year', 2023), 'topic': q.get('topic', 'General'), 'marks': q.get('marks', 5)} 
                       for q in questions_mongo if q.get('difficulty') == 'easy']
                medium = [{'question': q['text'], 'year': q.get('year', 2023), 'topic': q.get('topic', 'General'), 'marks': q.get('marks', 5)} 
                         for q in questions_mongo if q.get('difficulty') == 'medium']
                hard = [{'question': q['text'], 'year': q.get('year', 2023), 'topic': q.get('topic', 'General'), 'marks': q.get('marks', 5)} 
                       for q in questions_mongo if q.get('difficulty') == 'hard']
                
                return Response({
                    'easy': easy,
                    'medium': medium,
                    'hard': hard,
                    'source': 'mongodb'
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


@api_view(['POST'])
@permission_classes([AllowAny])
def ask_ai(request):
    """
    AI-powered question answering endpoint using Gemini API
    """
    try:
        question = request.data.get('question', '').strip()
        subject_id = request.data.get('subject_id', '')
        difficulty = request.data.get('difficulty', '')
        marks = request.data.get('marks', '')
        
        if not question:
            return Response(
                {'success': False, 'error': 'Question is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get subject context if subject_id is provided
        subject_context = None
        if subject_id:
            try:
                # Try to get subject from database first (only if it's a numeric ID)
                if subject_id.isdigit():
                    subject = Subject.objects.get(id=int(subject_id))
                    subject_context = f"{subject.name} ({subject.code})"
                else:
                    # If it's a string ID, use it as context
                    subject_context = subject_id.replace('-', ' ').title()
            except (Subject.DoesNotExist, ValueError):
                # If not in database or not numeric, use the subject_id as context
                subject_context = subject_id.replace('-', ' ').title()
        
        # Generate AI answer
        result = generate_ai_answer(
            question=question,
            subject_context=subject_context,
            difficulty=difficulty,
            marks=marks
        )
        
        if result['success']:
            return Response({
                'success': True,
                'answer': result['answer'],
                'model': result.get('model', 'gemini-flash-latest'),
                'question': question,
                'subject_context': subject_context
            })
        else:
            return Response({
                'success': False,
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response(
            {'success': False, 'error': f'Server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def test_ai_connection(request):
    """
    Test endpoint to verify AI service connection
    """
    try:
        result = test_gemini_connection()
        if result['success']:
            return Response(result)
        else:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response(
            {'success': False, 'error': f'Test failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
