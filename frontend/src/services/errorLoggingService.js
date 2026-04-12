/**
 * Servicio de logging de errores.
 * 
 * Permite enviar errores a diferentes servicios de logging:
 * - Sentry
 * - LogRocket
 * - Console (desarrollo)
 * - API personalizada
 * 
 * Para habilitar un servicio, configurar las variables de entorno correspondientes.
 */

class ErrorLoggingService {
  constructor() {
    this.sentryEnabled = false;
    this.logRocketEnabled = false;
    this.apiEndpoint = null;
    this.environment = import.meta.env.MODE || 'development';
    
    this.initializeServices();
  }

  /**
   * Inicializa los servicios de logging según la configuración.
   */
  initializeServices() {
    // Sentry
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    if (sentryDsn) {
      this.initializeSentry(sentryDsn);
    }

    // LogRocket
    const logRocketId = import.meta.env.VITE_LOGROCKET_ID;
    if (logRocketId) {
      this.initializeLogRocket(logRocketId);
    }

    // API personalizada
    const apiEndpoint = import.meta.env.VITE_ERROR_LOGGING_API;
    if (apiEndpoint) {
      this.apiEndpoint = apiEndpoint;
    }
  }

  /**
   * Inicializa Sentry (requiere @sentry/react instalado).
   * 
   * Para usar Sentry:
   * 1. npm install @sentry/react
   * 2. Configurar VITE_SENTRY_DSN en .env
   * 3. Descomentar el código de inicialización
   */
  initializeSentry(dsn) {
    try {
      // Descomentar cuando se instale @sentry/react
      /*
      import * as Sentry from '@sentry/react';
      
      Sentry.init({
        dsn: dsn,
        environment: this.environment,
        integrations: [
          new Sentry.BrowserTracing(),
          new Sentry.Replay(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      
      this.sentryEnabled = true;
      */
      console.log('Sentry configurado (requiere instalación de @sentry/react)');
    } catch (error) {
      console.warn('Error al inicializar Sentry:', error);
    }
  }

  /**
   * Inicializa LogRocket (requiere logrocket instalado).
   * 
   * Para usar LogRocket:
   * 1. npm install logrocket
   * 2. Configurar VITE_LOGROCKET_ID en .env
   * 3. Descomentar el código de inicialización
   */
  initializeLogRocket(appId) {
    try {
      // Descomentar cuando se instale logrocket
      /*
      import LogRocket from 'logrocket';
      
      LogRocket.init(appId);
      this.logRocketEnabled = true;
      */
      console.log('LogRocket configurado (requiere instalación de logrocket)');
    } catch (error) {
      console.warn('Error al inicializar LogRocket:', error);
    }
  }

  /**
   * Obtiene información del contexto del error.
   */
  getErrorContext(error, errorInfo = null) {
    return {
      message: error?.message || 'Error desconocido',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      userId: this.getUserId(),
      userEmail: this.getUserEmail(),
    };
  }

