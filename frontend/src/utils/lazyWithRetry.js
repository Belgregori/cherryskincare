/**
 * Utilidad para lazy loading con retry en caso de error de red
 * Útil para conexiones inestables
 */

/**
 * Crea un lazy import con retry automático
 * @param {Function} importFn - Función de importación
 * @param {number} retries - Número de reintentos (default: 3)
 * @param {number} delay - Delay entre reintentos en ms (default: 1000)
 * @returns {Promise} Promise que resuelve con el módulo
 */
export const lazyWithRetry = (importFn, retries = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
    const attemptImport = (remainingRetries) => {
      importFn()
        .then(resolve)
        .catch((error) => {
          if (remainingRetries > 0) {
            console.warn(
              `Failed to load module, retrying... (${remainingRetries} attempts left)`,
              error
            );
            setTimeout(() => {
              attemptImport(remainingRetries - 1);
            }, delay);
          } else {
            console.error('Failed to load module after all retries:', error);
            reject(error);
          }
        });
    };

    attemptImport(retries);
  });
};

/**
 * Wrapper para React.lazy con retry
 * @param {Function} importFn - Función de importación
 * @param {number} retries - Número de reintentos (default: 3)
 * @returns {React.LazyExoticComponent} Componente lazy con retry
 */
export const createLazyComponent = (importFn, retries = 3) => {
  const { lazy } = require('react');
  return lazy(() => lazyWithRetry(importFn, retries));
};
