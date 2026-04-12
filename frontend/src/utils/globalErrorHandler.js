import { errorLoggingService } from '../services/errorLoggingService';

/**
 * Errores JS no capturados (no incluye fallos de carga de img/script: van en onResourceError).
 */
function onUnhandledJsError(event) {
  if (event.target && event.target !== window) {
    return;
  }
  const error = event.error || new Error(event.message);
  errorLoggingService.logError(error, null, {
    level: 'error',
    tags: {
      globalError: true,
      type: 'javascript',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
    extra: {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    },
  });
}

function onUnhandledRejection(event) {
  const error =
    event.reason instanceof Error ? event.reason : new Error(String(event.reason));

  errorLoggingService.logError(error, null, {
    level: 'error',
    tags: {
      globalError: true,
      type: 'unhandledPromiseRejection',
    },
    extra: {
      reason: event.reason,
    },
  });
}

function onResourceError(event) {
  if (!event.target || event.target === window) {
    return;
  }
  const resourceType = event.target.tagName?.toLowerCase() || 'unknown';

  errorLoggingService.logWarning('Error al cargar recurso', {
    type: resourceType,
    source: event.target.src || event.target.href,
    message: `Error al cargar ${resourceType}`,
  });
}

let globalHandlersInstalled = false;

/**
 * Configura el manejo global de errores no capturados.
 */
export const setupGlobalErrorHandling = () => {
  if (globalHandlersInstalled) {
    return;
  }
  window.addEventListener('error', onUnhandledJsError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);
  window.addEventListener('error', onResourceError, true);
  globalHandlersInstalled = true;

  if (import.meta.env.DEV) {
    console.log('Manejo global de errores configurado');
  }
};

/**
 * Quita los listeners (tests o desmontaje controlado de la app).
 */
export const cleanupGlobalErrorHandling = () => {
  if (!globalHandlersInstalled) {
    return;
  }
  window.removeEventListener('error', onUnhandledJsError);
  window.removeEventListener('unhandledrejection', onUnhandledRejection);
  window.removeEventListener('error', onResourceError, true);
  globalHandlersInstalled = false;

  if (import.meta.env.DEV) {
    console.log('Manejo global de errores desinstalado');
  }
};
