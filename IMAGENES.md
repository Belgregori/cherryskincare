# 📸 Guía de Subida de Imágenes - Cherry Skincare

## ✅ Funcionalidad Implementada

Ahora puedes subir imágenes directamente a los productos. La aplicación soporta **dos formas** de agregar imágenes:

### Opción 1: URL Externa (Ya funcionaba)
Puedes seguir usando URLs de imágenes externas al crear/actualizar un producto:
```json
{
  "name": "Crema Hidratante",
  "imageUrl": "https://example.com/imagen.jpg",
  ...
}
```

### Opción 2: Subir Archivo Directamente (NUEVO) ⭐
Ahora puedes subir archivos de imagen directamente desde tu frontend o con herramientas como Postman.

---

## 🚀 Endpoints para Imágenes

### 1. Subir Imagen a un Producto Existente

**POST** `http://localhost:8080/api/products/{id}/image`

**Formato:** `multipart/form-data`

**Parámetros:**
- `file` (file): El archivo de imagen

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:8080/api/products/1/image \
  -F "file=@/ruta/a/tu/imagen.jpg"
```

**Ejemplo con PowerShell:**
```powershell
$uri = "http://localhost:8080/api/products/1/image"
$filePath = "C:\ruta\a\tu\imagen.jpg"
$form = @{
    file = Get-Item -Path $filePath
}
Invoke-RestMethod -Uri $uri -Method Post -Form $form
```

**Respuesta exitosa:**
```json
{
  "imageUrl": "/api/images/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

### 2. Subir Imagen Independiente (sin asociar a producto)

**POST** `http://localhost:8080/api/images/upload`

**Formato:** `multipart/form-data`

**Parámetros:**
- `file` (file): El archivo de imagen

**Respuesta:**
```json
{
  "imageUrl": "/api/images/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

### 3. Obtener/Ver Imagen

**GET** `http://localhost:8080/api/images/{filename}`

Ejemplo: `http://localhost:8080/api/images/550e8400-e29b-41d4-a716-446655440000.jpg`

Puedes usar esta URL directamente en tu frontend:
```html
<img src="http://localhost:8080/api/images/550e8400-e29b-41d4-a716-446655440000.jpg" />
```

---

## 📋 Características

✅ **Validación de tipo de archivo**: Solo acepta imágenes (image/*)  
✅ **Validación de tamaño**: Máximo 5MB por archivo  
✅ **Nombres únicos**: Se generan nombres únicos con UUID para evitar conflictos  
✅ **Reemplazo automático**: Si un producto ya tiene imagen, se reemplaza automáticamente  
✅ **Almacenamiento local**: Las imágenes se guardan en la carpeta `uploads/images/`  
✅ **URLs relativas**: Las URLs generadas son relativas y funcionan con el servidor

---

## 📁 Estructura de Archivos

Las imágenes se guardan en:
```
cherry-skincare/
└── uploads/
    └── images/
        ├── 550e8400-e29b-41d4-a716-446655440000.jpg
        ├── 6ba7b810-9dad-11d1-80b4-00c04fd430c8.png
        └── ...
```

**Nota:** Esta carpeta se crea automáticamente la primera vez que subes una imagen.

---

## 🧪 Flujo de Prueba Recomendado

1. **Crear un producto** (sin imagen o con URL externa):
   ```bash
   POST /api/products
   {
     "name": "Crema Hidratante",
     "price": 29.99,
     ...
   }
   ```

2. **Subir imagen al producto**:
   ```bash
   POST /api/products/1/image
   Form-data: file = [tu_imagen.jpg]
   ```

3. **Obtener el producto** y verificar que tiene la imagen:
   ```bash
   GET /api/products/1
   ```

4. **Ver la imagen en el navegador**:
   ```
   http://localhost:8080/api/images/550e8400-e29b-41d4-a716-446655440000.jpg
   ```

---

## ⚙️ Configuración

La configuración está en `application.properties`:

```properties
# Tamaño máximo de archivo: 5MB
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB

# Carpeta donde se guardan las imágenes
file.upload-dir=uploads/images
```

Puedes cambiar estos valores si necesitas:
- Archivos más grandes
- Otra ubicación para las imágenes

---

## 🔒 Seguridad

**Nota importante:** Actualmente los endpoints de imágenes son públicos. En producción, deberías:
- Proteger el endpoint de subida con autenticación
- Validar que solo usuarios autorizados puedan subir imágenes
- Considerar almacenamiento en cloud (AWS S3, Cloudinary, etc.) para producción

---

## 💡 Tips

1. **Formatos soportados**: JPG, PNG, GIF, WebP (cualquier formato de imagen)
2. **Nombres de archivo**: Se preserva la extensión original
3. **Múltiples imágenes**: Cada producto puede tener una imagen (si subes otra, reemplaza la anterior)
4. **URLs completas**: Las URLs retornadas son relativas, pero puedes construir URLs completas agregando el dominio

---

## 🐛 Solución de Problemas

**Error: "El archivo debe ser una imagen"**
- Asegúrate de que el archivo sea realmente una imagen
- Verifica el Content-Type del archivo

**Error: "La imagen no puede ser mayor a 5MB"**
- Reduce el tamaño de la imagen
- O aumenta el límite en `application.properties`

**Error 404 al ver la imagen**
- Verifica que el archivo se haya subido correctamente
- Revisa que la carpeta `uploads/images/` exista
- Verifica los permisos de escritura en la carpeta

