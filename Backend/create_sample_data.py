#!/usr/bin/env python
"""
Script to create sample data for UniPrep
Run: python create_sample_data.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uniprep_backend.settings')
django.setup()

from api.models import Branch, Subject, Question, Paper, Video

def create_sample_data():
    print("Creating sample data...")
    
    # Create Branches
    print("\n1. Creating Branches...")
    branches_data = [
        {'id': 'cse', 'name': 'Computer Science Engineering', 'description': 'Software and Computing', 'icon': '💻'},
        {'id': 'ece', 'name': 'Electronics & Communication Engineering', 'description': 'Electronics and Communication', 'icon': '⚡'},
        {'id': 'mech', 'name': 'Mechanical Engineering', 'description': 'Machines and Manufacturing', 'icon': '🔧'},
        {'id': 'civil', 'name': 'Civil Engineering', 'description': 'Construction and Infrastructure', 'icon': '🏗️'},
    ]
    
    for branch_data in branches_data:
        branch, created = Branch.objects.get_or_create(
            id=branch_data['id'],
            defaults=branch_data
        )
        if created:
            print(f"   ✓ Created: {branch.name}")
        else:
            print(f"   - Already exists: {branch.name}")
    
    # Create Subjects for CSE
    print("\n2. Creating Subjects...")
    cse = Branch.objects.get(id='cse')
    
    subjects_data = [
        {'branch': cse, 'name': 'Data Structures', 'code': 'CS201', 'description': 'Arrays, Trees, Graphs, Algorithms', 'icon': '🌳'},
        {'branch': cse, 'name': 'Operating Systems', 'code': 'CS202', 'description': 'Process and Memory Management', 'icon': '⚙️'},
        {'branch': cse, 'name': 'Database Management', 'code': 'CS203', 'description': 'SQL and Database Design', 'icon': '🗄️'},
        {'branch': cse, 'name': 'Computer Networks', 'code': 'CS204', 'description': 'TCP/IP, Routing, Protocols', 'icon': '🌐'},
    ]
    
    subjects = []
    for subject_data in subjects_data:
        subject, created = Subject.objects.get_or_create(
            code=subject_data['code'],
            defaults=subject_data
        )
        subjects.append(subject)
        if created:
            print(f"   ✓ Created: {subject.name}")
        else:
            print(f"   - Already exists: {subject.name}")
    
    # Create Questions
    print("\n3. Creating Questions...")
    ds = subjects[0]  # Data Structures
    os_subject = subjects[1]  # Operating Systems
    
    questions_data = [
        {'subject': ds, 'text': 'Explain Binary Search Tree and its operations', 'difficulty': 'medium', 'marks': 5},
        {'subject': ds, 'text': 'What is time complexity? Explain with examples', 'difficulty': 'easy', 'marks': 3},
        {'subject': ds, 'text': 'Implement a stack using linked list', 'difficulty': 'medium', 'marks': 7},
        {'subject': os_subject, 'text': 'Explain deadlock prevention techniques', 'difficulty': 'hard', 'marks': 10},
        {'subject': os_subject, 'text': 'What is process scheduling?', 'difficulty': 'easy', 'marks': 3},
    ]
    
    for q_data in questions_data:
        question, created = Question.objects.get_or_create(
            subject=q_data['subject'],
            text=q_data['text'],
            defaults=q_data
        )
        if created:
            print(f"   ✓ Created question: {question.text[:50]}...")
    
    # Create Papers
    print("\n4. Creating Past Papers...")
    papers_data = [
        {'subject': ds, 'title': 'Data Structures Mid-Term 2023', 'year': 2023, 'semester': 'Fall', 'file_url': 'https://example.com/ds-midterm-2023.pdf'},
        {'subject': ds, 'title': 'Data Structures Final 2023', 'year': 2023, 'semester': 'Spring', 'file_url': 'https://example.com/ds-final-2023.pdf'},
        {'subject': os_subject, 'title': 'Operating Systems Mid-Term 2023', 'year': 2023, 'semester': 'Fall', 'file_url': 'https://example.com/os-midterm-2023.pdf'},
    ]
    
    for p_data in papers_data:
        paper, created = Paper.objects.get_or_create(
            subject=p_data['subject'],
            title=p_data['title'],
            defaults=p_data
        )
        if created:
            print(f"   ✓ Created paper: {paper.title}")
    
    # Create Videos
    print("\n5. Creating Video Resources...")
    videos_data = [
        {'subject': ds, 'title': 'Introduction to Data Structures', 'url': 'https://youtube.com/watch?v=example1', 'duration': '45:30'},
        {'subject': ds, 'title': 'Binary Trees Explained', 'url': 'https://youtube.com/watch?v=example2', 'duration': '38:15'},
        {'subject': os_subject, 'title': 'Process Scheduling Algorithms', 'url': 'https://youtube.com/watch?v=example3', 'duration': '52:20'},
    ]
    
    for v_data in videos_data:
        video, created = Video.objects.get_or_create(
            subject=v_data['subject'],
            title=v_data['title'],
            defaults=v_data
        )
        if created:
            print(f"   ✓ Created video: {video.title}")
    
    print("\n✅ Sample data created successfully!")
    print(f"\nSummary:")
    print(f"  - Branches: {Branch.objects.count()}")
    print(f"  - Subjects: {Subject.objects.count()}")
    print(f"  - Questions: {Question.objects.count()}")
    print(f"  - Papers: {Paper.objects.count()}")
    print(f"  - Videos: {Video.objects.count()}")

if __name__ == '__main__':
    create_sample_data()
