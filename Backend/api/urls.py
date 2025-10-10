from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .chatbot import chat_with_ai

router = DefaultRouter()
router.register(r'branches', views.BranchViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'questions', views.QuestionViewSet)
router.register(r'papers', views.PaperViewSet)
router.register(r'videos', views.VideoViewSet)

urlpatterns = [
    # Auth endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/user/', views.current_user, name='current_user'),
    
    # Dataset endpoints
    path('dataset/subjects/', views.dataset_subjects, name='dataset_subjects'),
    path('dataset/years/', views.dataset_years, name='dataset_years'),
    path('dataset/branches/', views.dataset_branches, name='dataset_branches'),
    path('ai-questions/<str:subject_id>/', views.ai_questions, name='ai_questions'),
    path('ai-questions/<str:subject_id>', views.ai_questions),  # tolerate missing slash
    path('concepts/<str:subject_id>/', views.concepts, name='concepts'),
    path('concepts/<str:subject_id>', views.concepts),  # tolerate missing slash
    
    # Chatbot endpoint
    path('chat/', chat_with_ai, name='chat'),
    
    # API endpoints
    path('', include(router.urls)),
]
