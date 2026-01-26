import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isTokenExpired } from '../utils/jwtUtils';
import { authService } from '../services/authService';

/**
 * Componente para proteger rutas que requieren autenticación.
 * 
 * Mejoras de seguridad:
 * - Verifica expiración del token desde las claims del JWT
 * - Verifica rol desde el token JWT (no solo localStorage)
 * - Maneja tokens expirados automáticamente
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 * @param {boolean} props.requireAdmin - Si true, requiere rol ADMIN
 */
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isTokenValid, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  // Verificar token directamente desde JWT (doble verificación)
  const token = authService.getToken();
  const tokenExpired = token ? isTokenExpired(token) : true;

  // Si el token está expirado o no hay token, redirigir al login
  if (!token || tokenExpired || !isAuthenticated || !isTokenValid()) {
    // Limpiar datos inválidos
    if (tokenExpired) {
      authService.logout();
    }
    return <Navigate to={requireAdmin ? "/admin/login" : "/login"} replace />;
  }

  // Si requiere admin, verificar rol desde el token JWT
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

