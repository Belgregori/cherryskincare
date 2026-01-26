# Seguridad - Cherry Skincare

## Almacenamiento de Tokens JWT

### Estrategia Implementada

La aplicación utiliza **sessionStorage** por defecto para almacenar tokens JWT, lo cual es más seguro que localStorage porque:

- ✅ **Se borra automáticamente** al cerrar la pestaña/navegador
- ✅ **Reduce el riesgo de XSS** al limitar el tiempo de exposición
- ✅ **No persiste entre sesiones** del navegador

### Comparación de Opciones

| Método | Seguridad | Conveniencia | Implementado |
|--------|-----------|--------------|--------------|
| **sessionStorage** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Por defecto |
| **localStorage** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ Opcional (no recomendado) |
| **Cookies HttpOnly** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ Requiere backend |

### Implementación Actual

**Archivo**: `frontend/src/utils/secureStorage.js`

```javascript
// Tokens siempre en sessionStorage (más seguro)
secureSetItem('token', token, true);
secureSetItem('refreshToken', refreshToken, true);
```

**Características**:
- ✅ Tokens siempre en sessionStorage
- ✅ Sanitización automática de valores
- ✅ Prefijo de claves para evitar conflictos
- ✅ Manejo robusto de errores
- ✅ Limpieza automática en caso de cuota excedida

### Migración desde localStorage

La aplicación ha migrado de localStorage a sessionStorage para tokens:

**Antes**:
```javascript
localStorage.setItem('token', token);
```

**Ahora**:
```javascript
secureSetItem('token', token, true); // true = sessionStorage
```

**Beneficios**:
- ✅ Tokens se borran al cerrar pestaña (más seguro)
- ✅ Reduce superficie de ataque XSS
- ✅ Mantiene compatibilidad con código existente

## Prevención de XSS (Cross-Site Scripting)

### Sanitización de Entradas

**Archivo**: `frontend/src/utils/sanitize.js`

Todas las entradas del usuario se sanitizan antes de:
- Enviarse al servidor
- Guardarse en almacenamiento
- Mostrarse en la UI

#### Funciones de Sanitización

1. **`sanitizeString(input)`**: Escapa caracteres HTML peligrosos
   ```javascript
   sanitizeString('<script>alert("XSS")</script>');
   // Resultado: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
   ```

2. **`sanitizeEmail(email)`**: Valida y sanitiza emails
   ```javascript
   sanitizeEmail('user@example.com'); // ✅ Válido
   sanitizeEmail('<script>'); // ❌ null
   ```

3. **`sanitizePassword(password)`**: Valida contraseñas
   ```javascript
   sanitizePassword('mypassword123'); // ✅ Válido
   sanitizePassword('short'); // ❌ null (mínimo 8 caracteres)
   ```

4. **`sanitizeHTML(html)`**: Escapa HTML para prevenir XSS
   ```javascript
   sanitizeHTML('<img src=x onerror=alert(1)>');
   // Resultado: '&lt;img src=x onerror=alert(1)&gt;'
   ```

5. **`sanitizeObject(obj)`**: Sanitiza objetos recursivamente
   ```javascript
   sanitizeObject({ name: '<script>', email: 'user@example.com' });
   // Resultado: { name: '&lt;script&gt;', email: 'user@example.com' }
   ```

### Uso en Formularios

Todos los formularios sanitizan entradas antes de enviar:

**Login**:
```javascript
const sanitizedEmail = sanitizeEmail(email);
const sanitizedPassword = sanitizePassword(password);
```

**Registro**:
```javascript
const sanitizedData = {
  email: sanitizeEmail(userData.email),
  name: userData.name.trim(),
  // ...
};
```

### Protección en la UI

React automáticamente escapa valores en JSX:
```jsx
<div>{userInput}</div> {/* Seguro - React escapa automáticamente */}
```

**⚠️ Peligroso** (NO usar):
```jsx
<div dangerouslySetInnerHTML={{ __html: userInput }} /> {/* ❌ NUNCA hacer esto con datos del usuario */}
```

## Protección CSRF (Cross-Site Request Forgery)

### Estado Actual

La aplicación **NO implementa protección CSRF** porque:
- Usa tokens JWT en sessionStorage (no cookies)
- Los tokens no se envían automáticamente como cookies
- Requiere JavaScript explícito para acceder a tokens

### Si se Migra a Cookies HttpOnly

Si en el futuro se decide usar cookies HttpOnly para tokens:

1. **Implementar CSRF Tokens**:
   - Generar token CSRF en el servidor
   - Incluir en cada request
   - Validar en el backend

2. **SameSite Cookie Attribute**:
   ```javascript
   // Backend debe configurar:
   Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
   ```

3. **Double Submit Cookie Pattern**:
   - Cookie con token CSRF
   - Header con mismo token
   - Validar que coincidan

## Headers de Seguridad

### Recomendaciones para el Backend

El backend debe incluir estos headers de seguridad:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Validación de Entradas

### Frontend

- ✅ Sanitización de todas las entradas
- ✅ Validación de formato (email, contraseña)
- ✅ Validación de longitud mínima
- ✅ Escape de caracteres peligrosos

### Backend (Recomendado)

El backend DEBE validar y sanitizar todas las entradas:
- ✅ Validación de esquemas (DTOs)
- ✅ Sanitización de strings
- ✅ Validación de tipos
- ✅ Validación de rangos

## Mejores Prácticas Implementadas

1. ✅ **Tokens en sessionStorage** (más seguro que localStorage)
2. ✅ **Sanitización de todas las entradas**
3. ✅ **Escape automático en React**
4. ✅ **Validación de formato** (email, contraseña)
5. ✅ **Manejo seguro de errores** (no exponer información sensible)
6. ✅ **Prefijos en claves de almacenamiento** (evita conflictos)

## Próximas Mejoras Recomendadas

### Corto Plazo

1. **Content Security Policy (CSP)**:
   - Configurar CSP headers en el backend
   - Restringir fuentes de scripts y estilos

2. **Rate Limiting**:
   - Implementar límites de intentos de login
   - Prevenir ataques de fuerza bruta

3. **Validación de Contraseñas**:
   - Requerir complejidad mínima
   - Verificar contra listas de contraseñas comunes

### Mediano Plazo

1. **Cookies HttpOnly** (si se requiere persistencia):
   - Migrar tokens a cookies HttpOnly
   - Implementar protección CSRF
   - Configurar SameSite attribute

2. **Autenticación de Dos Factores (2FA)**:
   - Agregar 2FA para usuarios admin
   - Usar TOTP o SMS

3. **Auditoría de Seguridad**:
   - Logs de intentos de acceso
   - Alertas de actividad sospechosa

### Largo Plazo

1. **Penetration Testing**:
   - Auditorías de seguridad regulares
   - Pruebas de vulnerabilidades

2. **Bug Bounty Program**:
   - Programa de recompensas por bugs
   - Incentivar reportes responsables

## Conclusión

La aplicación implementa **buenas prácticas de seguridad**:

- ✅ Tokens en sessionStorage (más seguro)
- ✅ Sanitización completa de entradas
- ✅ Validación de formatos
- ✅ Escape automático en React

**Recomendación**: Mantener sessionStorage para tokens. Solo considerar cookies HttpOnly si se requiere persistencia entre sesiones, y en ese caso implementar protección CSRF.
