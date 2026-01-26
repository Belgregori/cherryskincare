import api from './api';
import { secureSetItem, secureGetItem, secureRemoveItem, secureClear } from '../utils/secureStorage';
import { sanitizeEmail, sanitizePassword } from '../utils/sanitize';

export const authService = {
  async login(email, password) {
    // Sanitizar entradas antes de enviar
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizePassword(password);
    
    if (!sanitizedEmail || !sanitizedPassword) {
      throw new Error('Email o contraseña inválidos');
    }
    
    const response = await api.post('/auth/login', { 
      email: sanitizedEmail, 
      password: sanitizedPassword 
    });
    const { token, refreshToken, ...userData } = response.data;
    
    // Guardar tokens en sessionStorage (más seguro, se borra al cerrar pestaña)
    // Los tokens siempre se guardan en sessionStorage para mayor seguridad
    secureSetItem('token', token, true);
    if (refreshToken) {
      secureSetItem('refreshToken', refreshToken, true);
    }
    // Datos del usuario pueden ir en sessionStorage también
    secureSetItem('user', userData, true);
    
    return response.data;
  },

  async register(userData) {
    // Sanitizar datos del usuario antes de enviar
    const sanitizedData = {
      ...userData,
      email: sanitizeEmail(userData.email),
      name: userData.name ? userData.name.trim() : '',
      telefone: userData.telefone ? userData.telefone.trim() : '',
    };
    
    if (!sanitizedData.email) {
      throw new Error('Email inválido');
    }
    
    const response = await api.post('/users/register', sanitizedData);
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

  async logout() {
    const refreshToken = secureGetItem('refreshToken');
    
    // Intentar revocar el refresh token en el servidor
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        // Si falla, continuar con el logout local
        console.error('Error al revocar refresh token:', error);
      }
    }
    
    // Limpiar todos los tokens y datos de usuario
    secureRemoveItem('token');
    secureRemoveItem('refreshToken');
    secureRemoveItem('user');
  },

  async refreshToken() {
    const refreshToken = secureGetItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { token, refreshToken: newRefreshToken, ...userData } = response.data;
      
      // Actualizar tokens en sessionStorage (más seguro)
      secureSetItem('token', token, true);
      if (newRefreshToken) {
        secureSetItem('refreshToken', newRefreshToken, true);
      }
      secureSetItem('user', userData, true);
      
      return response.data;
    } catch (error) {
      // Si el refresh token es inválido, hacer logout
      this.logout();
      throw error;
    }
  },

  getRefreshToken() {
    return secureGetItem('refreshToken');
  },

  getToken() {
    return secureGetItem('token');
  },

  getUser() {
    return secureGetItem('user');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async updateUser(userId, userData) {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  async changePassword(userId, passwordData) {
    // Sanitizar contraseñas
    const sanitizedData = {
      currentPassword: sanitizePassword(passwordData.currentPassword),
      newPassword: sanitizePassword(passwordData.newPassword),
    };
    
    if (!sanitizedData.currentPassword || !sanitizedData.newPassword) {
      throw new Error('Contraseñas inválidas');
    }
    
    const response = await api.put(`/users/${userId}/password`, sanitizedData);
    return response.data;
  }
};

