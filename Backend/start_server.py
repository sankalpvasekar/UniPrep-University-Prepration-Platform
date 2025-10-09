"""
Start Django server with pre-loaded analyzer
This ensures the AI models are loaded before the server starts
"""
import os
import django
import sys

# Fix encoding for Windows
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uniprep_backend.settings')
django.setup()

# Pre-load the analyzer
print("=" * 60)
print("PRE-LOADING AI ANALYZER...")
print("=" * 60)

try:
    from api.uniprep_analyzer import get_analyzer
    analyzer = get_analyzer()
    
    if analyzer.is_ready:
        print(f"\n[OK] Analyzer is ready!")
        print(f"[OK] Total records loaded: {len(analyzer.df)}")
        subjects = analyzer.get_subjects_from_csv('CSE', 'FY')
        print(f"[OK] CSE FY Subjects: {subjects}")
    else:
        print("\n[ERROR] Analyzer failed to initialize")
        sys.exit(1)
        
except Exception as e:
    print(f"\n[ERROR] Error loading analyzer: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("STARTING DJANGO SERVER...")
print("=" * 60 + "\n")

# Start the server
from django.core.management import execute_from_command_line
execute_from_command_line(['manage.py', 'runserver', '--noreload'])
