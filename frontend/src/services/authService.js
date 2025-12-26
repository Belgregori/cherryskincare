import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { token, ...userData } = response.data;
    
    // Guardar token y datos del usuario
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async verifyToken() {
    const response = await api.post('/auth/verify');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

