# UniPrep - Engineering Study Platform

A comprehensive full-stack application for engineering students with Django REST API backend and React frontend.

## 🚀 Features

- **Modern UI/UX** with Tailwind CSS
- **AI-Powered Learning** assistance with Groq API
- **Mind Map Generation** with split-screen interface
- **Subject Management** with progress tracking
- **Past Papers & Videos** integration
- **Django REST API** backend

## 📁 Project Structure

```
├── frontend/          # React + Vite frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Dependencies
└── Backend/          # Django REST API backend
    ├── api/          # API app
    ├── data/         # CSV datasets
    └── manage.py     # Django management
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Django, Django REST Framework
- **AI**: Groq API (Llama 3.1)
- **Database**: SQLite (development)

## 🚀 Quick Start

### Backend Setup

```bash
cd Backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend will be available at `http://localhost:8000/api/`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📱 Features

- **AI Assistant** with 7 features including Mind Map generation
- **Fixed Navbar** with smooth scrolling
- **Responsive Design** for all devices
- **Interactive Subject Pages** with questions, videos, and topics

## 🔧 API Endpoints

- `GET /api/branches/` - List all branches
- `GET /api/subjects/` - List subjects
- `GET /api/questions/` - Get questions
- `GET /api/dataset/subjects/` - Get subjects from CSV dataset

## 📄 License

This project is part of the UniPrep engineering study platform.
