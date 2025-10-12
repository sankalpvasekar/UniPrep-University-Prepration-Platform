# Data Directory

## CSV File Location

Place your CSV file here: `CSE_UniPrep.csv`

### Required CSV Format:

The CSV must have these columns:
- `branch` - Engineering branch (e.g., 'CSE', 'ECE', 'MECH')
- `study_year` - Year of study (e.g., 'SY', 'TY', 'FY')
- `subject` - Subject name (e.g., 'Data Structures', 'Operating Systems')
- `mark_weightage` - Marks for the question (numeric)
- `Qyear` - Year when question was asked (numeric, e.g., 2023)
- `question_text` - The actual question text

### Example CSV Structure:

```csv
branch,study_year,subject,mark_weightage,Qyear,question_text
CSE,SY,Data Structures,5,2023,What is a stack and explain its basic operations?
CSE,SY,Data Structures,7,2022,Explain arrays with example and time complexity of operations.
CSE,SY,Operating Systems,10,2023,Explain deadlock prevention techniques
```

**Place your CSV file in this directory as: `CSE_UniPrep.csv`**
