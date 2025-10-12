#!/usr/bin/env python
"""
Test script to verify CSV loading and analyzer functionality
"""
import os
import sys

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(__file__))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uniprep_backend.settings')
import django
django.setup()

from api.uniprep_analyzer import get_analyzer

def test_analyzer():
    print("="*80)
    print("Testing UniPrep Analyzer")
    print("="*80)
    
    # Get analyzer instance
    print("\n1. Getting analyzer instance...")
    analyzer = get_analyzer()
    
    if analyzer is None:
        print("❌ ERROR: Analyzer is None (import failed)")
        return
    
    print(f"✓ Analyzer instance created")
    print(f"✓ Is ready: {analyzer.is_ready}")
    print(f"✓ CSV path: {analyzer.file_path}")
    
    # Check if CSV file exists
    print("\n2. Checking CSV file...")
    if os.path.exists(analyzer.file_path):
        print(f"✓ CSV file exists at: {analyzer.file_path}")
        file_size = os.path.getsize(analyzer.file_path)
        print(f"✓ File size: {file_size} bytes")
    else:
        print(f"❌ ERROR: CSV file not found at: {analyzer.file_path}")
        return
    
    # Check if data is loaded
    print("\n3. Checking loaded data...")
    if analyzer.df is not None and not analyzer.df.empty:
        print(f"✓ Data loaded successfully")
        print(f"✓ Total rows: {len(analyzer.df)}")
        print(f"✓ Columns: {list(analyzer.df.columns)}")
        
        # Show sample data
        print("\n4. Sample data (first 3 rows):")
        print(analyzer.df.head(3))
        
        # Get unique branches
        print("\n5. Getting branches from CSV...")
        branches = analyzer.get_branches_from_csv()
        print(f"✓ Branches found: {branches}")
        
        # Get unique years
        print("\n6. Getting years from CSV...")
        years = analyzer.get_years_from_csv()
        print(f"✓ Years found: {years}")
        
        # Get subjects for CSE + FY
        print("\n7. Getting subjects for CSE + FY...")
        subjects = analyzer.get_subjects_from_csv(branch='CSE', year='FY')
        print(f"✓ Subjects found: {subjects}")
        print(f"✓ Total subjects: {len(subjects)}")
        
        # Test analysis for first subject
        if subjects:
            test_subject = subjects[0]
            print(f"\n8. Testing AI analysis for '{test_subject}'...")
            try:
                result = analyzer.analyze_subject(test_subject)
                print(f"✓ Analysis completed")
                print(f"  - Easy questions: {len(result.get('easy', []))}")
                print(f"  - Medium questions: {len(result.get('medium', []))}")
                print(f"  - Hard questions: {len(result.get('hard', []))}")
            except Exception as e:
                print(f"❌ Analysis failed: {e}")
        
    else:
        print("❌ ERROR: No data loaded from CSV")
        print(f"   DataFrame is None: {analyzer.df is None}")
        if analyzer.df is not None:
            print(f"   DataFrame is empty: {analyzer.df.empty}")
    
    print("\n" + "="*80)
    print("Test Complete")
    print("="*80)

if __name__ == '__main__':
    test_analyzer()
