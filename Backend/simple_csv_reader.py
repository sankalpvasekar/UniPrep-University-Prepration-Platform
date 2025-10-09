import pandas as pd
import os

csv_path = r'C:\Users\DDR\Documents\Django\CDT\uniprep_final-\Backend\data\CSE_UniPrep (1).csv'

print("Testing CSV file...")
print(f"CSV path: {csv_path}")
print(f"File exists: {os.path.exists(csv_path)}")

if os.path.exists(csv_path):
    df = pd.read_csv(csv_path)
    print(f"\n✓ Loaded {len(df)} rows")
    print(f"✓ Columns: {list(df.columns)}")
    
    # Get unique branches
    branches = df['branch'].unique()
    print(f"\n✓ Branches: {list(branches)}")
    
    # Get unique years
    years = df['year'].unique()
    print(f"✓ Years: {list(years)}")
    
    # Get subjects for CSE + FY
    cse_fy = df[(df['branch'] == 'CSE') & (df['year'] == 'FY')]
    subjects = cse_fy['subject'].unique()
    print(f"\n✓ Subjects for CSE + FY: {list(subjects)}")
    print(f"✓ Total questions for CSE + FY: {len(cse_fy)}")
else:
    print("❌ CSV file not found!")
