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
# Import analyzer with error handling
try:
    from .uniprep_analyzer import get_analyzer
    ANALYZER_AVAILABLE = True
except ImportError as e:
    print(f"Warning: AI Analyzer not available: {e}")
    ANALYZER_AVAILABLE = False
    def get_analyzer():
        return None


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
        
        branch = request.query_params.get('branch', None)
        year = request.query_params.get('year', None)
        
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
        categorized_questions = analyzer.analyze_subject(subject_name)
        
        return Response({
            **categorized_questions,
            'source': 'ai_analyzer'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
