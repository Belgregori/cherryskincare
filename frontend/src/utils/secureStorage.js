/**
 * Servicio de almacenamiento seguro para tokens y datos sensibles
 * 
 * Estrategia:
 * - sessionStorage por defecto (más seguro, se borra al cerrar pestaña)
 * - localStorage opcional para "recordar sesión" (menos seguro pero más conveniente)
 * - Sanitización de todos los valores antes de guardar
 */

import { sanitizeString } from './sanitize';

// Configuración de almacenamiento
const STORAGE_CONFIG = {
  // Usar sessionStorage por defecto (más seguro)
  useSessionStorage: true,
  // Prefijo para todas las claves (evita conflictos)
  keyPrefix: 'cherry_',
  // Claves que siempre deben usar sessionStorage (más seguro)
  sessionOnlyKeys: ['token', 'refreshToken'],
};

/**
 * Obtiene el almacenamiento a usar según la configuración
 * @param {string} key - Clave del valor
 * @returns {Storage} - localStorage o sessionStorage
 */
const getStorage = (key) => {
  // Tokens siempre en sessionStorage (más seguro)
  if (STORAGE_CONFIG.sessionOnlyKeys.includes(key)) {
    return sessionStorage;
  }

  // Usar sessionStorage por defecto
  if (STORAGE_CONFIG.useSessionStorage) {
    return sessionStorage;
  }

  return localStorage;
};

/**
 * Genera una clave completa con prefijo
 * @param {string} key - Clave base
 * @returns {string} - Clave completa
 */
const getFullKey = (key) => {
  return `${STORAGE_CONFIG.keyPrefix}${key}`;
};

/**
 * Guarda un valor de forma segura
 * @param {string} key - Clave
 * @param {any} value - Valor a guardar
 * @param {boolean} useSessionStorage - Forzar sessionStorage (opcional)
 * @returns {boolean} - true si se guardó correctamente
 */
export const secureSetItem = (key, value, useSessionStorage = null) => {
  try {
    const storage = useSessionStorage !== null 
      ? (useSessionStorage ? sessionStorage : localStorage)
      : getStorage(key);
    
    const fullKey = getFullKey(key);
    
    // Sanitizar el valor antes de guardar
    let sanitizedValue = value;
    if (typeof value === 'string') {
      sanitizedValue = sanitizeString(value);
    } else if (typeof value === 'object') {
      sanitizedValue = JSON.stringify(value);
    }
    
    storage.setItem(fullKey, sanitizedValue);
    return true;
  } catch (error) {
    console.error(`Error guardando ${key} en almacenamiento seguro:`, error);
    
    // Si es error de cuota, intentar limpiar
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('Cuota de almacenamiento excedida, limpiando...');
      try {
        // Limpiar items temporales
        const storage = getStorage(key);
        for (let i = 0; i < storage.length; i++) {
          const storageKey = storage.key(i);
          if (storageKey && storageKey.startsWith(`${STORAGE_CONFIG.keyPrefix}temp_`)) {
            storage.removeItem(storageKey);
          }
        }
        // Intentar de nuevo
        return secureSetItem(key, value, useSessionStorage);
      } catch (retryError) {
        console.error('Error en reintento:', retryError);
      }
    }
    
    return false;
  }
};

/**
 * Obtiene un valor de forma segura
 * @param {string} key - Clave
 * @param {any} defaultValue - Valor por defecto
 * @returns {any} - Valor obtenido o defaultValue
 */
export const secureGetItem = (key, defaultValue = null) => {
  try {
    // Intentar primero con sessionStorage (más seguro)
    const sessionKey = getFullKey(key);
    let value = sessionStorage.getItem(sessionKey);
    
    // Si no está en sessionStorage y no es una clave de sesión, intentar localStorage
    if (value === null && !STORAGE_CONFIG.sessionOnlyKeys.includes(key)) {
      const localKey = getFullKey(key);
      value = localStorage.getItem(localKey);
    }
    
    if (value === null) {
      return defaultValue;
    }
    
    // Intentar parsear como JSON
    try {
      return JSON.parse(value);
    } catch {
      // Si no es JSON, devolver como string
      return value;
    }
  } catch (error) {
    console.error(`Error obteniendo ${key} de almacenamiento seguro:`, error);
    return defaultValue;
  }
};

/**
 * Elimina un valor de forma segura
 * @param {string} key - Clave
 */
export const secureRemoveItem = (key) => {
  try {
    const sessionKey = getFullKey(key);
    const localKey = getFullKey(key);
    
    sessionStorage.removeItem(sessionKey);
    localStorage.removeItem(localKey);
  } catch (error) {
    console.error(`Error eliminando ${key} de almacenamiento seguro:`, error);
  }
};

/**
 * Limpia todo el almacenamiento seguro
 */
export const secureClear = () => {
  try {
    // Limpiar sessionStorage
    const sessionKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(STORAGE_CONFIG.keyPrefix)) {
        sessionKeys.push(key);
      }
    }
    sessionKeys.forEach(key => sessionStorage.removeItem(key));
    
    // Limpiar localStorage
    const localKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_CONFIG.keyPrefix)) {
        localKeys.push(key);
      }
    }
    localKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error limpiando almacenamiento seguro:', error);
  }
};

/**
 * Configura el tipo de almacenamiento a usar
 * @param {boolean} useSessionStorage - true para sessionStorage, false para localStorage
 */
export const setStorageType = (useSessionStorage) => {
  STORAGE_CONFIG.useSessionStorage = useSessionStorage;
};

/**
 * Obtiene el tipo de almacenamiento actual
 * @returns {boolean} - true si usa sessionStorage
 */
export const getStorageType = () => {
  return STORAGE_CONFIG.useSessionStorage;
};
