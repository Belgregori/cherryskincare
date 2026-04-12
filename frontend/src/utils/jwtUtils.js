/**
 * Utilidades para trabajar con tokens JWT en el frontend.
 * 
 * NOTA: Estas funciones solo DECODIFICAN el JWT, NO verifican la firma.
 * La verificación de la firma debe hacerse en el backend.
 * 
 * Estas utilidades son útiles para:
 * - Verificar expiración del token antes de hacer requests
 * - Leer claims (rol, email, etc.) sin hacer requests al servidor
 * - Mostrar/ocultar componentes basados en roles
 */

/**
 * Decodifica un token JWT sin verificar la firma.
 * 
 * @param {string} token - El token JWT
 * @returns {object|null} - El payload decodificado o null si es inválido
 */
export const decodeJWT = (token) => {
  if (!token) {
    return null;
  }

  try {
    // Un JWT tiene 3 partes separadas por puntos: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decodificar el payload (segunda parte)
    // Base64URL decode
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
};

/**
 * Verifica si un token JWT está expirado.
 * 
 * @param {string} token - El token JWT
 * @returns {boolean} - true si está expirado o inválido, false si es válido
 */
export const isTokenExpired = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // exp está en segundos, Date.now() está en milisegundos
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  
  // Agregar un margen de 30 segundos para evitar usar tokens que están a punto de expirar
  const margin = 30 * 1000; // 30 segundos
  
  return currentTime >= (expirationTime - margin);
};

/**
 * Obtiene el tiempo restante hasta la expiración del token en milisegundos.
 * 
 * @param {string} token - El token JWT
 * @returns {number|null} - Tiempo restante en milisegundos, o null si es inválido/expirado
 */
export const getTokenTimeRemaining = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const remaining = expirationTime - currentTime;
  
  return remaining > 0 ? remaining : null;
};

/**
 * Obtiene el rol del usuario desde el token JWT.
 * 
 * @param {string} token - El token JWT
 * @returns {string|null} - El rol del usuario o null si no está disponible
 */
export const getRoleFromToken = (token) => {
  const payload = decodeJWT(token);
  return payload?.role || payload?.authorities?.[0] || null;
};

/**
 * Obtiene el email del usuario desde el token JWT.
 * 
 * @param {string} token - El token JWT
 * @returns {string|null} - El email del usuario o null si no está disponible
 */
export const getEmailFromToken = (token) => {
  const payload = decodeJWT(token);
  return payload?.sub || payload?.email || null;
};

/**
 * Obtiene el ID del usuario desde el token JWT.
 * 
 * @param {string} token - El token JWT
 * @returns {number|string|null} - El ID del usuario o null si no está disponible
 */
export const getUserIdFromToken = (token) => {
  const payload = decodeJWT(token);
  return payload?.userId || payload?.id || payload?.sub || null;
};

/**
 * Verifica si el usuario tiene un rol específico.
 * 
 * @param {string} token - El token JWT
 * @param {string} role - El rol a verificar (ej: 'ADMIN', 'USER')
 * @returns {boolean} - true si el usuario tiene el rol, false en caso contrario
 */
export const hasRole = (token, role) => {
  const userRole = getRoleFromToken(token);
  if (!userRole || !role) {
    return false;
  }
  return userRole.toUpperCase() === role.toUpperCase();
};

/**
 * Obtiene todas las claims del token JWT.
 * 
 * @param {string} token - El token JWT
 * @returns {object|null} - Todas las claims o null si es inválido
 */
export const getTokenClaims = (token) => {
  return decodeJWT(token);
};
