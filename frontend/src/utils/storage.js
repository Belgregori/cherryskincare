/**
 * Utilidades para manejo seguro de localStorage y sessionStorage
 * Incluye manejo de errores y fallbacks
 */

/**
 * Obtiene un valor de localStorage de forma segura
 * @param {string} key - Clave del valor a obtener
 * @param {*} defaultValue - Valor por defecto si no existe o hay error
 * @returns {*} Valor parseado o defaultValue
 */
export const safeGetLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    // Intentar limpiar el valor corrupto
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.error(`Error removing corrupted ${key}:`, removeError);
    }
    return defaultValue;
  }
};

/**
 * Guarda un valor en localStorage de forma segura
 * @param {string} key - Clave del valor a guardar
 * @param {*} value - Valor a guardar (será serializado a JSON)
 * @returns {boolean} true si se guardó correctamente, false en caso contrario
 */
export const safeSetLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    
    // Si es error de cuota excedida, intentar limpiar espacio
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('localStorage quota exceeded, attempting cleanup...');
      try {
        // Limpiar items antiguos o no críticos
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey && storageKey.startsWith('temp_')) {
            keysToRemove.push(storageKey);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
        // Intentar guardar de nuevo
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error('Failed to free localStorage space:', retryError);
        // Fallback: usar sessionStorage como último recurso
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
          console.warn(`Fell back to sessionStorage for ${key}`);
          return true;
        } catch (sessionError) {
          console.error('Failed to use sessionStorage fallback:', sessionError);
          return false;
        }
      }
    }
    
    return false;
  }
};

/**
 * Elimina un valor de localStorage de forma segura
 * @param {string} key - Clave del valor a eliminar
 */
export const safeRemoveLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

/**
 * Limpia todo el localStorage de forma segura
 */
export const safeClearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Verifica si localStorage está disponible
 * @returns {boolean} true si localStorage está disponible
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene el tamaño aproximado de localStorage usado
 * @returns {number} Tamaño en bytes
 */
export const getLocalStorageSize = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

/**
 * Obtiene el tamaño máximo aproximado de localStorage
 * @returns {number} Tamaño máximo en bytes (típicamente 5-10MB)
 */
export const getLocalStorageMaxSize = () => {
  // Típicamente 5-10MB dependiendo del navegador
  return 5 * 1024 * 1024; // 5MB como estimación conservadora
};
