# UniPrep - MongoDB Integration & Frontend-Backend Connection Summary

## What Was Done

### 1. **Backend - MongoDB Integration**

#### Database Configuration
- **File Modified**: `Backend/uniprep_backend/settings.py`
- **Changes**:
  - Replaced SQLite with MongoDB using `djongo` engine
  - Database name: `uniprep_db`
  - Connection: `localhost:27017`
  - Schema enforcement disabled for flexibility

#### Dependencies Added
- **File Modified**: `Backend/requirements.txt`
- **New Packages**:
  - `djongo==1.3.6` - Django MongoDB connector
  - `pymongo==3.12.3` - MongoDB Python driver
  - `sqlparse==0.2.4` - SQL parsing library (required by djongo)

#### Existing Backend Features (Already Working)
- ✅ RESTful API with Django REST Framework
- ✅ User authentication with Token-based auth
- ✅ CORS configured for frontend
- ✅ Models: Branch, Subject, Question, Paper, Video, UserProfile
- ✅ ViewSets for all models with filtering
- ✅ RAG-based AI chatbot endpoint

### 2. **Frontend - API Integration**

#### API Utility Created
- **File Created**: `frontend/src/utils/api.js`
- **Features**:
  - Centralized API configuration
  - Authentication helpers (token management)
  - API functions for all endpoints:
    - Authentication (login, register, logout, getCurrentUser)
    - Branches (getAll, getById)
    - Subjects (getAll with branch filter, getById)
    - Questions (getAll with filters)
    - Papers (getAll with subject filter)
    - Videos (getAll with subject filter)
    - Chat (sendMessage with subject context)

#### Pages Updated

##### LoginPage (`frontend/src/pages/LoginPage.jsx`)
- ✅ Integrated with backend login API
- ✅ Token storage in localStorage
- ✅ User data persistence
- ✅ Auto-redirect if already authenticated
- ✅ Error handling with user feedback

##### SignupPage (`frontend/src/pages/SignupPage.jsx`)
- ✅ Integrated with backend registration API
- ✅ Dynamic branch loading from backend
- ✅ Form validation
- ✅ Auto-redirect if already authenticated
- ✅ Error handling

##### DashboardPage (`frontend/src/pages/DashboardPage.jsx`)
- ✅ Authentication check on mount
- ✅ Dynamic branch loading from backend
- ✅ User profile display from localStorage
- ✅ Logout functionality
- ✅ Proper user initials display

##### BranchPage (`frontend/src/pages/BranchPage.jsx`)
- ✅ Authentication check
- ✅ Dynamic branch fetching
- ✅ User profile integration
- ✅ Fallback data for offline mode

##### SubjectListPage (`frontend/src/pages/SubjectListPage.jsx`)
- ✅ Authentication check
- ✅ Branch details fetching
- ✅ Subject list by branch
- ✅ Dynamic UI properties mapping
- ✅ User profile display

##### Chatbot Component (`frontend/src/components/Chatbot.jsx`)
- ✅ Integrated with backend RAG chatbot
- ✅ Subject-aware conversations
- ✅ Real-time message handling
- ✅ Error handling

### 3. **Documentation**

#### Setup Guide Created
- **File Created**: `SETUP_GUIDE.md`
- **Contents**:
  - Complete installation instructions
  - MongoDB setup steps
  - Backend configuration
  - Frontend configuration
  - Sample data creation script
  - API endpoint documentation
  - Troubleshooting guide
  - Production deployment tips

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pages: Login, Signup, Dashboard, Branch, Subject   │   │
│  │  Components: Chatbot                                 │   │
│  │  Utils: api.js (API Integration Layer)              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Django REST)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Views: Auth, Branch, Subject, Question, Paper,     │   │
│  │         Video ViewSets                               │   │
│  │  Chatbot: RAG-based AI Assistant                    │   │
│  │  Serializers: Data transformation                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Djongo ORM
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  Collections: api_branch, api_subject, api_question,        │
│               api_paper, api_video, api_userprofile,         │
│               auth_user, authtoken_token                     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Registration Flow
1. User fills registration form → Frontend
2. Frontend sends POST to `/api/auth/register/` → Backend
3. Backend creates User and UserProfile → MongoDB
4. Backend returns token and user data → Frontend
5. Frontend stores token in localStorage
6. Frontend redirects to dashboard

