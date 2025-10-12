"""
Script to seed initial data for UniPrep backend
Run with: python manage.py shell < seed_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uniprep_backend.settings')
django.setup()

from api.models import Branch, Subject, Question, Paper, Video
from django.contrib.auth.models import User

# Clear existing data
print("Clearing existing data...")
Question.objects.all().delete()
Paper.objects.all().delete()
Video.objects.all().delete()
Subject.objects.all().delete()
Branch.objects.all().delete()

# Create branches
print("Creating branches...")
branches_data = [
    {'id': 'cse', 'name': 'Computer Science Engineering', 'icon': '💻', 'description': 'Computer Science and Engineering'},
    {'id': 'ece', 'name': 'Electronics & Communication Engineering', 'icon': '⚡', 'description': 'Electronics and Communication Engineering'},
    {'id': 'mech', 'name': 'Mechanical Engineering', 'icon': '⚙️', 'description': 'Mechanical Engineering'},
    {'id': 'civil', 'name': 'Civil Engineering', 'icon': '🏗️', 'description': 'Civil Engineering'},
]

branches = {}
for branch_data in branches_data:
    branch = Branch.objects.create(**branch_data)
    branches[branch_data['id']] = branch
    print(f"Created branch: {branch.name}")

# Create subjects for CSE with real YouTube videos
print("\nCreating CSE subjects...")

# Data Structures
subject = Subject.objects.create(branch=branches['cse'], code='CS101', name='Data Structures', icon='🌳')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Explain arrays, linked lists, and their time complexities", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Implement a binary search tree with insertion and deletion", difficulty='medium', marks=10)
Question.objects.create(subject=subject, text="Design a data structure for LRU cache implementation", difficulty='hard', marks=15)

Paper.objects.create(subject=subject, title="CS101 Mid-Term Exam 2023", year=2023, semester="Fall", file_url="https://example.com/papers/cs101-mid.pdf")
Paper.objects.create(subject=subject, title="CS101 Final Exam 2023", year=2023, semester="Fall", file_url="https://example.com/papers/cs101-final.pdf")

Video.objects.create(subject=subject, title="Data Structures Full Course - freeCodeCamp", url="https://www.youtube.com/watch?v=RBSGKlAvoiM", duration="2:30:00")
Video.objects.create(subject=subject, title="Data Structures Easy to Advanced - William Fiset", url="https://www.youtube.com/watch?v=Qmt0QwzEmh0", duration="10:15:00")
Video.objects.create(subject=subject, title="Arrays and Linked Lists - CS50", url="https://www.youtube.com/watch?v=5nsKtQuT6E8", duration="1:45:00")

# Algorithms
subject = Subject.objects.create(branch=branches['cse'], code='CS102', name='Algorithms', icon='🔍')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Explain sorting algorithms and their complexities", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Solve problems using dynamic programming", difficulty='medium', marks=10)
Question.objects.create(subject=subject, text="Design an efficient algorithm for graph traversal", difficulty='hard', marks=15)

Paper.objects.create(subject=subject, title="CS102 Mid-Term Exam 2023", year=2023, semester="Fall", file_url="https://example.com/papers/cs102-mid.pdf")

Video.objects.create(subject=subject, title="Algorithms Course - freeCodeCamp", url="https://www.youtube.com/watch?v=8hly31xKli0", duration="5:00:00")
Video.objects.create(subject=subject, title="Dynamic Programming - Abdul Bari", url="https://www.youtube.com/watch?v=nqowUJzG-iM", duration="1:15:00")
Video.objects.create(subject=subject, title="Graph Algorithms - William Fiset", url="https://www.youtube.com/watch?v=DgXR2OWQnLc", duration="3:30:00")

# Database Management
subject = Subject.objects.create(branch=branches['cse'], code='CS103', name='Database Management', icon='🗄️')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Explain normalization and its types", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Write complex SQL queries with joins", difficulty='medium', marks=10)
Question.objects.create(subject=subject, text="Design a database schema for e-commerce system", difficulty='hard', marks=15)

Paper.objects.create(subject=subject, title="CS103 Mid-Term Exam 2023", year=2023, semester="Fall", file_url="https://example.com/papers/cs103-mid.pdf")

Video.objects.create(subject=subject, title="Database Design Course - freeCodeCamp", url="https://www.youtube.com/watch?v=ztHopE5Wnpc", duration="8:30:00")
Video.objects.create(subject=subject, title="SQL Tutorial - Programming with Mosh", url="https://www.youtube.com/watch?v=7S_tz1z_5bA", duration="3:00:00")
Video.objects.create(subject=subject, title="Database Normalization - Studytonight", url="https://www.youtube.com/watch?v=xoTyrdT9SZI", duration="45:00")

# Operating Systems
subject = Subject.objects.create(branch=branches['cse'], code='CS104', name='Operating Systems', icon='🖥️')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Explain process scheduling algorithms", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Solve deadlock prevention problems", difficulty='medium', marks=10)
Question.objects.create(subject=subject, text="Design a memory management system", difficulty='hard', marks=15)

Paper.objects.create(subject=subject, title="CS104 Mid-Term Exam 2023", year=2023, semester="Fall", file_url="https://example.com/papers/cs104-mid.pdf")

Video.objects.create(subject=subject, title="Operating Systems - Neso Academy", url="https://www.youtube.com/watch?v=vBURTt97EkA", duration="10:00:00")
Video.objects.create(subject=subject, title="OS Full Course - Gate Smashers", url="https://www.youtube.com/watch?v=bkSWJJZNgf8", duration="12:00:00")
Video.objects.create(subject=subject, title="Process Scheduling - Jenny's Lectures", url="https://www.youtube.com/watch?v=EWkQl0n0w5M", duration="1:30:00")

# Computer Networks
subject = Subject.objects.create(branch=branches['cse'], code='CS105', name='Computer Networks', icon='🌐')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Explain OSI and TCP/IP models", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Analyze routing protocols", difficulty='medium', marks=10)
Question.objects.create(subject=subject, text="Design a network topology for enterprise", difficulty='hard', marks=15)

Paper.objects.create(subject=subject, title="CS105 Mid-Term Exam 2023", year=2023, semester="Fall", file_url="https://example.com/papers/cs105-mid.pdf")

Video.objects.create(subject=subject, title="Computer Networks Course - freeCodeCamp", url="https://www.youtube.com/watch?v=qiQR5rTSshw", duration="9:00:00")
Video.objects.create(subject=subject, title="Networking Fundamentals - Network Direction", url="https://www.youtube.com/watch?v=cNwEVYkx2Kk", duration="2:00:00")
Video.objects.create(subject=subject, title="TCP/IP Model Explained - PowerCert", url="https://www.youtube.com/watch?v=OTwp3xtd4dg", duration="12:00")

# Create subjects for ECE
print("\nCreating ECE subjects...")

# Digital Electronics
subject = Subject.objects.create(branch=branches['ece'], code='EC101', name='Digital Electronics', icon='🔌')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="What are the fundamentals of Digital Electronics?", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Analyze logic gates and Boolean algebra", difficulty='medium', marks=10)

Video.objects.create(subject=subject, title="Digital Electronics Full Course - Neso Academy", url="https://www.youtube.com/watch?v=M0mx8S05v60", duration="15:00:00")
Video.objects.create(subject=subject, title="Logic Gates Tutorial - The Organic Chemistry Tutor", url="https://www.youtube.com/watch?v=95kv5BF2Z9E", duration="1:30:00")
Video.objects.create(subject=subject, title="Digital Logic Design - Gate Lectures", url="https://www.youtube.com/watch?v=VPw9vPN-3ac", duration="8:00:00")

# Signal Processing
subject = Subject.objects.create(branch=branches['ece'], code='EC102', name='Signal Processing', icon='📡')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Explain Fourier Transform and its applications", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Analyze digital filters and their design", difficulty='medium', marks=10)

Video.objects.create(subject=subject, title="Digital Signal Processing - IIT Madras", url="https://www.youtube.com/watch?v=hVOA8VtKLgk", duration="12:00:00")
Video.objects.create(subject=subject, title="Signals and Systems - MIT OpenCourseWare", url="https://www.youtube.com/watch?v=s4f-gJXSPVE", duration="10:00:00")

# Communication Systems
subject = Subject.objects.create(branch=branches['ece'], code='EC103', name='Communication Systems', icon='📻')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Explain modulation techniques", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Analyze wireless communication protocols", difficulty='medium', marks=10)

Video.objects.create(subject=subject, title="Communication Systems - Neso Academy", url="https://www.youtube.com/watch?v=VLbKRv5F7-s", duration="10:00:00")
Video.objects.create(subject=subject, title="Analog and Digital Communication - Gate Academy", url="https://www.youtube.com/watch?v=3QnD2c4Xovk", duration="8:00:00")

# Create subjects for MECH
print("\nCreating MECH subjects...")

# Thermodynamics
subject = Subject.objects.create(branch=branches['mech'], code='ME101', name='Thermodynamics', icon='🔥')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Describe the basic principles of Thermodynamics", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Analyze heat engines and refrigeration cycles", difficulty='medium', marks=10)

Video.objects.create(subject=subject, title="Thermodynamics Full Course - MIT OpenCourseWare", url="https://www.youtube.com/watch?v=7XfOHrNT0Jg", duration="10:00:00")
Video.objects.create(subject=subject, title="Engineering Thermodynamics - NPTEL", url="https://www.youtube.com/watch?v=ttz4EGcmFwk", duration="12:00:00")

# Fluid Mechanics
subject = Subject.objects.create(branch=branches['mech'], code='ME102', name='Fluid Mechanics', icon='💧')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Explain fluid properties and flow types", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Solve problems on Bernoulli's equation", difficulty='medium', marks=10)

Video.objects.create(subject=subject, title="Fluid Mechanics - The Efficient Engineer", url="https://www.youtube.com/watch?v=9TdRJEWQILk", duration="5:00:00")
Video.objects.create(subject=subject, title="Fluid Mechanics Course - NPTEL", url="https://www.youtube.com/watch?v=pNMroWLSG_8", duration="10:00:00")

# Manufacturing Processes
subject = Subject.objects.create(branch=branches['mech'], code='ME103', name='Manufacturing Processes', icon='🏭')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Describe various manufacturing processes", difficulty='easy', marks=5)

Video.objects.create(subject=subject, title="Manufacturing Processes - NPTEL", url="https://www.youtube.com/watch?v=VR9gDThWzds", duration="8:00:00")

# Create subjects for CIVIL
print("\nCreating CIVIL subjects...")

# Structural Analysis
subject = Subject.objects.create(branch=branches['civil'], code='CE101', name='Structural Analysis', icon='🏢')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Explain the core concepts of Structural Analysis", difficulty='easy', marks=5)
Question.objects.create(subject=subject, text="Analyze beams and frames using methods", difficulty='medium', marks=10)

Video.objects.create(subject=subject, title="Structural Analysis - The Constructor", url="https://www.youtube.com/watch?v=BjS7ZXnJqvU", duration="6:00:00")
Video.objects.create(subject=subject, title="Structural Engineering - NPTEL", url="https://www.youtube.com/watch?v=pQp7JhJdzLs", duration="10:00:00")

# Concrete Technology
subject = Subject.objects.create(branch=branches['civil'], code='CE102', name='Concrete Technology', icon='🧱')
print(f"Created subject: {subject.name}")

Question.objects.create(subject=subject, text="Explain properties of concrete and mix design", difficulty='easy', marks=5)

Video.objects.create(subject=subject, title="Concrete Technology - NPTEL", url="https://www.youtube.com/watch?v=cCHHJqJZE1E", duration="8:00:00")
Video.objects.create(subject=subject, title="Concrete Mix Design - Civil Engineering", url="https://www.youtube.com/watch?v=KqLJdHZEHxc", duration="2:00:00")

# Create demo user
print("\nCreating demo user...")
try:
    user = User.objects.create_user(
        username='user@test.com',
        email='user@test.com',
        password='123456',
        first_name='Demo',
        last_name='User'
    )
    from api.models import UserProfile
    UserProfile.objects.create(user=user, branch=branches['cse'])
    print("Created demo user: user@test.com / 123456")
except:
    print("Demo user already exists")

print("\n✅ Data seeding completed successfully!")
print(f"Total Branches: {Branch.objects.count()}")
print(f"Total Subjects: {Subject.objects.count()}")
print(f"Total Questions: {Question.objects.count()}")
print(f"Total Papers: {Paper.objects.count()}")
print(f"Total Videos: {Video.objects.count()}")
