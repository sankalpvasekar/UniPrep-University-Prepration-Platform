# UniPrep Backend

Django REST API backend for the UniPrep application.

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv
```

### 2. Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 6. Load Initial Data (Optional)
```bash
python manage.py loaddata initial_data.json
```

### 7. Run Development Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/user/` - Get current user

### Branches
- `GET /api/branches/` - List all branches
- `GET /api/branches/{id}/` - Get branch details

### Subjects
- `GET /api/subjects/` - List all subjects
- `GET /api/subjects/?branch={branch_id}` - Filter subjects by branch
- `GET /api/subjects/{id}/` - Get subject details with questions, papers, videos

### Questions
- `GET /api/questions/?subject={subject_id}` - Get questions for a subject
- `GET /api/questions/?difficulty={easy|medium|hard}` - Filter by difficulty

### Papers
- `GET /api/papers/?subject={subject_id}` - Get papers for a subject

### Videos
- `GET /api/videos/?subject={subject_id}` - Get videos for a subject

## Admin Panel

Access the admin panel at `http://localhost:8000/admin/` to manage:
- Branches
- Subjects
- Questions
- Papers
- Videos
- Users

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`

Update `CORS_ALLOWED_ORIGINS` in `settings.py` for production.