### Data Fetching Flow
1. User navigates to page → Frontend
2. Frontend checks authentication (token in localStorage)
3. Frontend calls API with token in headers → Backend
4. Backend validates token
5. Backend queries MongoDB via Djongo ORM
6. Backend serializes data and returns JSON → Frontend
7. Frontend updates UI with data

### Chat Flow
1. User types message in chatbot → Frontend
2. Frontend sends message + subject_id → Backend `/api/chat/`
3. Backend retrieves subject context from MongoDB
4. Backend generates RAG-based response
5. Backend returns answer → Frontend
6. Frontend displays response in chat

## Key Features

### Authentication
- ✅ Token-based authentication
- ✅ Secure password hashing
- ✅ Protected routes
- ✅ Auto-logout on token expiry

### Data Management
- ✅ MongoDB for flexible schema
- ✅ Djongo ORM for Django compatibility
- ✅ RESTful API design
- ✅ Efficient querying with filters

### User Experience
- ✅ Responsive UI with Tailwind CSS
- ✅ Real-time feedback
- ✅ Error handling
- ✅ Loading states
- ✅ Smooth navigation

### AI Features
- ✅ RAG-based chatbot
- ✅ Subject-aware responses
- ✅ Context retrieval from database
- ✅ Helpful study assistance

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Login user | No |
| POST | `/api/auth/logout/` | Logout user | Yes |
| GET | `/api/auth/user/` | Get current user | Yes |
| GET | `/api/branches/` | List branches | No* |
| GET | `/api/branches/{id}/` | Get branch | No* |
| GET | `/api/subjects/` | List subjects | No* |
| GET | `/api/subjects/{id}/` | Get subject | No* |
| GET | `/api/questions/` | List questions | No* |
| GET | `/api/papers/` | List papers | No* |
| GET | `/api/videos/` | List videos | No* |
| POST | `/api/chat/` | Chat with AI | Yes |

*Note: Authentication is configured as `IsAuthenticatedOrReadOnly` for most endpoints

## Environment Variables

### Backend
No environment variables required for local development. For production:
- `SECRET_KEY` - Django secret key
- `DEBUG` - Set to False
- `MONGODB_URI` - MongoDB connection string (if using cloud)

### Frontend
No environment variables required. API base URL is hardcoded in `api.js`:
- `API_BASE_URL = 'http://localhost:8000/api'`

For production, update this to your deployed backend URL.

## Testing Checklist

- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Frontend dev server starts
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Dashboard shows branches from backend
- [ ] Can view subjects for a branch
- [ ] Can view subject details
- [ ] Chatbot responds to messages
- [ ] Logout works correctly

## Next Steps (Optional Enhancements)

1. **Add more sample data** - Populate database with comprehensive content
2. **Implement search** - Add search functionality across subjects
3. **User progress tracking** - Track which subjects/questions user has completed
4. **Bookmarks** - Allow users to bookmark questions/papers
5. **File uploads** - Enable uploading of papers/notes
6. **Email verification** - Add email verification on registration
7. **Password reset** - Implement forgot password functionality
8. **Admin dashboard** - Create admin interface for content management
9. **Analytics** - Track user engagement and popular content
10. **Mobile app** - Create React Native mobile version

## Troubleshooting

### Common Issues

**Issue**: MongoDB connection error
- **Solution**: Ensure MongoDB service is running (`net start MongoDB` on Windows)

**Issue**: CORS error in browser
- **Solution**: Verify backend CORS settings include frontend URL

**Issue**: 401 Unauthorized
- **Solution**: Check if token is present in localStorage and valid

**Issue**: 404 Not Found
- **Solution**: Verify backend server is running on port 8000

