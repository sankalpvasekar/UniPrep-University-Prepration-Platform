from django.db import models
from django.contrib.auth.models import User


class Branch(models.Model):
    """Engineering branch model"""
    id = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='📚')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Branches"


class Subject(models.Model):
    """Subject model"""
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='📖')
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Question(models.Model):
    """Question model for probable questions"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    marks = models.IntegerField(default=5)
    
    def __str__(self):
        return f"{self.subject.code} - {self.difficulty} - {self.text[:50]}"


class Paper(models.Model):
    """Past paper model"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='papers')
    title = models.CharField(max_length=200)
    year = models.IntegerField()
    semester = models.CharField(max_length=20)
    file_url = models.URLField()
    
    def __str__(self):
        return f"{self.subject.code} - {self.year} - {self.semester}"
    
    class Meta:
        ordering = ['-year']


class Video(models.Model):
    """Reference video model"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    url = models.URLField()
    duration = models.CharField(max_length=20)
    thumbnail = models.URLField(blank=True)
    
    def __str__(self):
        return f"{self.subject.code} - {self.title}"


class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.branch}"


class DatasetUpload(models.Model):
    """Virtual model to expose an 'Upload Dataset' entry in Django admin.
    No database table is created (managed = False).
    """
    class Meta:
        managed = False
        verbose_name = "Upload Dataset"
        verbose_name_plural = "Upload Dataset"
