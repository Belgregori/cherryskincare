import { useAuth } from '../context/AuthContext';
import { 
  isTokenExpired, 
  getTokenTimeRemaining,
  getTokenClaims,
  getRoleFromToken,
  getEmailFromToken 
} from '../utils/jwtUtils';
import { authService } from '../services/authService';

/**
 * Hook personalizado para trabajar con el token JWT.
 * 
 * Proporciona información sobre el estado del token y sus claims.
 * 
 * @returns {object} - Objeto con información y funciones relacionadas con el token
 * 
 * @example
 * const { isExpired, timeRemaining, claims, refreshToken } = useToken();
 * 
 * if (isExpired) {
 *   // Token expirado, refrescar o redirigir
 * }
 * 
 * const minutesLeft = Math.floor(timeRemaining / 60000);
 * console.log(`Token expira en ${minutesLeft} minutos`);
 */
export const useToken = () => {
  const { isTokenValid, verifyAndUpdateUser } = useAuth();
  const token = authService.getToken();

  // Verificar si el token está expirado
  const isExpired = token ? isTokenExpired(token) : true;

  // Obtener tiempo restante hasta la expiración
  const timeRemaining = token ? getTokenTimeRemaining(token) : null;

  // Obtener todas las claims del token
  const claims = token ? getTokenClaims(token) : null;

  // Información útil extraída del token
  const role = token ? getRoleFromToken(token) : null;
  const email = token ? getEmailFromToken(token) : null;
  const expirationTime = claims?.exp ? new Date(claims.exp * 1000) : null;

  // Función para refrescar el token manualmente
  const refreshToken = async () => {
    try {
      await verifyAndUpdateUser();
      return true;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return false;
    }
  };

  // Formatear tiempo restante en formato legible
  const getFormattedTimeRemaining = () => {
    if (!timeRemaining || timeRemaining <= 0) {
      return 'Expirado';
    }

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  return {
    token,
    isExpired,
    isValid: isTokenValid(),
    timeRemaining,
    formattedTimeRemaining: getFormattedTimeRemaining(),
    claims,
    role,
    email,
    expirationTime,
    refreshToken
  };
};
