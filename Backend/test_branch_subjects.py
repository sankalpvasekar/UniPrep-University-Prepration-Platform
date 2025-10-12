import requests

branches = ['cse', 'mech', 'entc', 'civil', 'electrical']
years = ['FY', 'SY', 'TY']

print("=" * 80)
print("TESTING BRANCH-SPECIFIC SUBJECT LOADING")
print("=" * 80)

for branch in branches:
    print(f"\n{'='*80}")
    print(f"BRANCH: {branch.upper()}")
    print(f"{'='*80}")
    
    for year in years:
        try:
            url = f'http://127.0.0.1:8000/api/dataset/subjects/?branch={branch}&year={year}'
            r = requests.get(url, timeout=10)
            data = r.json()
            
            subjects = data.get('subjects', [])
            print(f"\n{year} - {len(subjects)} subjects:")
            for s in subjects[:5]:  # Show first 5
                print(f"  - {s['name']}")
            if len(subjects) > 5:
                print(f"  ... and {len(subjects) - 5} more")
                
        except Exception as e:
            print(f"\n{year} - ERROR: {e}")
