from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import Branch, Subject, Question, Paper, Video, UserProfile
from .serializers import (
    BranchSerializer, BranchListSerializer, SubjectSerializer, 
    SubjectListSerializer, QuestionSerializer, PaperSerializer, 
    VideoSerializer, RegisterSerializer, UserSerializer, UserProfileSerializer
)


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
