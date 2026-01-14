# Configuración de Variables de Entorno - Backend

## ⚠️ IMPORTANTE: Configuración Requerida

Para que el backend funcione correctamente, necesitas configurar las variables de entorno.

## Opción 1: Variables de Entorno del Sistema (Recomendado)

### Windows (PowerShell):
```powershell
$env:DB_PASSWORD="tu_password_aqui"
$env:JWT_SECRET="tu_secret_key_super_segura_minimo_32_caracteres"
mvn spring-boot:run
```

### Windows (CMD):
```cmd
set DB_PASSWORD=tu_password_aqui
set JWT_SECRET=tu_secret_key_super_segura_minimo_32_caracteres
mvn spring-boot:run
```

### Linux/Mac:
```bash
export DB_PASSWORD="tu_password_aqui"
export JWT_SECRET="tu_secret_key_super_segura_minimo_32_caracteres"
mvn spring-boot:run
```

## Opción 2: Archivo .env (Requiere librería adicional)

Si prefieres usar un archivo `.env`, necesitarás agregar la dependencia `spring-dotenv` o usar una librería como `dotenv-java`.

## Variables Requeridas:

- **DB_PASSWORD**: Contraseña de tu base de datos MySQL (OBLIGATORIO)
- **JWT_SECRET**: Clave secreta para firmar tokens JWT, mínimo 32 caracteres (OBLIGATORIO)

## Variables Opcionales:

- `DB_URL`: URL de conexión (por defecto: `jdbc:mysql://localhost:3306/cherry_skincare...`)
- `DB_USERNAME`: Usuario de BD (por defecto: `root`)
- `SERVER_PORT`: Puerto del servidor (por defecto: `8080`)
- `CORS_ORIGINS`: Orígenes permitidos para CORS (por defecto: `http://localhost:5173,http://localhost:3000`)
- `SHOW_SQL`: Mostrar queries SQL (por defecto: `false`)
- `UPLOAD_DIR`: Directorio para imágenes (por defecto: `uploads/images`)

## Generar JWT_SECRET Seguro

Puedes generar un JWT_SECRET seguro usando:

### PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### Linux/Mac:
```bash
openssl rand -base64 64
```

## ⚠️ SEGURIDAD

- **NUNCA** subas el archivo `.env` o credenciales al repositorio
- Usa diferentes valores para desarrollo y producción
- El JWT_SECRET debe ser único y secreto
