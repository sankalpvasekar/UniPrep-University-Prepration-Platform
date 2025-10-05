# Django Backend + React Frontend Integration Guide

## ✅ What's Been Done

### Backend (Django)
- ✅ Django project structure created in `/Backend`
- ✅ REST API with Django REST Framework
- ✅ Authentication endpoints (login, signup, logout)
- ✅ Models: Branch, Subject, Question, Paper, Video, UserProfile
- ✅ CORS configured for frontend communication
- ✅ Admin panel setup

### Frontend (React)
- ✅ API service layer created (`/uniprep/src/services/api.js`)
- ✅ LoginPage updated to use Django API
- ✅ SignupPage updated to use Django API
- ✅ BranchPage partially updated (needs completion)

## 🚀 Setup Instructions

### Step 1: Setup Django Backend

```bash
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser

# Seed initial data
python manage.py shell < seed_data.py

# Run server
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

### Step 2: Update Remaining Frontend Pages

You need to update these pages to use the API:

#### 1. **BranchPage.jsx** - Update the card rendering section:

Find the section where branches are mapped and update to use `branch.subject_count` instead of hardcoded stats.

#### 2. **DashboardPage.jsx** - Add API integration:

```javascript
import { branchesAPI, authAPI } from "../services/api";
import { useEffect, useState } from "react";

// Add state
const [branches, setBranches] = useState([]);
const [user, setUser] = useState(null);

// Add useEffect to load data
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    const branchesData = await branchesAPI.getAll();
    setBranches(branchesData);
    
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  } catch (err) {
    console.error(err);
  }
};
```

#### 3. **SubjectListPage.jsx** - Update to fetch subjects:

```javascript
import { subjectsAPI } from "../services/api";
import { useParams } from "react-router-dom";

const { branchId } = useParams();
const [subjects, setSubjects] = useState([]);

useEffect(() => {
  loadSubjects();
}, [branchId]);

const loadSubjects = async () => {
  const data = await subjectsAPI.getAll(branchId);
  setSubjects(data);
};
```

#### 4. **SubjectPage.jsx** - Update to fetch subject details:

```javascript
import { subjectsAPI, questionsAPI, papersAPI, videosAPI } from "../services/api";
import { useParams } from "react-router-dom";

const { subjectId } = useParams();
const [subject, setSubject] = useState(null);

useEffect(() => {
  loadSubjectData();
}, [subjectId]);

const loadSubjectData = async () => {
  const subjectData = await subjectsAPI.getById(subjectId);
  setSubject(subjectData);
  // subjectData will include questions, papers, and videos
};
```

### Step 3: Run Frontend

```bash
cd uniprep
npm install
npm run dev
```

Frontend will run at: `http://localhost:5173`

## 📝 API Endpoints Reference

### Authentication
- `POST /api/auth/login/` - Login
  ```json
  { "email": "user@test.com", "password": "123456" }
  ```
- `POST /api/auth/register/` - Register
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "confirm_password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "branch": "cse"
  }
  ```
- `POST /api/auth/logout/` - Logout (requires auth token)
- `GET /api/auth/user/` - Get current user (requires auth token)

### Branches
- `GET /api/branches/` - List all branches
- `GET /api/branches/{id}/` - Get branch with subjects

### Subjects
- `GET /api/subjects/` - List all subjects
- `GET /api/subjects/?branch=cse` - Filter by branch
- `GET /api/subjects/{id}/` - Get subject with questions, papers, videos

### Questions
- `GET /api/questions/?subject={id}` - Get questions for subject
- `GET /api/questions/?subject={id}&difficulty=easy` - Filter by difficulty

### Papers
- `GET /api/papers/?subject={id}` - Get papers for subject

### Videos
- `GET /api/videos/?subject={id}` - Get videos for subject

## 🔧 Testing

1. **Test Backend API** - Visit `http://localhost:8000/api/branches/` in browser
2. **Test Admin Panel** - Visit `http://localhost:8000/admin/`
3. **Test Login** - Use credentials: `user@test.com` / `123456`

## 🎯 Next Steps

1. Complete the frontend page updates listed above
2. Add loading states and error handling to all pages
3. Add authentication guards (redirect to login if not authenticated)
4. Test the complete flow: signup → login → browse branches → view subjects
5. Customize the seeded data in `seed_data.py` as needed

## 🐛 Troubleshooting

**CORS errors?**
- Make sure Django backend is running on port 8000
- Check `CORS_ALLOWED_ORIGINS` in `settings.py`

**Authentication not working?**
- Check if token is stored in localStorage
- Verify API endpoints are correct in `api.js`

**No data showing?**
- Run the seed_data.py script to populate database
- Check browser console for errors
- Verify backend is running

## 📚 File Structure

```
CDT/
├── Backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── seed_data.py
│   ├── uniprep_backend/
│   │   ├── settings.py
│   │   └── urls.py
│   └── api/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
└── uniprep/
    └── src/
        ├── services/
        │   └── api.js (✅ Created)
        └── pages/
            ├── LoginPage.jsx (✅ Updated)
            ├── SignupPage.jsx (✅ Updated)
            ├── BranchPage.jsx (⚠️ Partially updated)
            ├── DashboardPage.jsx (❌ Needs update)
            ├── SubjectListPage.jsx (❌ Needs update)
            └── SubjectPage.jsx (❌ Needs update)
```
