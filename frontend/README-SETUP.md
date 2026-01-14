# Configuración del Frontend

## Variables de Entorno

Para configurar el frontend, crea un archivo `.env` en la carpeta `frontend` con las siguientes variables:

```bash
# Copia el archivo .env.example y renómbralo a .env
cp .env.example .env
```

### Variables Disponibles:

- `VITE_API_URL`: URL base del API backend (por defecto: `http://localhost:8080/api`)
- `VITE_IMAGE_BASE_URL`: URL base para servir imágenes (por defecto: `http://localhost:8080`)

### Ejemplo de `.env`:

```env
VITE_API_URL=http://localhost:8080/api
VITE_IMAGE_BASE_URL=http://localhost:8080
```

## Importante

⚠️ **NUNCA** subas el archivo `.env` al repositorio. Está en `.gitignore` por seguridad.

Las variables de entorno en Vite deben comenzar con `VITE_` para ser accesibles en el código del frontend.
