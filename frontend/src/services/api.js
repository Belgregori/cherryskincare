import axios from 'axios';

// URL base del API - configurable mediante variable de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// URL base para imágenes
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  async (config) => {
    // Usar almacenamiento seguro (sessionStorage)
    const { secureGetItem } = await import('../utils/secureStorage');
    const token = secureGetItem('token');
    
    if (token) {
      // Verificar expiración del token antes de hacer la petición
      // Importar dinámicamente para evitar dependencia circular
      const { isTokenExpired, getTokenTimeRemaining } = await import('../utils/jwtUtils');
      const { authService } = await import('./authService');
      
      if (isTokenExpired(token)) {
        // Token expirado, intentar refrescar
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          try {
            const response = await authService.refreshToken();
            const newToken = response.token;
            config.headers.Authorization = `Bearer ${newToken}`;
            return config;
          } catch (error) {
            // Si el refresh falla, limpiar y redirigir
            authService.logout();
            if (window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin/login';
            } else {
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }
        } else {
          // No hay refresh token, limpiar y redirigir
          authService.logout();
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          } else {
            window.location.href = '/login';
          }
          return Promise.reject(new Error('Token expirado y no hay refresh token'));
        }
      } else {
        // Token válido, verificar si está cerca de expirar (menos de 1 minuto)
        const timeRemaining = getTokenTimeRemaining(token);
        if (timeRemaining && timeRemaining < 60 * 1000) {
          // Token cerca de expirar, refrescar proactivamente en background
          const refreshToken = authService.getRefreshToken();
          if (refreshToken) {
            authService.refreshToken().catch(() => {
              // Si falla el refresh proactivo, no hacer nada (se manejará en el próximo request)
              console.warn('Error al refrescar token proactivamente');
            });
          }
        }
        
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta y refresh automático de tokens
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log de errores de API al servicio de logging
    if (error.response) {
      // Error con respuesta del servidor
      const { errorLoggingService } = await import('./errorLoggingService');
      
      errorLoggingService.logError(
        new Error(`API Error: ${error.response.status} - ${error.response.statusText}`),
        null,
        {
          level: 'error',
          tags: {
            apiError: true,
            statusCode: error.response.status,
            endpoint: originalRequest?.url,
            method: originalRequest?.method,
          },
          extra: {
            response: {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            request: {
              url: originalRequest?.url,
              method: originalRequest?.method,
              headers: originalRequest?.headers,
            },
          },
        }
      );
    } else if (error.request) {
      // Error de red (sin respuesta del servidor)
      const { errorLoggingService } = await import('./errorLoggingService');
      
      errorLoggingService.logError(
        new Error('Network Error: No se pudo conectar al servidor'),
        null,
        {
          level: 'error',
          tags: {
            networkError: true,
            endpoint: originalRequest?.url,
            method: originalRequest?.method,
          },
          extra: {
            request: originalRequest,
          },
        }
      );
    } else {
      // Error al configurar la petición
      const { errorLoggingService } = await import('./errorLoggingService');
      
      errorLoggingService.logError(
        error,
        null,
        {
          level: 'error',
          tags: {
            requestError: true,
            endpoint: originalRequest?.url,
            method: originalRequest?.method,
          },
        }
      );
    }

    // Si es un error 401 y no es un intento de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya se está refrescando, esperar en la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Importar authService dinámicamente para evitar dependencia circular
          const { authService } = await import('./authService');
          const response = await authService.refreshToken();
          const newToken = response.token;
          
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          isRefreshing = false;
          
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Si el refresh falla, hacer logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirigir según la ruta
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          } else {
            window.location.href = '/';
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // No hay refresh token, hacer logout
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

