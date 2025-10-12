"""
Quick test script to verify API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

print("Testing Login with demo user...")
login_data = {
    "email": "user@test.com",
    "password": "123456"
}

try:
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

print("Testing Registration...")
register_data = {
    "email": "newuser@test.com",
    "password": "password123",
    "confirm_password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "branch": "cse"
}

try:
    response = requests.post(f"{BASE_URL}/auth/register/", json=register_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

print("Testing Branches endpoint...")
try:
    response = requests.get(f"{BASE_URL}/branches/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
