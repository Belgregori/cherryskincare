import { useAuth } from '../context/AuthContext';
import { hasRole, getRoleFromToken } from '../utils/jwtUtils';
import { authService } from '../services/authService';

/**
 * Hook personalizado para verificar roles del usuario.
 * 
 * Este hook verifica roles desde las claims del JWT, no solo desde localStorage,
 * lo que proporciona mayor seguridad y precisión.
 * 
 * @returns {object} - Objeto con funciones y propiedades relacionadas con roles
 * 
 * @example
 * const { isAdmin, hasUserRole, userRole } = useRole();
 * 
 * if (isAdmin) {
 *   // Mostrar contenido de admin
 * }
 * 
 * if (hasUserRole('MODERATOR')) {
 *   // Mostrar contenido de moderador
 * }
 */
export const useRole = () => {
  const { user, isAdmin, hasUserRole: hasUserRoleFromContext } = useAuth();
  const token = authService.getToken();

  // Obtener rol desde el token JWT (más confiable)
  const userRole = token ? getRoleFromToken(token) : user?.role;

  // Verificar si es admin (desde token JWT)
  const isAdminFromToken = token ? hasRole(token, 'ADMIN') : false;
  const isAdminValue = isAdminFromToken || isAdmin();

  // Función para verificar cualquier rol
  const hasUserRole = (role) => {
    if (!role) return false;
    if (token) {
      return hasRole(token, role);
    }
    return hasUserRoleFromContext ? hasUserRoleFromContext(role) : false;
  };

  // Verificar si tiene múltiples roles (OR)
  const hasAnyRole = (...roles) => {
    return roles.some(role => hasUserRole(role));
  };

  // Verificar si tiene todos los roles (AND)
  const hasAllRoles = (...roles) => {
    return roles.every(role => hasUserRole(role));
  };

  return {
    userRole,
    isAdmin: isAdminValue,
    hasUserRole,
    hasAnyRole,
    hasAllRoles,
    isAuthenticated: !!token && !!user
  };
};
