# Configuración de Perfiles Spring Boot

Este proyecto utiliza perfiles de Spring Boot para separar configuraciones según el entorno (desarrollo, pruebas, producción).

## Perfiles Disponibles

### 1. **dev** (Desarrollo)
- Archivo: `application-dev.properties`
- Uso: Desarrollo local
- Características:
  - Logging más verboso (DEBUG)
  - SQL visible en consola
  - Swagger habilitado
  - Creación automática de admin permitida
  - CORS más permisivo

### 2. **test** (Pruebas)
- Archivo: `application-test.properties` (en `src/test/resources`)
- Uso: Tests automatizados
- Características:
  - Base de datos H2 en memoria
  - Logging mínimo
  - Configuración optimizada para tests

### 3. **prod** (Producción)
- Archivo: `application-prod.properties`
- Uso: Entorno de producción
- Características:
  - Logging a archivo
  - Swagger deshabilitado
  - Configuración de seguridad estricta
  - Pool de conexiones optimizado
  - Solo variables de entorno (sin valores por defecto)

## Cómo Activar un Perfil

### Opción 1: Variable de Entorno (Recomendado)
```bash
# Linux/Mac
export SPRING_PROFILES_ACTIVE=dev
mvn spring-boot:run

# Windows PowerShell
$env:SPRING_PROFILES_ACTIVE="dev"
mvn spring-boot:run

# Windows CMD
set SPRING_PROFILES_ACTIVE=dev
mvn spring-boot:run
```

### Opción 2: En application.properties
```properties
spring.profiles.active=dev
```

### Opción 3: Al ejecutar la aplicación
```bash
mvn spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
```

### Opción 4: En IDE (IntelliJ/Eclipse)
- Configuración de Run/Debug
- VM options: `-Dspring.profiles.active=dev`

## Configuración de Archivos

### Desarrollo
1. Copia el archivo de ejemplo:
   ```bash
   cp src/main/resources/application-dev.properties.example src/main/resources/application-dev.properties
   ```
2. Edita `application-dev.properties` con tus valores locales
3. O configura variables de entorno

### Producción
1. **NUNCA** copies `application-prod.properties` al repositorio con valores reales
2. Usa SOLO variables de entorno para valores sensibles
3. El archivo `application-prod.properties` debe contener solo referencias a variables de entorno

## Variables de Entorno Requeridas por Perfil

### Desarrollo (dev)
- `DB_PASSWORD` (opcional, tiene valor por defecto)
- `JWT_SECRET` (opcional, tiene valor por defecto)
- `ADMIN_EMAIL` (opcional)
- `ADMIN_PASSWORD` (opcional)

### Producción (prod)
- `DB_URL` (requerido)
- `DB_USERNAME` (requerido)
- `DB_PASSWORD` (requerido)
- `JWT_SECRET` (requerido)
- `ADMIN_EMAIL` (requerido)
- `ADMIN_PASSWORD` (requerido)
- `CORS_ORIGINS` (requerido)
- `APP_BASE_URL` (requerido)
- `MAIL_HOST` (requerido si se usa email)
- `MAIL_USERNAME` (requerido si se usa email)
- `MAIL_PASSWORD` (requerido si se usa email)

## Verificar Perfil Activo

Puedes verificar qué perfil está activo consultando:
- Logs de inicio de la aplicación
- Endpoint de Actuator: `GET /actuator/info` (muestra el perfil activo)

## Notas Importantes

⚠️ **Seguridad:**
- Los archivos `application-*.properties` con valores reales NO deben estar en el repositorio
- Usa `.gitignore` para excluir archivos con valores sensibles
- En producción, usa siempre variables de entorno

⚠️ **Valores por Defecto:**
- `application.properties` contiene valores por defecto para desarrollo
- Los perfiles específicos sobrescriben estos valores
- En producción, NO uses valores por defecto