  /**
   * Obtiene el ID del usuario actual (si está autenticado).
   */
  getUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user.userId || null;
    } catch {
      return null;
    }
  }

  /**
   * Obtiene el email del usuario actual (si está autenticado).
   */
  getUserEmail() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.email || null;
    } catch {
      return null;
    }
  }

  /**
   * Envía un error a Sentry.
   */
  logToSentry(error, errorInfo = null) {
    if (!this.sentryEnabled) return;

    try {
      // Descomentar cuando se instale @sentry/react
      /*
      import * as Sentry from '@sentry/react';
      
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo?.componentStack,
          },
        },
        tags: {
          errorBoundary: true,
        },
      });
      */
    } catch (err) {
      console.warn('Error al enviar a Sentry:', err);
    }
  }

  /**
   * Envía un error a LogRocket.
   */
  logToLogRocket(error, errorInfo = null) {
    if (!this.logRocketEnabled) return;

    try {
      // Descomentar cuando se instale logrocket
      /*
      import LogRocket from 'logrocket';
      
      LogRocket.captureException(error, {
        tags: {
          errorBoundary: true,
        },
        extra: {
          componentStack: errorInfo?.componentStack,
        },
      });
      */
    } catch (err) {
      console.warn('Error al enviar a LogRocket:', err);
    }
  }

  /**
   * Envía un error a la API personalizada.
   */
  async logToAPI(error, errorInfo = null) {
    if (!this.apiEndpoint) return;

    try {
      const context = this.getErrorContext(error, errorInfo);
      
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            message: error?.message,
            stack: error?.stack,
            name: error?.name,
          },
          errorInfo: {
            componentStack: errorInfo?.componentStack,
          },
          context,
        }),
      });
    } catch (err) {
      console.warn('Error al enviar a API:', err);
    }
  }

  /**
   * Registra un error en la consola (siempre activo en desarrollo).
   */
  logToConsole(error, errorInfo = null) {
    const context = this.getErrorContext(error, errorInfo);
    
    console.group('🚨 Error capturado');
    console.error('Error:', error);
    if (errorInfo) {
      console.error('Error Info:', errorInfo);
    }
    console.table(context);
    console.groupEnd();
  }

  /**
   * Registra un error en todos los servicios configurados.
   * 
   * @param {Error} error - El error a registrar
   * @param {object} errorInfo - Información adicional del error (opcional)
   * @param {object} options - Opciones adicionales
   */
  async logError(error, errorInfo = null, options = {}) {
    const {
      level = 'error',
      tags = {},
      extra = {},
    } = options;

    // Siempre registrar en consola (especialmente útil en desarrollo)
    this.logToConsole(error, errorInfo);

    // Enviar a servicios externos (no bloqueante)
    Promise.all([
      this.logToSentry(error, errorInfo),
      this.logToLogRocket(error, errorInfo),
      this.logToAPI(error, errorInfo),
    ]).catch((err) => {
      console.warn('Error al enviar logs a servicios externos:', err);
    });
  }

  /**
   * Registra un mensaje de información.
   */
  logInfo(message, data = {}) {
    console.log(`ℹ️ ${message}`, data);
    
    // Enviar a servicios externos si están configurados
    if (this.sentryEnabled) {
      // Sentry.captureMessage(message, { level: 'info', extra: data });
    }
  }

  /**
   * Registra una advertencia.
   */
  logWarning(message, data = {}) {
    console.warn(`⚠️ ${message}`, data);
    
    // Enviar a servicios externos si están configurados
    if (this.sentryEnabled) {
      // Sentry.captureMessage(message, { level: 'warning', extra: data });
    }
  }

  /**
   * Configura el usuario actual en los servicios de logging.
   */
  setUser(user) {
    if (!user) return;

    try {
      // Sentry
      if (this.sentryEnabled) {
        // Sentry.setUser({
        //   id: user.id || user.userId,
        //   email: user.email,
        //   username: user.name || user.username,
        // });
      }

      // LogRocket
      if (this.logRocketEnabled) {
        // LogRocket.identify(user.id || user.userId, {
        //   email: user.email,
        //   name: user.name || user.username,
        // });
      }
    } catch (err) {
      console.warn('Error al configurar usuario en servicios de logging:', err);
    }
  }

  /**
   * Limpia la información del usuario (en logout).
   */
  clearUser() {
    try {
      // Sentry
      if (this.sentryEnabled) {
        // Sentry.setUser(null);
      }

      // LogRocket
      if (this.logRocketEnabled) {
        // LogRocket.identify(null);
      }
    } catch (err) {
      console.warn('Error al limpiar usuario en servicios de logging:', err);
    }
  }
}

// Exportar instancia singleton
export const errorLoggingService = new ErrorLoggingService();

// Exportar clase para testing
export default ErrorLoggingService;
