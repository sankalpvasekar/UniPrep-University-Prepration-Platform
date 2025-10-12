from django.contrib import admin
from .models import Branch, Subject, Question, Paper, Video, UserProfile


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'icon']
    search_fields = ['name']


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'branch', 'icon']
    list_filter = ['branch']
    search_fields = ['name', 'code']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['subject', 'difficulty', 'marks', 'text_preview']
    list_filter = ['difficulty', 'subject__branch']
    search_fields = ['text']
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Question'


@admin.register(Paper)
class PaperAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'year', 'semester']
    list_filter = ['year', 'semester', 'subject__branch']
    search_fields = ['title']


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'duration']
    list_filter = ['subject__branch']
    search_fields = ['title']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'branch']
    list_filter = ['branch']
    search_fields = ['user__username', 'user__email']
