import pandas as pd

df = pd.read_csv(r'data/CSE_UniPrep (1) (3).csv')

print("=" * 60)
print("DATASET ANALYSIS")
print("=" * 60)

print(f"\nTotal records: {len(df)}")
print(f"\nUnique branches: {df['branch'].unique()}")
print(f"Unique years: {df['year'].unique()}")

for branch in df['branch'].unique():
    print(f"\n{'='*60}")
    print(f"BRANCH: {branch}")
    print(f"{'='*60}")
    
    for year in ['FY', 'SY', 'TY']:
        subjects = df[(df['branch']==branch) & (df['year']==year)]['subject'].unique()
        print(f"\n{year} Subjects ({len(subjects)}):")
        for subj in subjects[:10]:  # Show first 10
            print(f"  - {subj}")
