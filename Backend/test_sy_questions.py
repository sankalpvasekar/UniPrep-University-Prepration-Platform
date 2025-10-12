import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uniprep_backend.settings')
django.setup()

from api.uniprep_analyzer import get_analyzer

print("Testing SY questions...")
analyzer = get_analyzer()

if analyzer.is_ready:
    # Test SY subjects
    subjects = analyzer.get_subjects_from_csv('CSE', 'SY')
    print(f"\nSY Subjects: {subjects}")
    
    # Test analyzing an SY subject
    if subjects:
        test_subject = subjects[0]
        print(f"\nAnalyzing subject: {test_subject}")
        result = analyzer.analyze_subject(test_subject)
        
        print(f"\nResults:")
        print(f"  Easy questions: {len(result['easy'])}")
        print(f"  Medium questions: {len(result['medium'])}")
        print(f"  Hard questions: {len(result['hard'])}")
        
        if result['easy']:
            print(f"\nSample easy question:")
            print(f"  {result['easy'][0]['question'][:100]}...")
else:
    print("Analyzer not ready!")