**Issue**: Djongo import error
- **Solution**: Ensure all requirements are installed: `pip install -r requirements.txt`

## Latest Updates (AI Analyzer Integration)

### 1. **Fixed Dependency Compatibility**
- **File Modified**: `Backend/requirements.txt`
- **Changes**:
  - Updated `sentence-transformers==2.7.0` (from 2.2.2)
  - Updated `transformers==4.38.0` (from 4.30.0)
  - Added `torch==2.1.0` for proper tensor operations
  - **Reason**: Fixed `ImportError: cannot import name 'is_torch_npu_available'` error

### 2. **Frontend Integration with AI Analyzer**
- **File Modified**: `frontend/src/pages/SubjectPage.jsx`
- **Changes**:
  - Removed hardcoded questions import
  - Added `useEffect` to fetch AI-prioritized questions from backend
  - Questions now fetched from `/api/ai-questions/{subjectId}/`
  - Added loading state while AI analyzer processes questions
  - Added empty state when no questions available
  - Dynamic subject name generation from subjectId
  - Real-time question prioritization using UniPrep algorithm

### 3. **Backend API Endpoints**
- **Already Configured**:
  - `/api/dataset/subjects/?branch={branch}&year={year}` - Get subjects from CSV dataset
  - `/api/ai-questions/{subject_id}/` - Get AI-prioritized questions for a subject
  - Both endpoints use `uniprep_analyzer.py` algorithm

### 4. **How It Works Now**

#### Subject Display Flow:
1. User navigates to `/branch/{branchId}/year/{yearId}/subject`
2. Frontend calls `/api/dataset/subjects/?branch=CSE&year=FY`
3. Backend's `uniprep_analyzer.py` reads `CSE_UniPrep (1).csv`
4. Analyzer extracts unique subjects for CSE + FY combination
5. Only subjects present in dataset are displayed (e.g., Physics, Mathematics)
6. Frontend shows these subjects with icons and colors

#### Question Display Flow:
1. User clicks on a subject (e.g., "Physics")
2. Frontend navigates to `/subject/physics`
3. Frontend calls `/api/ai-questions/physics/`
4. Backend's `UniPrepAnalyzer.analyze_subject("Physics")` runs:
   - Loads all Physics questions from dataset
   - Extracts key topics using KeyBERT
   - Creates embeddings using SentenceTransformer
   - Groups similar questions using AgglomerativeClustering
   - Detects temporal patterns (odd/even year cycles, gaps)
   - Calculates priority scores based on:
     * Frequency of appearance
     * Mark weightage
     * Years since last asked
     * Pattern multipliers
   - Categorizes by difficulty (easy ≤3 marks, medium ≤7 marks, hard >7 marks)
5. Backend returns categorized questions: `{easy: [...], medium: [...], hard: [...]}`
6. Frontend displays AI-prioritized questions with:
   - Question text
   - Year last asked
   - Topic extracted by AI
   - Marks
   - AI-generated answer context

### 5. **Dataset Structure**
- **File**: `Backend/data/CSE_UniPrep (1).csv`
- **Columns**: `id, branch, year, subject, question_text, Qyear, mark_weightage`
- **Example Data**:
  - Branch: CSE
  - Year: FY (First Year)
  - Subjects: Physics, Mathematics
  - Questions: 100+ questions with years 2019-2023

### 6. **Algorithm Features**
- ✅ AI-powered topic extraction
- ✅ Semantic similarity clustering
- ✅ Temporal pattern detection
- ✅ Priority scoring algorithm
- ✅ Difficulty categorization
- ✅ Mark-based weighting
- ✅ Recency multipliers

## Conclusion

The UniPrep application is now fully integrated with:
1. **MongoDB** for user data and authentication
2. **CSV Dataset** for question bank
3. **AI Analyzer** for intelligent question prioritization
4. **Frontend-Backend** connection for seamless data flow

The system dynamically displays subjects from the dataset and uses AI algorithms to prioritize questions based on historical patterns, making it a powerful exam preparation tool.

For production deployment, follow the production deployment section in SETUP_GUIDE.md.
