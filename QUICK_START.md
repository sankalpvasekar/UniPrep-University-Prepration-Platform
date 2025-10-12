# UniPrep - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] MongoDB installed and running

### Step 1: Start MongoDB (30 seconds)
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod

# Verify MongoDB is running
mongod --version
```

### Step 2: Setup Backend (2 minutes)
```bash
# Navigate to backend directory
cd Backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start backend server
python manage.py runserver
```

Backend should now be running at: **http://localhost:8000**

### Step 3: Setup Frontend (2 minutes)
Open a **new terminal** window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend should now be running at: **http://localhost:5173**

### Step 4: Create Sample Data (1 minute)
Open a **new terminal** window:

```bash
cd Backend
python manage.py shell
```

Paste this code:
```python
from api.models import Branch, Subject, Question, Paper, Video

# Create Branches
cse = Branch.objects.create(id='cse', name='Computer Science Engineering', description='Software and Computing', icon='💻')
ece = Branch.objects.create(id='ece', name='Electronics & Communication Engineering', description='Electronics and Communication', icon='⚡')
mech = Branch.objects.create(id='mech', name='Mechanical Engineering', description='Machines and Manufacturing', icon='🔧')
civil = Branch.objects.create(id='civil', name='Civil Engineering', description='Construction and Infrastructure', icon='🏗️')

# Create Subjects
ds = Subject.objects.create(branch=cse, name='Data Structures', code='CS201', description='Arrays, Trees, Graphs', icon='🌳')
os = Subject.objects.create(branch=cse, name='Operating Systems', code='CS202', description='Process Management', icon='⚙️')
dbms = Subject.objects.create(branch=cse, name='Database Management', code='CS203', description='SQL and Databases', icon='🗄️')

# Create Questions
Question.objects.create(subject=ds, text='Explain Binary Search Tree and its operations', difficulty='medium', marks=5)
Question.objects.create(subject=ds, text='What is time complexity? Explain with examples', difficulty='easy', marks=3)
Question.objects.create(subject=os, text='Explain deadlock prevention techniques', difficulty='hard', marks=10)

# Create Papers
Paper.objects.create(subject=ds, title='Data Structures Mid-Term 2023', year=2023, semester='Fall', file_url='https://example.com/ds-midterm.pdf')
Paper.objects.create(subject=os, title='Operating Systems Final 2023', year=2023, semester='Spring', file_url='https://example.com/os-final.pdf')

# Create Videos
Video.objects.create(subject=ds, title='Introduction to Data Structures', url='https://youtube.com/watch?v=example1', duration='45:30')
Video.objects.create(subject=os, title='Process Scheduling Algorithms', url='https://youtube.com/watch?v=example2', duration='38:15')

print("✅ Sample data created successfully!")
exit()
```

### Step 5: Test the Application
1. Open browser: **http://localhost:5173**
2. Click "Sign up here"
3. Register with:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: test123
   - Branch: Computer Science Engineering
4. Click "Create Account"
5. You should be redirected to the dashboard!

## ✅ Verification Checklist

After setup, verify these work:
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] Dashboard shows 4 branches
- [ ] Can click on "Computer Science Engineering"
- [ ] Can see 3 subjects (Data Structures, Operating Systems, Database Management)
- [ ] Can click on a subject and see questions
- [ ] Can view past papers
- [ ] Can view videos
- [ ] Chatbot responds to messages

## 🎯 Quick Test Commands

### Test Backend API
```bash
# Test if backend is running
curl http://localhost:8000/api/branches/

# Test registration (replace with your data)
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","confirm_password":"test123","first_name":"Test","last_name":"User","branch":"cse"}'
```

### View MongoDB Data
```bash
# Open MongoDB shell
mongo

# Switch to database
use uniprep_db

# View branches
db.api_branch.find().pretty()

# View subjects
db.api_subject.find().pretty()

# Exit
exit
```

## 🔧 Common Issues & Quick Fixes

### Issue: "MongoDB connection refused"
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Issue: "Port 8000 already in use"
```bash
# Find and kill process on port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Issue: "Port 5173 already in use"
```bash
# Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### Issue: "Module not found" errors
```bash
# Backend
cd Backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Issue: "CORS error in browser"
- Check that backend is running on port 8000
- Check that frontend is running on port 5173
- Clear browser cache and reload

## 📱 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:8000/api | REST API endpoints |
| Django Admin | http://localhost:8000/admin | Admin panel (create superuser first) |
| MongoDB | localhost:27017 | Database |

## 🎓 Next Steps

1. **Explore the app**: Navigate through branches, subjects, questions
2. **Test chatbot**: Ask questions in the AI Assistant tab
3. **Add more data**: Use Django admin or shell to add content
4. **Customize**: Modify frontend components or backend models
5. **Deploy**: Follow production deployment guide when ready

## 📚 Additional Resources

- **Full Setup Guide**: See `SETUP_GUIDE.md`
- **Integration Details**: See `INTEGRATION_SUMMARY.md`
- **Django Docs**: https://docs.djangoproject.com/
- **React Docs**: https://react.dev/
- **MongoDB Docs**: https://docs.mongodb.com/

## 💡 Pro Tips

1. **Use Django Admin**: Create a superuser to manage data easily
   ```bash
   python manage.py createsuperuser
   ```

2. **Hot Reload**: Both frontend and backend support hot reload - changes reflect automatically

3. **Debug Mode**: Check browser console (F12) for frontend errors, terminal for backend errors

4. **API Testing**: Use tools like Postman or Thunder Client to test API endpoints

5. **Database GUI**: Use MongoDB Compass for visual database management

## 🆘 Need Help?

If you encounter issues:
1. Check the error message in terminal/console
2. Refer to `SETUP_GUIDE.md` troubleshooting section
3. Verify all prerequisites are installed
4. Ensure MongoDB is running
5. Check that ports 8000 and 5173 are available

---

**Happy Coding! 🚀**

Start building your educational platform with UniPrep!
