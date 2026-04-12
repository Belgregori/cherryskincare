import { useRole } from '../hooks/useRole';

/**
 * Componente para mostrar/ocultar contenido basado en roles del usuario.
 * 
 * Verifica roles desde las claims del JWT, no solo desde localStorage.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido a mostrar si el usuario tiene el rol
 * @param {string|string[]} props.role - Rol o roles requeridos
 * @param {boolean} props.requireAll - Si true, requiere todos los roles (AND), si false, cualquiera (OR)
 * @param {React.ReactNode} props.fallback - Contenido a mostrar si no tiene el rol (opcional)
 * 
 * @example
 * // Mostrar solo a admins
 * <RoleGuard role="ADMIN">
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * // Mostrar a admins o moderadores
 * <RoleGuard role={['ADMIN', 'MODERATOR']}>
 *   <ModerationPanel />
 * </RoleGuard>
 * 
 * // Mostrar contenido alternativo si no tiene el rol
 * <RoleGuard role="ADMIN" fallback={<div>No tienes permisos</div>}>
 *   <AdminPanel />
 * </RoleGuard>
 */
function RoleGuard({ 
  children, 
  role, 
  requireAll = false,
  fallback = null 
}) {
  const { hasUserRole, hasAnyRole, hasAllRoles } = useRole();

  if (!role) {
    return children;
  }

  // Convertir role a array si es string
  const roles = Array.isArray(role) ? role : [role];

  // Verificar roles
  let hasRequiredRole = false;
  if (requireAll) {
    hasRequiredRole = hasAllRoles(...roles);
  } else {
    hasRequiredRole = hasAnyRole(...roles);
  }

  if (hasRequiredRole) {
    return children;
  }

  return fallback;
}

export default RoleGuard;
