import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uniprep_backend.settings')
django.setup()

from api.uniprep_analyzer import get_analyzer

print("Testing analyzer...")
analyzer = get_analyzer()
print(f"Analyzer ready: {analyzer.is_ready}")

if analyzer.is_ready:
    subjects = analyzer.get_subjects_from_csv('CSE', 'FY')
    print(f"\nSubjects for CSE FY: {len(subjects)}")
    for subject in subjects:
        print(f"  - {subject}")
else:
    print("Analyzer not ready!")
