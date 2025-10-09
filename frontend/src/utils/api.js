const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` })
  };
};

// Auth APIs
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    // Store token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        first_name: userData.firstName,
        last_name: userData.lastName
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || Object.values(data).flat().join(', ') || 'Registration failed');
    }
    // Store token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout: async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: getAuthHeaders()
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/user/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  }
};

// Branch APIs
export const branchAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/branches/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch branches');
    }
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/branches/${id}/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch branch');
    }
    return response.json();
  }
};

// Subject APIs
export const subjectAPI = {
  getAll: async (branchId = null) => {
    const url = branchId 
      ? `${API_BASE_URL}/subjects/?branch=${branchId}`
      : `${API_BASE_URL}/subjects/`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}/`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch subject');
    }
    return response.json();
  }
};

// Question APIs
export const questionAPI = {
  getAll: async (subjectId = null, difficulty = null) => {
    let url = `${API_BASE_URL}/questions/`;
    const params = new URLSearchParams();
    if (subjectId) params.append('subject', subjectId);
    if (difficulty) params.append('difficulty', difficulty);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return response.json();
  }
};

// Paper APIs
export const paperAPI = {
  getAll: async (subjectId = null) => {
    const url = subjectId 
      ? `${API_BASE_URL}/papers/?subject=${subjectId}`
      : `${API_BASE_URL}/papers/`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch papers');
    }
    return response.json();
  }
};

// Video APIs
export const videoAPI = {
  getAll: async (subjectId = null) => {
    const url = subjectId 
      ? `${API_BASE_URL}/videos/?subject=${subjectId}`
      : `${API_BASE_URL}/videos/`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    return response.json();
  }
};

// Chat API
export const chatAPI = {
  sendMessage: async (message, subjectId) => {
    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        question: message,
        subject_id: subjectId 
      })
    });
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return response.json();
  }
};
