# Seguridad de Almacenamiento de Archivos

Este documento describe las medidas de seguridad implementadas para el almacenamiento de archivos y cómo configurar opciones avanzadas.

## Medidas de Seguridad Implementadas

### 1. Ubicación de Almacenamiento

- **Almacenamiento Local**: Los archivos se guardan en `uploads/images` (fuera del directorio público)
- **Rutas No Predecibles**: Se usan UUIDs para los nombres de archivo (32 caracteres hexadecimales)
- **Acceso Controlado**: Las imágenes se sirven mediante un controlador REST con validaciones de seguridad
- **Path Traversal Protection**: Validación estricta para prevenir acceso a directorios no autorizados

### 2. Validaciones de Seguridad

- ✅ Validación de tipo MIME
- ✅ Verificación de firma mágica (magic number)
- ✅ Validación de extensión de archivo
- ✅ Límite de tamaño (2MB)
- ✅ Sanitización de nombres de archivo
- ✅ Validación de path traversal en múltiples capas

### 3. Endpoint GET de Imágenes

El endpoint `GET /api/images/{filename}` incluye:
- Validación de formato de filename (UUID + extensión)
- Headers de seguridad (`X-Content-Type-Options: nosniff`)
- Sanitización de nombres en headers HTTP
- Logging de intentos de acceso con formato inválido

## Almacenamiento Externo (S3)

### ¿Por qué usar S3 en producción?

1. **Escalabilidad**: No consume espacio del servidor de aplicación
2. **Disponibilidad**: CDN integrado (CloudFront) y redundancia
3. **Seguridad**: Separación de responsabilidades, escaneo integrado
4. **Mantenimiento**: Backups automáticos y versionado

### Implementación de S3

#### Paso 1: Agregar Dependencia

En `pom.xml`:

```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.0</version>
</dependency>
```

#### Paso 2: Crear Implementación S3

Crear `S3FileStorageService.java` que implemente `FileStorageServiceInterface`:

```java
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "s3")
public class S3FileStorageService implements FileStorageServiceInterface {
    
    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    @Value("${aws.s3.region}")
    private String region;
    
    private final S3Client s3Client;
    
    // Implementar storeFile(), deleteFile(), fileExists()
}
```

#### Paso 3: Configuración

En `application-prod.properties`:

```properties
storage.type=s3
aws.s3.bucket-name=${AWS_S3_BUCKET_NAME}
aws.s3.region=${AWS_S3_REGION:us-east-1}
```

Variables de entorno:
```bash
export AWS_ACCESS_KEY_ID=tu-access-key
export AWS_SECRET_ACCESS_KEY=tu-secret-key
export AWS_S3_BUCKET_NAME=cherry-skincare-uploads
export AWS_S3_REGION=us-east-1
```

#### Paso 4: Configurar IAM

Crear un usuario IAM con permisos mínimos:
- `s3:PutObject` (subir archivos)
- `s3:GetObject` (leer archivos)
- `s3:DeleteObject` (eliminar archivos)
- `s3:ListBucket` (opcional, para verificación)

## Escaneo Antivirus

### Estado Actual

Por defecto, el escaneo antivirus está **deshabilitado** (modo desarrollo).

### Opciones de Implementación

#### Opción 1: ClamAV (Open Source)

**Ventajas**: Gratuito, open source, ampliamente usado
**Desventajas**: Requiere servidor ClamAV corriendo

**Implementación**:

1. Instalar ClamAV en el servidor
2. Agregar dependencia:
```xml
<dependency>
    <groupId>com.github.clamav</groupId>
    <artifactId>clamav-client</artifactId>
    <version>1.0.0</version>
</dependency>
```

3. Crear `ClamAVVirusScanService.java`:
```java
@Service
@ConditionalOnProperty(name = "virus.scan.enabled", havingValue = "true")
public class ClamAVVirusScanService implements VirusScanService {
    // Implementar scanFile()
}
```

#### Opción 2: VirusTotal API

**Ventajas**: Servicio en la nube, no requiere infraestructura propia
**Desventajas**: Límites de uso gratuito, requiere API key

**Implementación**:

1. Obtener API key de VirusTotal
2. Agregar dependencia HTTP client
3. Crear `VirusTotalScanService.java`

#### Opción 3: AWS Macie / GuardDuty

**Ventajas**: Integración nativa si se usa S3
**Desventajas**: Solo funciona con S3, puede tener costos adicionales

#### Opción 4: Content Disarm & Reconstruction (CDR)

**Ventajas**: Más seguro, reconstruye archivos eliminando contenido peligroso
**Desventajas**: Puede alterar archivos legítimos, requiere servicio externo

Servicios: OPSWAT, Votiro, etc.

### Habilitar Escaneo

En `application-prod.properties`:

```properties
virus.scan.enabled=true
virus.scan.reject-on-error=true
```

## Recomendaciones para Producción

1. ✅ **Usar S3** para almacenamiento externo
2. ✅ **Habilitar escaneo antivirus** (ClamAV o VirusTotal)
3. ✅ **Configurar CDN** (CloudFront) para mejor rendimiento
4. ✅ **Implementar rate limiting** en el endpoint de upload
5. ✅ **Monitorear logs** de intentos de acceso sospechosos
6. ✅ **Backups automáticos** de archivos importantes
7. ✅ **Política de retención** de archivos antiguos

## Configuración de Seguridad Adicional

### Rate Limiting

Agregar rate limiting al endpoint de upload para prevenir abuso:

```java
@RateLimiter(name = "fileUpload")
@PostMapping("/upload")
public ResponseEntity<?> uploadImage(...) {
    // ...
}
```

### Monitoreo

Configurar alertas para:
- Intentos de subida de archivos grandes
- Intentos de path traversal
- Archivos rechazados por escaneo antivirus
- Errores en el servicio de almacenamiento

## Referencias

- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [AWS S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [ClamAV Documentation](https://www.clamav.net/documents)
