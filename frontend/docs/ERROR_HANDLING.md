# Manejo de Errores

Este documento describe el sistema de manejo de errores implementado en la aplicación.

## Componentes del Sistema

### 1. ErrorBoundary

Componente React que captura errores de renderizado en el árbol de componentes.

**Ubicación**: `src/components/ErrorBoundary.jsx`

**Características**:
- Captura errores de renderizado en componentes hijos
- Muestra UI amigable al usuario
- Envía errores al servicio de logging
- Genera ID único para cada error
- Muestra detalles del error en desarrollo

**Uso**:
```jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 2. Servicio de Logging de Errores

Servicio centralizado para registrar errores en múltiples servicios.

**Ubicación**: `src/services/errorLoggingService.js`

**Servicios Soportados**:
- **Sentry**: Monitoreo de errores y performance
- **LogRocket**: Grabación de sesiones y errores
- **API Personalizada**: Endpoint propio para logging
- **Console**: Siempre activo (especialmente útil en desarrollo)

### 3. Manejo Global de Errores

Captura errores no manejados a nivel global.

**Ubicación**: `src/utils/globalErrorHandler.js`

**Captura**:
- Errores de JavaScript no capturados (`window.onerror`)
- Promesas rechazadas no manejadas (`unhandledrejection`)
- Errores de recursos (imágenes, scripts, etc.)

## Configuración

### Variables de Entorno

Agregar al archivo `.env`:

```env
# Sentry (opcional)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# LogRocket (opcional)
VITE_LOGROCKET_ID=your-logrocket-id

# API personalizada (opcional)
VITE_ERROR_LOGGING_API=https://api.example.com/errors
```

### Instalación de Servicios Externos

#### Sentry

```bash
npm install @sentry/react
```

Luego descomentar el código en `errorLoggingService.js`:

```javascript
// En initializeSentry()
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: dsn,
  environment: this.environment,
  // ...
});
```

#### LogRocket

```bash
npm install logrocket
```

Luego descomentar el código en `errorLoggingService.js`:

```javascript
// En initializeLogRocket()
import LogRocket from 'logrocket';

LogRocket.init(appId);
```

## Uso

### Registrar Errores Manualmente

```javascript
import { errorLoggingService } from '../services/errorLoggingService';

try {
  // Tu código
} catch (error) {
  errorLoggingService.logError(error, null, {
    level: 'error',
    tags: {
      component: 'MyComponent',
      action: 'fetchData',
    },
    extra: {
      userId: user.id,
      data: someData,
    },
  });
}
```

### Registrar Información y Advertencias

```javascript
// Información
errorLoggingService.logInfo('Usuario completó checkout', {
  orderId: order.id,
  amount: order.total,
});

// Advertencia
errorLoggingService.logWarning('Stock bajo', {
  productId: product.id,
  currentStock: product.stock,
});
```

### Configurar Usuario en Servicios de Logging

El usuario se configura automáticamente al hacer login. Para configurarlo manualmente:

```javascript
import { errorLoggingService } from '../services/errorLoggingService';

