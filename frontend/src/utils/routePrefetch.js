/**
 * Utilidades para prefetching inteligente de rutas
 * Pre-carga rutas que probablemente se visitarán para mejorar la experiencia del usuario
 */

/**
 * Prefetch de un módulo lazy
 * @param {Function} lazyImport - Función lazy import
 */
export const prefetchRoute = (lazyImport) => {
  if (typeof lazyImport === 'function') {
    lazyImport();
  }
};

/**
 * Prefetch de múltiples rutas
 * @param {Array<Function>} lazyImports - Array de funciones lazy import
 */
export const prefetchRoutes = (lazyImports) => {
  lazyImports.forEach(lazyImport => {
    if (typeof lazyImport === 'function') {
      lazyImport();
    }
  });
};

/**
 * Prefetch de rutas comunes después de que la página principal haya cargado
 * Se ejecuta cuando el usuario está inactivo (idle)
 */
export const prefetchCommonRoutes = () => {
  // Esperar a que el navegador esté idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Prefetch rutas más comunes
      const commonRoutes = [
        () => import('../pages/Products'),
        () => import('../pages/Categories'),
        () => import('../pages/Contact'),
      ];
      
      commonRoutes.forEach(route => {
        route().catch(err => {
          console.warn('Error prefetching route:', err);
        });
      });
    }, { timeout: 2000 });
  } else {
    // Fallback para navegadores sin requestIdleCallback
    setTimeout(() => {
      const commonRoutes = [
        () => import('../pages/Products'),
        () => import('../pages/Categories'),
        () => import('../pages/Contact'),
      ];
      
      commonRoutes.forEach(route => {
        route().catch(err => {
          console.warn('Error prefetching route:', err);
        });
      });
    }, 3000);
  }
};

/**
 * Prefetch de rutas relacionadas cuando el usuario está en una página específica
 * @param {string} currentRoute - Ruta actual
 */
export const prefetchRelatedRoutes = (currentRoute) => {
  const routeMap = {
    '/': [
      () => import('../pages/Products'),
      () => import('../pages/Categories'),
    ],
    '/products': [
      () => import('../pages/ProductDetail'),
      () => import('../pages/Categories'),
    ],
    '/categories': [
      () => import('../pages/Products'),
    ],
    '/login': [
      () => import('../pages/Register'),
      () => import('../pages/ForgotPassword'),
    ],
  };

  const relatedRoutes = routeMap[currentRoute];
  if (relatedRoutes && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      relatedRoutes.forEach(route => {
        route().catch(err => {
          console.warn('Error prefetching related route:', err);
        });
      });
    }, { timeout: 2000 });
  }
};
