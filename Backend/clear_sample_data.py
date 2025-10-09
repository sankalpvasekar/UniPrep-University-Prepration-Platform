#!/usr/bin/env python
"""
Script to clear sample data from UniPrep database
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uniprep_backend.settings')
django.setup()

from api.models import Branch, Subject, Question, Paper, Video

def clear_sample_data():
    print("Clearing sample data...")
    
    # Delete all data
    print("\n1. Deleting Videos...")
    count = Video.objects.all().delete()[0]
    print(f"   Deleted {count} videos")
    
    print("\n2. Deleting Papers...")
    count = Paper.objects.all().delete()[0]
    print(f"   Deleted {count} papers")
    
    print("\n3. Deleting Questions...")
    count = Question.objects.all().delete()[0]
    print(f"   Deleted {count} questions")
    
    print("\n4. Deleting Subjects...")
    count = Subject.objects.all().delete()[0]
    print(f"   Deleted {count} subjects")
    
    print("\n5. Deleting Branches...")
    count = Branch.objects.all().delete()[0]
    print(f"   Deleted {count} branches")
    
    print("\n✅ All sample data cleared successfully!")
    
    # Show current counts
    print(f"\nCurrent database status:")
    print(f"  - Branches: {Branch.objects.count()}")
    print(f"  - Subjects: {Subject.objects.count()}")
    print(f"  - Questions: {Question.objects.count()}")
    print(f"  - Papers: {Paper.objects.count()}")
    print(f"  - Videos: {Video.objects.count()}")

if __name__ == '__main__':
    clear_sample_data()
