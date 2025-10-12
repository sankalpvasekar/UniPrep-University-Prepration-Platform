# Branch Loading Fix Summary

## Issue
When selecting ENTC (Electronics and Telecommunication Engineering), the frontend was showing "Computer Science Engineering" and loading CSE subjects instead of ENTC subjects.

## Root Cause
The frontend was using `ece` as the branch ID instead of `entc`, which didn't match the backend's branch code `ENTC`.

## Changes Made

### Backend Changes (`api/views.py`)
1. **Updated branch mapping** to include all 5 branches:
   - CSE → cse
   - ME → mech
   - ENTC → entc
   - CIVIL → civil
   - ELECTRICAL → electrical

2. **Added branch ID to code mapping** in `dataset_subjects()` and `dataset_years()`:
   ```python
   branch_to_code = {
       'cse': 'CSE',
       'mech': 'ME',
       'entc': 'ENTC',
       'civil': 'CIVIL',
       'electrical': 'ELECTRICAL',
   }
   ```

3. **Updated `dataset_branches()`** to return correct branch metadata with proper icons

### Frontend Changes
Fixed branch ID from `ece` to `entc` in the following files:

1. **BranchPage.jsx**
   - Updated fallback branch data (2 locations)
   - Changed icon from ⚡ to 📡

2. **YearSelectionPage.jsx**
   - Updated branchData object
   - Fixed branchMap in API call

3. **SubjectListPage.jsx**
   - Updated branchData object
   - Fixed branchMap in API call

### Backend Analyzer Changes (`api/uniprep_analyzer.py`)
- Disabled heavy AI model loading by default for faster server startup
- Models can be re-enabled if needed for advanced AI features

## Verification
All branches now load their correct subjects:

- **CSE**: OS, DBMS, CN, Machine Learning, etc.
- **Mechanical**: Thermodynamics, Fluid Mechanics, Heat Transfer, etc.
- **ENTC**: Analog Electronics, Digital Signal Processing, Communication Systems, etc.
- **Civil**: Surveying, Structural Analysis, Geotechnical Engineering, etc.
- **Electrical**: Electrical Machines, Power Systems, Power Electronics, etc.

## Testing
Run `python test_branch_subjects.py` to verify all branches load correctly.

## Status
✅ Backend server running on http://127.0.0.1:8000
✅ All 5 branches working correctly
✅ Branch-specific subjects loading accurately
✅ No more timeout issues
