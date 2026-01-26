# Autenticación y Permisos

Este documento describe cómo funciona la autenticación y el sistema de permisos en el frontend.

## Mejoras de Seguridad Implementadas

### 1. Verificación de Claims del JWT

El frontend ahora **decodifica y verifica las claims del JWT** antes de confiar en los datos almacenados en localStorage. Esto proporciona:

- ✅ **Verificación de expiración**: El token se verifica antes de cada request
- ✅ **Verificación de roles**: Los roles se leen directamente del JWT
- ✅ **Mayor seguridad**: No se confía únicamente en localStorage

### 2. Interceptor de Axios Mejorado

El interceptor ahora:
- Verifica expiración del token **antes** de hacer requests
- Refresca tokens automáticamente si están cerca de expirar
- Maneja errores 401 y refresh tokens de forma robusta

### 3. ProtectedRoute Mejorado

Ahora verifica:
- Expiración del token desde las claims del JWT
- Rol del usuario desde el token (no solo localStorage)
- Limpia tokens expirados automáticamente

## Uso de Hooks y Componentes

### useAuth Hook

Hook principal para autenticación:

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    isTokenValid,
    login, 
    logout 
  } = useAuth();

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div>
      <p>Usuario: {user?.name}</p>
      {isAdmin() && <AdminPanel />}
    </div>
  );
}
```

### useRole Hook

Hook para verificar roles desde el JWT:

```jsx
import { useRole } from '../hooks/useRole';

function MyComponent() {
  const { 
    userRole, 
    isAdmin, 
    hasUserRole, 
    hasAnyRole,
    hasAllRoles 
  } = useRole();

  return (
    <div>
      <p>Rol actual: {userRole}</p>
      
      {isAdmin && <AdminButton />}
      
      {hasUserRole('MODERATOR') && <ModeratorPanel />}
      
      {hasAnyRole('ADMIN', 'MODERATOR') && <ModerationTools />}
      
      {hasAllRoles('ADMIN', 'SUPER_ADMIN') && <SuperAdminPanel />}
    </div>
  );
}
```

### useToken Hook

Hook para información del token JWT:

```jsx
import { useToken } from '../hooks/useToken';

function TokenInfo() {
  const { 
    isExpired, 
    timeRemaining, 
    formattedTimeRemaining,
    claims, 
    role,
    email,
    expirationTime,
    refreshToken 
  } = useToken();

  if (isExpired) {
    return <div>Token expirado</div>;
  }

  return (
    <div>
      <p>Token válido</p>
      <p>Tiempo restante: {formattedTimeRemaining}</p>
      <p>Rol: {role}</p>
      <p>Email: {email}</p>
      <p>Expira: {expirationTime?.toLocaleString()}</p>
      <button onClick={refreshToken}>Refrescar Token</button>
    </div>
  );
}
```

### RoleGuard Component

Componente para mostrar/ocultar contenido basado en roles:

```jsx
import RoleGuard from '../components/RoleGuard';

function MyPage() {
  return (
    <div>
      {/* Solo visible para admins */}
      <RoleGuard role="ADMIN">
        <AdminPanel />
      </RoleGuard>

      {/* Visible para admins o moderadores */}
      <RoleGuard role={['ADMIN', 'MODERATOR']}>
        <ModerationPanel />
      </RoleGuard>

      {/* Con contenido alternativo */}
      <RoleGuard 
        role="ADMIN" 
        fallback={<div>No tienes permisos para ver esto</div>}
      >
        <AdminOnlyContent />
      </RoleGuard>

      {/* Requiere todos los roles (AND) */}
      <RoleGuard role={['ADMIN', 'SUPER_ADMIN']} requireAll>
        <SuperAdminContent />
      </RoleGuard>
    </div>
  );
}
```

### ProtectedRoute

Protege rutas completas:

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

// Ruta protegida (requiere autenticación)
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>

// Ruta de admin (requiere rol ADMIN)
<Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## Verificación de Expiración

El sistema verifica automáticamente la expiración del token:

1. **Antes de cada request**: El interceptor de Axios verifica si el token está expirado
2. **En ProtectedRoute**: Se verifica antes de renderizar la ruta
3. **En AuthContext**: Se verifica periódicamente (cada 5 minutos)
4. **Refresh automático**: Si el token está cerca de expirar (< 1 minuto), se refresca proactivamente

## Mejores Prácticas

### ✅ Hacer

- Usar `useRole()` para verificar roles en componentes
- Usar `RoleGuard` para mostrar/ocultar contenido basado en roles
- Verificar `isTokenValid()` antes de operaciones críticas
- Usar `ProtectedRoute` para proteger rutas completas

### ❌ Evitar

- No confiar solo en `user.role` de localStorage
- No verificar roles solo con `user?.role === 'ADMIN'`
- No ignorar la expiración del token
- No hacer requests sin verificar el token primero

## Ejemplo Completo

```jsx
import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';
import { useToken } from '../hooks/useToken';
import RoleGuard from '../components/RoleGuard';
import ProtectedRoute from '../components/ProtectedRoute';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const { isAdmin, hasUserRole } = useRole();
  const { formattedTimeRemaining, refreshToken } = useToken();

  return (
    <div>
      <h1>Panel de Administración</h1>
      
      <div>
        <p>Usuario: {user?.name}</p>
        <p>Token expira en: {formattedTimeRemaining}</p>
        <button onClick={refreshToken}>Refrescar Token</button>
      </div>

      {/* Solo visible para admins */}
      {isAdmin && (
        <RoleGuard role="ADMIN">
          <AdminSettings />
        </RoleGuard>
      )}

      {/* Visible para moderadores o admins */}
      <RoleGuard role={['ADMIN', 'MODERATOR']}>
        <ModerationTools />
      </RoleGuard>

      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}

// En App.jsx
<Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## Seguridad

### Verificaciones Implementadas

1. **Expiración del token**: Verificada desde las claims del JWT
2. **Roles**: Leídos directamente del JWT, no solo de localStorage
3. **Refresh automático**: Tokens se refrescan antes de expirar
4. **Limpieza automática**: Tokens expirados se eliminan automáticamente

### Limitaciones

- ⚠️ El frontend **NO verifica la firma** del JWT (eso se hace en el backend)
- ⚠️ El frontend solo **decodifica** el JWT para leer claims
- ⚠️ La seguridad real depende del backend que verifica la firma

## Troubleshooting

### Token expirado constantemente

- Verificar que el refresh token esté funcionando
- Revisar la configuración de expiración en el backend
- Verificar que el reloj del sistema esté sincronizado

### Roles no se actualizan

- Verificar que el backend esté enviando el rol en el JWT
- Limpiar localStorage y hacer login nuevamente
- Verificar que el token se esté refrescando correctamente

### Componentes no se muestran/ocultan

- Verificar que se esté usando `useRole()` o `RoleGuard`
- Verificar que el rol en el JWT coincida con el esperado
- Revisar la consola para errores de decodificación del JWT
