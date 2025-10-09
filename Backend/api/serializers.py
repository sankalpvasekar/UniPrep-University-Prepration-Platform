from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Branch, Subject, Question, Paper, Video, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    branch_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'branch', 'branch_id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'first_name', 'last_name']
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        
        # Create user profile without branch
        UserProfile.objects.create(user=user, branch=None)
        
        return user


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'difficulty', 'marks']


class PaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paper
        fields = ['id', 'title', 'year', 'semester', 'file_url']


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'url', 'duration', 'thumbnail']


class SubjectSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    papers = PaperSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'description', 'icon', 'questions', 'papers', 'videos']


class SubjectListSerializer(serializers.ModelSerializer):
    """Lighter serializer for listing subjects without nested data"""
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'description', 'icon']


class BranchSerializer(serializers.ModelSerializer):
    subjects = SubjectListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Branch
        fields = ['id', 'name', 'description', 'icon', 'subjects']


class BranchListSerializer(serializers.ModelSerializer):
    """Lighter serializer for listing branches"""
    subject_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Branch
        fields = ['id', 'name', 'description', 'icon', 'subject_count']
    
    def get_subject_count(self, obj):
        return obj.subjects.count()
