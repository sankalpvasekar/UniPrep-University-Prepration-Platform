# Troubleshooting Guide

## Current Issues

### 1. Login Error (401 Unauthorized)
**Error:** `Unauthorized: /api/auth/login/`

**Possible Causes:**
- Demo user credentials might not be correct
- Password hashing issue

**Solution:**
Try logging in with: `user@test.com` / `123456`

If that doesn't work, create a new user via Django shell:
```bash
cd Backend
python manage.py shell
```
Then run:
```python
from django.contrib.auth.models import User
from api.models import UserProfile, Branch

# Delete existing test user if any
User.objects.filter(email='user@test.com').delete()

# Create new user
user = User.objects.create_user(
    username='user@test.com',
    email='user@test.com',
    password='123456',
    first_name='Demo',
    last_name='User'
)

# Create profile
branch = Branch.objects.get(id='cse')
UserProfile.objects.create(user=user, branch=branch)

print("User created successfully!")
exit()
```

### 2. Registration Error (400 Bad Request)
**Error:** `Bad Request: /api/auth/register/`

**Possible Causes:**
- Missing required fields
- Field name mismatch between frontend and backend

**Check the browser console for detailed error message.**

**Expected fields:**
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

### 3. CORS Issues
If you see CORS errors in the browser console:

1. Check that Django backend is running on `http://localhost:8000`
2. Check that React frontend is running on `http://localhost:5173`
3. Verify `CORS_ALLOWED_ORIGINS` in `Backend/uniprep_backend/settings.py`

## Quick Fixes

### Fix 1: Recreate Demo User
```bash
cd Backend
python manage.py shell < seed_data.py
```

### Fix 2: Check Django Server Logs
Look at the terminal where Django is running for detailed error messages.

### Fix 3: Test API Directly
```bash
cd Backend
python test_api.py
```

### Fix 4: Check Browser Console
Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for API request/response details

## Verification Steps

1. **Backend is running:**
   - Visit `http://localhost:8000/api/branches/` in browser
   - Should see JSON list of branches

2. **Frontend is running:**
   - Visit `http://localhost:5173` in browser
   - Should see UniPrep landing page

3. **Test Login:**
   - Go to `http://localhost:5173/login`
   - Use: `user@test.com` / `123456`
   - Check browser console for errors

## Common Error Messages

### "CSRF Failed"
Add to `settings.py`:
```python
CSRF_TRUSTED_ORIGINS = ['http://localhost:5173']
```

### "Token authentication failed"
Clear browser localStorage and try again:
```javascript
// In browser console:
localStorage.clear()
```

### "Connection refused"
- Make sure both servers are running
- Check firewall settings
- Try `127.0.0.1` instead of `localhost`
