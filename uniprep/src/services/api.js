// API configuration and base functions
const API_BASE_URL = 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Base fetch function with auth headers
const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || error.detail || 'Request failed');
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const data = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  register: async (userData) => {
    const data = await apiFetch('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      await apiFetch('/auth/logout/', {
        method: 'POST',
      });
    } finally {
      removeAuthToken();
    }
  },

  getCurrentUser: async () => {
    return apiFetch('/auth/user/');
  },
};

// Branches API
export const branchesAPI = {
  getAll: async () => {
    return apiFetch('/branches/');
  },

  getById: async (id) => {
    return apiFetch(`/branches/${id}/`);
  },
};

// Subjects API
export const subjectsAPI = {
  getAll: async (branchId = null) => {
    const query = branchId ? `?branch=${branchId}` : '';
    return apiFetch(`/subjects/${query}`);
  },

  getById: async (id) => {
    return apiFetch(`/subjects/${id}/`);
  },
};

// Questions API
export const questionsAPI = {
  getBySubject: async (subjectId, difficulty = null) => {
    let query = `?subject=${subjectId}`;
    if (difficulty) {
      query += `&difficulty=${difficulty}`;
    }
    return apiFetch(`/questions/${query}`);
  },
};

// Papers API
export const papersAPI = {
  getBySubject: async (subjectId) => {
    return apiFetch(`/papers/?subject=${subjectId}`);
  },
};

// Videos API
export const videosAPI = {
  getBySubject: async (subjectId) => {
    return apiFetch(`/videos/?subject=${subjectId}`);
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (question, subjectId) => {
    return apiFetch('/chat/', {
      method: 'POST',
      body: JSON.stringify({ question, subject_id: subjectId }),
    });
  },
};

export default {
  auth: authAPI,
  branches: branchesAPI,
  subjects: subjectsAPI,
  questions: questionsAPI,
  papers: papersAPI,
  videos: videosAPI,
  chat: chatAPI,
};
