# UniPrep - University Preparation Platform

## 🎥 YouTube Demo
(Add YouTube video link here after upload)

## Project Description
A comprehensive full-stack platform for university exam preparation with AI integration, featuring a Django REST API backend and React frontend. It provides AI-based prediction of upcoming exam questions using past question papers, along with tools for subject management, study planning, and student progress tracking.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Django 4.2.7, Django REST Framework 3.14.0
- **AI/ML**: Groq API (Llama 3.1), Sentence Transformers, Scikit-learn, KeyBERT
- **Database**: SQLite (development), MongoDB support
- **Data Processing**: Pandas, NumPy, Transformers, PyTorch

## How to Run

### Backend Setup
```bash
cd Backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Local Server
- Backend: `http://localhost:8000/api/`
- Frontend: `http://localhost:5173`
