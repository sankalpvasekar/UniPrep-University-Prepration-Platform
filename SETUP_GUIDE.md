# UniPrep - MongoDB Integration Setup Guide

## Overview
This guide will help you set up the UniPrep application with MongoDB database and integrate the frontend with the Django backend.

## Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB 4.4+ (installed and running locally)

## Backend Setup

### 1. Install MongoDB
Download and install MongoDB from: https://www.mongodb.com/try/download/community

Start MongoDB service:
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### 2. Install Python Dependencies
Navigate to the Backend directory:
```bash
cd Backend
pip install -r requirements.txt
```

### 3. Configure Database
The application is already configured to use MongoDB. Settings are in `uniprep_backend/settings.py`:
- Database: `uniprep_db`
- Host: `localhost`
- Port: `27017`

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 6. Populate Initial Data
Create some sample data using Django shell:
```bash
python manage.py shell
```

Then run:
```python
from api.models import Branch, Subject, Question, Paper, Video

# Create Branches
cse = Branch.objects.create(id='cse', name='Computer Science Engineering', description='Software and Computing', icon='💻')
ece = Branch.objects.create(id='ece', name='Electronics & Communication Engineering', description='Electronics and Communication', icon='⚡')
mech = Branch.objects.create(id='mech', name='Mechanical Engineering', description='Machines and Manufacturing', icon='🔧')
civil = Branch.objects.create(id='civil', name='Civil Engineering', description='Construction and Infrastructure', icon='🏗️')

# Create Subjects for CSE
ds = Subject.objects.create(branch=cse, name='Data Structures', code='CS201', description='Arrays, Trees, Graphs', icon='🌳')
os = Subject.objects.create(branch=cse, name='Operating Systems', code='CS202', description='Process and Memory Management', icon='⚙️')
dbms = Subject.objects.create(branch=cse, name='Database Management', code='CS203', description='SQL and Database Design', icon='🗄️')

# Create Sample Questions
Question.objects.create(subject=ds, text='Explain Binary Search Tree', difficulty='medium', marks=5)
Question.objects.create(subject=ds, text='What is Time Complexity?', difficulty='easy', marks=3)
Question.objects.create(subject=os, text='Explain Deadlock Prevention', difficulty='hard', marks=10)

# Create Sample Papers
Paper.objects.create(subject=ds, title='Data Structures Mid-Term 2023', year=2023, semester='Fall', file_url='https://example.com/paper1.pdf')
Paper.objects.create(subject=os, title='Operating Systems Final 2023', year=2023, semester='Spring', file_url='https://example.com/paper2.pdf')

# Create Sample Videos
Video.objects.create(subject=ds, title='Introduction to Data Structures', url='https://youtube.com/watch?v=example1', duration='45:30')
Video.objects.create(subject=os, title='Process Scheduling Algorithms', url='https://youtube.com/watch?v=example2', duration='38:15')

print("Sample data created successfully!")
exit()
```

### 7. Start Backend Server
```bash
python manage.py runserver
```

The backend will be available at: `http://localhost:8000`

## Frontend Setup

### 1. Install Node Dependencies
Navigate to the frontend directory:
```bash
cd frontend
npm install
```

### 2. Configure API Endpoint
The API endpoint is already configured in `src/utils/api.js`:
- API Base URL: `http://localhost:8000/api`

### 3. Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Testing the Integration

### 1. Register a New User
1. Open `http://localhost:5173` in your browser
2. Click "Sign up here"
3. Fill in the registration form
4. Select a branch
5. Click "Create Account"

### 2. Login
1. Use your registered credentials
2. Click "Sign In"
3. You should be redirected to the dashboard

### 3. Browse Content
1. From the dashboard, click on any branch
2. View subjects for that branch
3. Click on a subject to see questions, papers, and videos

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/user/` - Get current user

### Branches
- `GET /api/branches/` - List all branches
- `GET /api/branches/{id}/` - Get branch details

### Subjects
- `GET /api/subjects/` - List all subjects
- `GET /api/subjects/?branch={id}` - List subjects by branch
- `GET /api/subjects/{id}/` - Get subject details

### Questions
- `GET /api/questions/` - List all questions
- `GET /api/questions/?subject={id}` - List questions by subject
- `GET /api/questions/?difficulty={level}` - Filter by difficulty

### Papers
- `GET /api/papers/` - List all papers
- `GET /api/papers/?subject={id}` - List papers by subject

### Videos
- `GET /api/videos/` - List all videos
- `GET /api/videos/?subject={id}` - List videos by subject

### Chat
- `POST /api/chat/` - Send message to AI chatbot

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check if MongoDB service is active
- Verify connection settings in `settings.py`

### CORS Issues
- Backend CORS is configured for `http://localhost:5173`
- If using different port, update `CORS_ALLOWED_ORIGINS` in `settings.py`

### Authentication Issues
- Clear browser localStorage: `localStorage.clear()`
- Check if token is being stored correctly
- Verify backend is returning proper token

### API Not Found (404)
- Ensure backend server is running on port 8000
- Check API endpoint URLs in `frontend/src/utils/api.js`
- Verify Django URL patterns in `api/urls.py`

## Database Management

### View MongoDB Data
```bash
# Open MongoDB shell
mongo

# Switch to database
use uniprep_db

# List collections
show collections

# View branches
db.api_branch.find().pretty()

# View subjects
db.api_subject.find().pretty()
```

### Reset Database
```bash
# Drop database
mongo uniprep_db --eval "db.dropDatabase()"

# Run migrations again
python manage.py migrate
```

## Production Deployment

### Backend
1. Set `DEBUG = False` in settings.py
2. Configure proper `SECRET_KEY`
3. Update `ALLOWED_HOSTS`
4. Use environment variables for sensitive data
5. Set up MongoDB Atlas for cloud database
6. Configure static files serving

### Frontend
1. Build production bundle: `npm run build`
2. Update API_BASE_URL to production backend
3. Deploy to hosting service (Vercel, Netlify, etc.)

## Additional Features

### Admin Panel
Access Django admin at: `http://localhost:8000/admin`
- Login with superuser credentials
- Manage branches, subjects, questions, papers, videos

### API Documentation
- Consider adding Django REST Framework browsable API
- Add Swagger/OpenAPI documentation

## Support
For issues or questions, refer to:
- Django documentation: https://docs.djangoproject.com/
- MongoDB documentation: https://docs.mongodb.com/
- React documentation: https://react.dev/
