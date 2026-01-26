import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/authService';
import { errorLoggingService } from '../services/errorLoggingService';
import { 
  isTokenExpired, 
  getRoleFromToken, 
  getTokenClaims,
  hasRole 
} from '../utils/jwtUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar y actualizar el estado del usuario basado en el token JWT
  const verifyAndUpdateUser = useCallback(async () => {
    const token = authService.getToken();
    const savedUser = authService.getUser();
    
    // Si no hay token, limpiar estado
    if (!token) {
      setUser(null);
      return false;
    }

    // Verificar expiración del token desde las claims del JWT
    if (isTokenExpired(token)) {
      console.warn('Token expirado, intentando refrescar...');
      try {
        // Intentar refrescar el token
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          const response = await authService.refreshToken();
          // Actualizar usuario con los nuevos datos
          const { token: newToken, refreshToken: newRefreshToken, ...userData } = response;
          setUser(userData);
          return true;
        } else {
          // No hay refresh token, hacer logout
          await authService.logout();
          setUser(null);
          return false;
        }
      } catch (error) {
        console.error('Error al refrescar token:', error);
        await authService.logout();
        setUser(null);
        return false;
      }
    }

    // Token válido, verificar claims del JWT
    const tokenClaims = getTokenClaims(token);
    const roleFromToken = getRoleFromToken(token);
    
    // Si hay un usuario guardado, verificar que el rol coincida con el token
    if (savedUser) {
      // Actualizar rol desde el token (más confiable que localStorage)
      const updatedUser = {
        ...savedUser,
        role: roleFromToken || savedUser.role,
        // Agregar información adicional del token si está disponible
        email: tokenClaims?.sub || tokenClaims?.email || savedUser.email,
        userId: tokenClaims?.userId || tokenClaims?.id || savedUser.id
      };
      setUser(updatedUser);
      return true;
    }

    // Si no hay usuario guardado pero hay token válido, obtener del servidor
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      await authService.logout();
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    // Verificar estado inicial
    verifyAndUpdateUser()
      .finally(() => {
        setLoading(false);
      });
  }, [verifyAndUpdateUser]);

  // Verificar token periódicamente (cada 5 minutos)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      verifyAndUpdateUser();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user, verifyAndUpdateUser]);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      // Verificar claims del JWT después del login
      const token = authService.getToken();
      const roleFromToken = getRoleFromToken(token);
      const updatedResponse = {
        ...response,
        role: roleFromToken || response.role
      };
      setUser(updatedResponse);
      
      // Configurar usuario en el servicio de logging
      errorLoggingService.setUser(updatedResponse);
      
      return updatedResponse;
    } catch (error) {
      // Log de errores de login
      errorLoggingService.logError(error, null, {
        level: 'error',
        tags: {
          authError: true,
          action: 'login',
        },
        extra: {
          email: email, // No incluir contraseña por seguridad
        },
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      
      // Limpiar usuario del servicio de logging
      errorLoggingService.clearUser();
    } catch (error) {
      // Log de errores de logout (pero continuar con el logout local)
      errorLoggingService.logError(error, null, {
        level: 'warning',
        tags: {
          authError: true,
          action: 'logout',
        },
      });
      // Continuar con logout local aunque falle el logout en el servidor
      setUser(null);
      errorLoggingService.clearUser();
    }
  };

  // Verificar si es admin desde el token JWT (más confiable)
  const isAdmin = useCallback(() => {
    const token = authService.getToken();
    if (!token) return false;
    
    // Verificar desde el token JWT primero
    if (hasRole(token, 'ADMIN')) {
      return true;
    }
    
    // Fallback al rol del usuario guardado
    return user?.role?.toUpperCase() === 'ADMIN';
  }, [user]);

  // Verificar si tiene un rol específico
  const hasUserRole = useCallback((role) => {
    const token = authService.getToken();
    if (!token) return false;
    
    return hasRole(token, role);
  }, []);

  // Verificar si el token está expirado
  const isTokenValid = useCallback(() => {
    const token = authService.getToken();
    if (!token) return false;
    return !isTokenExpired(token);
  }, []);

  // Memoizar valores calculados
  const isAuthenticated = useMemo(() => {
    return !!user && isTokenValid();
  }, [user, isTokenValid]);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => ({
    user,
    setUser,
    loading,
    login,
    logout,
    isAdmin,
    hasUserRole,
    isTokenValid,
    isAuthenticated,
    verifyAndUpdateUser
  }), [user, loading, login, logout, isAdmin, hasUserRole, isTokenValid, isAuthenticated, verifyAndUpdateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