errorLoggingService.setUser({
  id: user.id,
  email: user.email,
  name: user.name,
});
```

## Estructura de Errores Registrados

### ErrorBoundary

```javascript
{
  error: {
    message: "Error message",
    stack: "Error stack trace",
    name: "Error name"
  },
  errorInfo: {
    componentStack: "Component stack trace"
  },
  context: {
    message: "Error message",
    stack: "Error stack",
    componentStack: "Component stack",
    url: "https://example.com/page",
    userAgent: "Browser user agent",
    timestamp: "2024-01-01T00:00:00.000Z",
    environment: "production",
    userId: 123,
    userEmail: "user@example.com"
  },
  tags: {
    errorBoundary: true,
    errorId: "error-1234567890-abc123",
    component: "MyComponent"
  }
}
```

### Errores de API

```javascript
{
  error: {
    message: "API Error: 500 - Internal Server Error"
  },
  tags: {
    apiError: true,
    statusCode: 500,
    endpoint: "/api/products",
    method: "GET"
  },
  extra: {
    response: {
      status: 500,
      statusText: "Internal Server Error",
      data: { /* error data */ }
    },
    request: {
      url: "/api/products",
      method: "GET",
      headers: { /* request headers */ }
    }
  }
}
```

### Errores Globales

```javascript
{
  error: {
    message: "Uncaught Error",
    stack: "Error stack trace"
  },
  tags: {
    globalError: true,
    type: "javascript" | "unhandledPromiseRejection",
    filename: "app.js",
    lineno: 42,
    colno: 15
  },
  extra: {
    message: "Error message",
    source: "app.js",
    line: 42,
    column: 15
  }
}
```

## Mejores Prácticas

### ✅ Hacer

- Usar `ErrorBoundary` para envolver componentes críticos
- Registrar errores con contexto relevante
- Incluir información útil en `tags` y `extra`
- Configurar servicios de logging en producción
- Revisar logs regularmente

### ❌ Evitar

- No registrar información sensible (contraseñas, tokens, etc.)
- No registrar demasiada información (puede ser costoso)
- No ignorar errores silenciosamente
- No registrar errores esperados (ej: validación de formularios)

## Ejemplos

### ErrorBoundary con Contexto Adicional

```jsx
import ErrorBoundary from './components/ErrorBoundary';

function ProductPage() {
  return (
    <ErrorBoundary>
      <ProductDetails />
    </ErrorBoundary>
  );
}
```

### Manejo de Errores en Async Functions

```javascript
import { errorLoggingService } from '../services/errorLoggingService';

async function fetchProduct(id) {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    errorLoggingService.logError(error, null, {
      level: 'error',
      tags: {
        apiError: true,
        endpoint: `/products/${id}`,
        action: 'fetchProduct',
      },
      extra: {
        productId: id,
      },
    });
    throw error; // Re-lanzar para manejar en el componente
  }
}
```

### Manejo de Errores en Event Handlers

```javascript
import { errorLoggingService } from '../services/errorLoggingService';

function handleSubmit(event) {
  try {
    // Tu lógica
  } catch (error) {
    errorLoggingService.logError(error, null, {
      level: 'error',
      tags: {
        component: 'CheckoutForm',
        action: 'submit',
      },
      extra: {
        formData: sanitizedFormData, // No incluir datos sensibles
      },
    });
    
    // Mostrar mensaje al usuario
    setError('Ocurrió un error al procesar tu pedido');
  }
}
```

## Monitoreo en Producción

### Sentry Dashboard

1. Crear cuenta en [sentry.io](https://sentry.io)
2. Crear proyecto para React
3. Obtener DSN
4. Configurar `VITE_SENTRY_DSN` en `.env.production`
5. Instalar `@sentry/react` y descomentar código

### LogRocket Dashboard

1. Crear cuenta en [logrocket.com](https://logrocket.com)
2. Crear proyecto
3. Obtener App ID
4. Configurar `VITE_LOGROCKET_ID` en `.env.production`
5. Instalar `logrocket` y descomentar código

### API Personalizada

Crear endpoint en tu backend:

```javascript
// Ejemplo en Express
app.post('/api/errors', (req, res) => {
  const { error, errorInfo, context, tags, extra } = req.body;
  
  // Guardar en base de datos
  // Enviar notificaciones
  // etc.
  
  res.status(200).json({ success: true });
});
```

## Troubleshooting

### Errores no se registran

- Verificar que las variables de entorno estén configuradas
- Verificar que los servicios estén instalados (Sentry, LogRocket)
- Revisar la consola del navegador para errores de inicialización
- Verificar que el código esté descomentado en `errorLoggingService.js`

### Demasiados errores registrados

- Revisar filtros en el servicio de logging (Sentry, LogRocket)
- Ajustar `tracesSampleRate` en Sentry
- Implementar rate limiting en API personalizada

### Errores duplicados

- Verificar que no haya múltiples instancias del servicio
- Revisar configuración de deduplicación en Sentry/LogRocket

## Referencias

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [LogRocket Documentation](https://docs.logrocket.com/docs/react)
