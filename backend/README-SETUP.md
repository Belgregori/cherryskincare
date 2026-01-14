# Configuración del Backend

## Variables de Entorno

Para configurar el backend correctamente, necesitas crear un archivo `.env` en la raíz del proyecto backend con las siguientes variables:

```bash
# Copia el archivo .env.example y renómbralo a .env
cp .env.example .env
```

Luego edita el archivo `.env` con tus valores reales.

### Variables Requeridas:

- `DB_PASSWORD`: Contraseña de tu base de datos MySQL
- `JWT_SECRET`: Clave secreta para firmar tokens JWT (mínimo 32 caracteres, recomendado 64+)

### Variables Opcionales:

- `DB_URL`: URL de conexión a la base de datos (por defecto: localhost:3306)
- `DB_USERNAME`: Usuario de la base de datos (por defecto: root)
- `SERVER_PORT`: Puerto del servidor (por defecto: 8080)
- `CORS_ORIGINS`: Orígenes permitidos para CORS (separados por coma)
- `SHOW_SQL`: Mostrar queries SQL en consola (true/false, por defecto: false)
- `UPLOAD_DIR`: Directorio para almacenar imágenes (por defecto: uploads/images)

## Ejecución

### Con variables de entorno en archivo .env:

Si usas un archivo `.env`, necesitaras una librería como `dotenv` o configurar las variables en tu IDE.

### Con variables de entorno del sistema:

```bash
export DB_PASSWORD=tu_password
export JWT_SECRET=tu_secret_key
mvn spring-boot:run
```

### En Windows (PowerShell):

```powershell
$env:DB_PASSWORD="tu_password"
$env:JWT_SECRET="tu_secret_key"
mvn spring-boot:run
```

## Importante

⚠️ **NUNCA** subas el archivo `.env` al repositorio. Está en `.gitignore` por seguridad.
