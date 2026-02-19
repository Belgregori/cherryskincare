package com.cherryskincare.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de almacenamiento de archivos en sistema de archivos local.
 * 
 * UBICACIÓN DE ALMACENAMIENTO:
 * - Los archivos se almacenan en: uploads/images (configurable)
 * - Fuera del directorio público de la aplicación
 * - Acceso controlado mediante controlador REST
 * 
 * SEGURIDAD:
 * - Rutas no predecibles (UUIDs)
 * - Validación de path traversal
 * - Validación de tipos MIME y firmas mágicas
 * - Escaneo antivirus (si está habilitado)
 * 
 * ALMACENAMIENTO EXTERNO (S3):
 * Para producción, se recomienda usar almacenamiento externo (AWS S3, Azure Blob, etc.):
 * 
 * 1. Crear implementación de FileStorageServiceInterface para S3:
 *    - Usar AWS SDK: software.amazon.awssdk:s3
 *    - Configurar credenciales mediante variables de entorno
 *    - Implementar storeFile(), deleteFile(), fileExists()
 * 
 * 2. Configuración en application-prod.properties:
 *    storage.type=s3
 *    aws.s3.bucket-name=cherry-skincare-uploads
 *    aws.s3.region=us-east-1
 * 
 * 3. Ventajas de S3:
 *    - Escalabilidad ilimitada
 *    - CDN integrado (CloudFront)
 *    - Backups automáticos
 *    - Escaneo antivirus (Macie/GuardDuty)
 *    - No consume recursos del servidor de aplicación
 * 
 * @author Cherry Skincare Team
 */
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class FileStorageService implements FileStorageServiceInterface {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    // Tipos MIME permitidos
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    // Extensiones permitidas
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".gif", ".webp"
    );

    // Tamaño máximo: 2MB (para prevenir Denial-of-Service)
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024;
    
    // Tamaño mínimo: 1KB
    private static final long MIN_FILE_SIZE = 1024;

    @Value("${file.upload-dir:uploads/images}")
    private String uploadDir;
    
    @Autowired(required = false)
    private VirusScanService virusScanService;

    public String storeFile(MultipartFile file) throws IOException {
        // Validar que el archivo no esté vacío
        if (file == null || file.isEmpty()) {
            logger.warn("Intento de subir archivo vacío");
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }

        // Validar tamaño mínimo
        if (file.getSize() < MIN_FILE_SIZE) {
            logger.warn("Intento de subir archivo muy pequeño: {} bytes", file.getSize());
            throw new IllegalArgumentException("La imagen debe tener al menos 1KB");
        }

        // Validar tamaño máximo
        if (file.getSize() > MAX_FILE_SIZE) {
            logger.warn("Intento de subir archivo muy grande: {} bytes", file.getSize());
            throw new IllegalArgumentException("La imagen no puede ser mayor a 2MB");
        }

        // Validar tipo MIME
        String contentType = file.getContentType();
        if (contentType == null) {
            logger.warn("Intento de subir archivo sin tipo MIME");
            throw new IllegalArgumentException("No se pudo determinar el tipo de archivo");
        }

        // Normalizar tipo MIME (algunos navegadores envían "image/jpg" en lugar de "image/jpeg")
        contentType = contentType.toLowerCase();
        if (contentType.equals("image/jpg")) {
            contentType = "image/jpeg";
        }

        if (!ALLOWED_MIME_TYPES.contains(contentType)) {
            logger.warn("Intento de subir archivo con tipo MIME no permitido: {}", contentType);
            throw new IllegalArgumentException("Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG, GIF o WEBP");
        }

        // Validar y sanitizar nombre del archivo
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            logger.warn("Intento de subir archivo sin nombre");
            throw new IllegalArgumentException("El archivo debe tener un nombre válido");
        }

        // Sanitizar nombre del archivo: eliminar caracteres peligrosos y directorios anidados
        originalFilename = sanitizeFilename(originalFilename);
        
        // Validar que no contenga rutas relativas o absolutas (path traversal)
        if (originalFilename.contains("..") || originalFilename.contains("/") || 
            originalFilename.contains("\\") || originalFilename.contains(":") ||
            originalFilename.startsWith(".")) {
            logger.warn("Intento de subir archivo con nombre peligroso: {}", file.getOriginalFilename());
            throw new IllegalArgumentException("El nombre del archivo contiene caracteres no permitidos");
        }

        // Extraer extensión de forma segura
        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf(".");
        if (lastDotIndex > 0 && lastDotIndex < originalFilename.length() - 1) {
            extension = originalFilename.substring(lastDotIndex).toLowerCase();
        }

        if (extension.isEmpty() || !ALLOWED_EXTENSIONS.contains(extension)) {
            logger.warn("Intento de subir archivo con extensión no permitida: {}", extension);
            throw new IllegalArgumentException("Extensión de archivo no permitida. Solo se permiten: .jpg, .jpeg, .png, .gif, .webp");
        }

        // Validar que la extensión coincida con el tipo MIME
        if (!isExtensionMatchingMimeType(extension, contentType)) {
            logger.warn("Extensión {} no coincide con tipo MIME {}", extension, contentType);
            throw new IllegalArgumentException("La extensión del archivo no coincide con su tipo MIME");
        }

        // Validar firma mágica del archivo (verificación de seguridad crítica)
        String detectedMimeType = detectMimeTypeByMagicNumber(file);
        if (detectedMimeType == null) {
            logger.warn("No se pudo detectar el tipo de archivo mediante firma mágica");
            throw new IllegalArgumentException("No se pudo verificar el tipo real del archivo. El archivo puede estar corrupto o no ser una imagen válida");
        }

        // Verificar que el tipo detectado por la firma mágica coincida con el Content-Type declarado
        if (!detectedMimeType.equals(contentType)) {
            logger.warn("Firma mágica detectada: {} no coincide con Content-Type declarado: {}", detectedMimeType, contentType);
            throw new IllegalArgumentException("El tipo real del archivo no coincide con el tipo declarado. Posible intento de falsificación");
        }

        // Escanear archivo en busca de virus (si el servicio está habilitado)
        if (virusScanService != null) {
            try {
                VirusScanService.ScanResult scanResult = virusScanService.scanFile(file);
                if (!scanResult.isClean()) {
                    logger.error("Archivo rechazado por escaneo antivirus: {} - {}", 
                                file.getOriginalFilename(), scanResult.getMessage());
                    throw new IllegalArgumentException("El archivo fue rechazado por el escaneo de seguridad: " + scanResult.getMessage());
                }
                logger.debug("Archivo escaneado exitosamente: {} - Motor: {}", 
                            file.getOriginalFilename(), scanResult.getScanEngine());
            } catch (VirusScanService.VirusDetectedException e) {
                logger.error("Virus detectado en archivo: {} - {}", 
                            file.getOriginalFilename(), e.getMessage());
                throw new IllegalArgumentException("El archivo contiene malware y fue rechazado: " + e.getMessage());
            } catch (Exception e) {
                // Si el servicio de escaneo falla, decidir si rechazar o permitir
                // En producción, es mejor rechazar por seguridad
                logger.error("Error al escanear archivo: {}", e.getMessage());
                boolean rejectOnScanError = Boolean.parseBoolean(
                    System.getProperty("virus.scan.reject-on-error", "true"));
                if (rejectOnScanError) {
                    throw new IOException("Error al verificar la seguridad del archivo. Intente nuevamente.");
                }
            }
        }

        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único y seguro para el archivo
        // UUID sin guiones tiene 32 caracteres hexadecimales, más extensión (máx 5 chars) = 37 chars total
        // Limitamos a 50 caracteres totales para seguridad
        String uuid = UUID.randomUUID().toString().replace("-", ""); // Remover guiones para nombre más corto (32 chars)
        String filename = uuid + extension;
        
        // Validar longitud máxima del nombre (50 caracteres totales incluyendo extensión)
        final int MAX_FILENAME_LENGTH = 50;
        if (filename.length() > MAX_FILENAME_LENGTH) {
            // Truncar UUID si es necesario (aunque normalmente no debería ser necesario)
            int maxUuidLength = MAX_FILENAME_LENGTH - extension.length();
            filename = uuid.substring(0, Math.min(uuid.length(), maxUuidLength)) + extension;
        }
        
        // Validación final: asegurar que el nombre solo contiene caracteres alfanuméricos y la extensión
        // UUID hexadecimal: 32 caracteres [0-9a-f], extensión: .jpg, .jpeg, .png, .gif, .webp
        if (!filename.matches("^[a-fA-F0-9]{1,45}\\.[a-z]{3,4}$")) {
            logger.error("Error generando nombre de archivo seguro: {}", filename);
            throw new IOException("Error al generar nombre de archivo seguro");
        }

        // Guardar archivo
        Path filePath = uploadPath.resolve(filename);
        
        // Validación adicional: asegurar que el path resuelto no escape del directorio de uploads
        Path normalizedPath = filePath.normalize();
        if (!normalizedPath.startsWith(uploadPath.normalize())) {
            logger.warn("Intento de path traversal detectado: {}", filename);
            throw new IllegalArgumentException("Ruta de archivo inválida");
        }
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retornar la URL relativa
        return "/api/images/" + filename;
    }

    /**
     * Almacena un archivo de categoría en la carpeta específica uploads/categories/
     * 
     * @param file El archivo a almacenar
     * @return La URL relativa para acceder al archivo (/api/images/categories/{filename})
     * @throws IOException Si hay un error al almacenar el archivo
     */
    public String storeCategoryFile(MultipartFile file) throws IOException {
        // Validar que el archivo no esté vacío
        if (file == null || file.isEmpty()) {
            logger.warn("Intento de subir archivo vacío");
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }

        // Validar tamaño mínimo
        if (file.getSize() < MIN_FILE_SIZE) {
            logger.warn("Intento de subir archivo muy pequeño: {} bytes", file.getSize());
            throw new IllegalArgumentException("La imagen debe tener al menos 1KB");
        }

        // Validar tamaño máximo
        if (file.getSize() > MAX_FILE_SIZE) {
            logger.warn("Intento de subir archivo muy grande: {} bytes", file.getSize());
            throw new IllegalArgumentException("La imagen no puede ser mayor a 2MB");
        }

        // Validar tipo MIME
        String contentType = file.getContentType();
        if (contentType == null) {
            logger.warn("Intento de subir archivo sin tipo MIME");
            throw new IllegalArgumentException("No se pudo determinar el tipo de archivo");
        }

        // Normalizar tipo MIME
        contentType = contentType.toLowerCase();
        if (contentType.equals("image/jpg")) {
            contentType = "image/jpeg";
        }

        if (!ALLOWED_MIME_TYPES.contains(contentType)) {
            logger.warn("Intento de subir archivo con tipo MIME no permitido: {}", contentType);
            throw new IllegalArgumentException("Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG, GIF o WEBP");
        }

        // Validar y sanitizar nombre del archivo
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            logger.warn("Intento de subir archivo sin nombre");
            throw new IllegalArgumentException("El archivo debe tener un nombre válido");
        }

        // Sanitizar nombre del archivo
        originalFilename = sanitizeFilename(originalFilename);
        
        // Validar que no contenga rutas relativas o absolutas (path traversal)
        if (originalFilename.contains("..") || originalFilename.contains("/") || 
            originalFilename.contains("\\") || originalFilename.contains(":") ||
            originalFilename.startsWith(".")) {
            logger.warn("Intento de subir archivo con nombre peligroso: {}", file.getOriginalFilename());
            throw new IllegalArgumentException("El nombre del archivo contiene caracteres no permitidos");
        }

        // Extraer extensión de forma segura
        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf(".");
        if (lastDotIndex > 0 && lastDotIndex < originalFilename.length() - 1) {
            extension = originalFilename.substring(lastDotIndex).toLowerCase();
        }

        if (extension.isEmpty() || !ALLOWED_EXTENSIONS.contains(extension)) {
            logger.warn("Intento de subir archivo con extensión no permitida: {}", extension);
            throw new IllegalArgumentException("Extensión de archivo no permitida. Solo se permiten: .jpg, .jpeg, .png, .gif, .webp");
        }

        // Validar que la extensión coincida con el tipo MIME
        if (!isExtensionMatchingMimeType(extension, contentType)) {
            logger.warn("Extensión {} no coincide con tipo MIME {}", extension, contentType);
            throw new IllegalArgumentException("La extensión del archivo no coincide con su tipo MIME");
        }

        // Validar firma mágica del archivo
        String detectedMimeType = detectMimeTypeByMagicNumber(file);
        if (detectedMimeType == null) {
            logger.warn("No se pudo detectar el tipo de archivo mediante firma mágica");
            throw new IllegalArgumentException("No se pudo verificar el tipo real del archivo. El archivo puede estar corrupto o no ser una imagen válida");
        }

        // Verificar que el tipo detectado por la firma mágica coincida con el Content-Type declarado
        if (!detectedMimeType.equals(contentType)) {
            logger.warn("Firma mágica detectada: {} no coincide con Content-Type declarado: {}", detectedMimeType, contentType);
            throw new IllegalArgumentException("El tipo real del archivo no coincide con el tipo declarado. Posible intento de falsificación");
        }

        // Escanear archivo en busca de virus (si el servicio está habilitado)
        if (virusScanService != null) {
            try {
                VirusScanService.ScanResult scanResult = virusScanService.scanFile(file);
                if (!scanResult.isClean()) {
                    logger.error("Archivo rechazado por escaneo antivirus: {} - {}", 
                                file.getOriginalFilename(), scanResult.getMessage());
                    throw new IllegalArgumentException("El archivo fue rechazado por el escaneo de seguridad: " + scanResult.getMessage());
                }
                logger.debug("Archivo escaneado exitosamente: {} - Motor: {}", 
                            file.getOriginalFilename(), scanResult.getScanEngine());
            } catch (VirusScanService.VirusDetectedException e) {
                logger.error("Virus detectado en archivo: {} - {}", 
                            file.getOriginalFilename(), e.getMessage());
                throw new IllegalArgumentException("El archivo contiene malware y fue rechazado: " + e.getMessage());
            } catch (Exception e) {
                logger.error("Error al escanear archivo: {}", e.getMessage());
                boolean rejectOnScanError = Boolean.parseBoolean(
                    System.getProperty("virus.scan.reject-on-error", "true"));
                if (rejectOnScanError) {
                    throw new IOException("Error al verificar la seguridad del archivo. Intente nuevamente.");
                }
            }
        }

        // Crear directorio específico para categorías si no existe
        // uploadDir es "uploads/images", entonces categoriesDir será "uploads/categories"
        Path uploadPath = Paths.get(uploadDir);
        Path categoriesDir = uploadPath.getParent() != null 
            ? uploadPath.getParent().resolve("categories")
            : Paths.get("uploads/categories");
        
        if (!Files.exists(categoriesDir)) {
            Files.createDirectories(categoriesDir);
        }

        // Generar nombre único y seguro para el archivo
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String filename = uuid + extension;
        
        // Validar longitud máxima del nombre
        final int MAX_FILENAME_LENGTH = 50;
        if (filename.length() > MAX_FILENAME_LENGTH) {
            int maxUuidLength = MAX_FILENAME_LENGTH - extension.length();
            filename = uuid.substring(0, Math.min(uuid.length(), maxUuidLength)) + extension;
        }
        
        // Validación final
        if (!filename.matches("^[a-fA-F0-9]{1,45}\\.[a-z]{3,4}$")) {
            logger.error("Error generando nombre de archivo seguro: {}", filename);
            throw new IOException("Error al generar nombre de archivo seguro");
        }

        // Guardar archivo en la carpeta de categorías
        Path filePath = categoriesDir.resolve(filename);
        
        // Validación adicional: asegurar que el path resuelto no escape del directorio
        Path normalizedPath = filePath.normalize();
        if (!normalizedPath.startsWith(categoriesDir.normalize())) {
            logger.warn("Intento de path traversal detectado: {}", filename);
            throw new IllegalArgumentException("Ruta de archivo inválida");
        }
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retornar la URL relativa con prefijo categories
        return "/api/images/categories/" + filename;
    }

    public void deleteFile(String imageUrl) throws IOException {
        if (imageUrl != null && imageUrl.startsWith("/api/images/")) {
            String pathPart = imageUrl.substring("/api/images/".length());
            
            // Manejar imágenes de categorías (formato: categories/{filename})
            if (pathPart.startsWith("categories/")) {
                String filename = pathPart.substring("categories/".length());
                Path uploadPath = Paths.get(uploadDir);
                Path categoriesDir = uploadPath.getParent() != null 
                    ? uploadPath.getParent().resolve("categories")
                    : Paths.get("uploads/categories");
                Path filePath = categoriesDir.resolve(filename);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }
            } else {
                // Imágenes normales (productos)
                String filename = pathPart;
                Path filePath = Paths.get(uploadDir).resolve(filename);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }
            }
        }
    }

    public Path loadFile(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("Nombre de archivo inválido");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path filePath = uploadPath.resolve(filename).normalize();
        if (!filePath.startsWith(uploadPath)) {
            throw new IllegalArgumentException("Ruta de archivo inválida");
        }

        return filePath;
    }

    /**
     * Carga un archivo de categoría desde la carpeta uploads/categories/
     * 
     * @param filename Nombre del archivo
     * @return Path al archivo
     * @throws IllegalArgumentException Si el nombre de archivo es inválido
     */
    public Path loadCategoryFile(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("Nombre de archivo inválido");
        }

        // Obtener el directorio de categorías (misma lógica que en storeCategoryFile)
        Path uploadPath = Paths.get(uploadDir);
        Path categoriesDir = uploadPath.getParent() != null 
            ? uploadPath.getParent().resolve("categories")
            : Paths.get("uploads/categories");
        
        Path categoriesPath = categoriesDir.toAbsolutePath().normalize();
        Path filePath = categoriesPath.resolve(filename).normalize();
        if (!filePath.startsWith(categoriesPath)) {
            throw new IllegalArgumentException("Ruta de archivo inválida");
        }

        return filePath;
    }
    
    @Override
    public boolean fileExists(String imageUrl) {
        if (imageUrl != null && imageUrl.startsWith("/api/images/")) {
            String filename = imageUrl.substring("/api/images/".length());
            try {
                Path filePath = loadFile(filename);
                return Files.exists(filePath) && Files.isRegularFile(filePath);
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }

    /**
     * Valida que la extensión del archivo coincida con el tipo MIME
     */
    private boolean isExtensionMatchingMimeType(String extension, String mimeType) {
        switch (extension.toLowerCase()) {
            case ".jpg":
            case ".jpeg":
                return mimeType.equals("image/jpeg");
            case ".png":
                return mimeType.equals("image/png");
            case ".gif":
                return mimeType.equals("image/gif");
            case ".webp":
                return mimeType.equals("image/webp");
            default:
                return false;
        }
    }

    /**
     * Detecta el tipo MIME real del archivo mediante su firma mágica (magic number).
     * Esta es una validación de seguridad crítica que no puede ser falsificada por el cliente.
     * 
     * @param file El archivo a verificar
     * @return El tipo MIME detectado o null si no se puede determinar
     * @throws IOException Si hay un error al leer el archivo
     */
    private String detectMimeTypeByMagicNumber(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            // Leer los primeros bytes del archivo (suficiente para detectar la firma mágica)
            byte[] header = new byte[12];
            int bytesRead = inputStream.read(header);
            
            if (bytesRead < 2) {
                logger.warn("Archivo demasiado pequeño para detectar firma mágica");
                return null;
            }

            // Verificar firmas mágicas conocidas
            // JPEG: FF D8 FF
            if (bytesRead >= 3 && 
                (header[0] & 0xFF) == 0xFF && 
                (header[1] & 0xFF) == 0xD8 && 
                (header[2] & 0xFF) == 0xFF) {
                return "image/jpeg";
            }

            // PNG: 89 50 4E 47 0D 0A 1A 0A
            if (bytesRead >= 8 &&
                (header[0] & 0xFF) == 0x89 &&
                (header[1] & 0xFF) == 0x50 &&
                (header[2] & 0xFF) == 0x4E &&
                (header[3] & 0xFF) == 0x47 &&
                (header[4] & 0xFF) == 0x0D &&
                (header[5] & 0xFF) == 0x0A &&
                (header[6] & 0xFF) == 0x1A &&
                (header[7] & 0xFF) == 0x0A) {
                return "image/png";
            }

            // GIF: 47 49 46 38 (GIF8) - puede ser GIF87a o GIF89a
            if (bytesRead >= 6 &&
                (header[0] & 0xFF) == 0x47 &&
                (header[1] & 0xFF) == 0x49 &&
                (header[2] & 0xFF) == 0x46 &&
                (header[3] & 0xFF) == 0x38 &&
                ((header[4] & 0xFF) == 0x37 || (header[4] & 0xFF) == 0x39) &&
                (header[5] & 0xFF) == 0x61) {
                return "image/gif";
            }

            // WEBP: RIFF (52 49 46 46) ... WEBP (57 45 42 50)
            // Formato: RIFF [tamaño] WEBP
            if (bytesRead >= 12 &&
                (header[0] & 0xFF) == 0x52 &&
                (header[1] & 0xFF) == 0x49 &&
                (header[2] & 0xFF) == 0x46 &&
                (header[3] & 0xFF) == 0x46 &&
                (header[8] & 0xFF) == 0x57 &&
                (header[9] & 0xFF) == 0x45 &&
                (header[10] & 0xFF) == 0x42 &&
                (header[11] & 0xFF) == 0x50) {
                return "image/webp";
            }

            logger.warn("Firma mágica no reconocida. Primeros bytes: {}", 
                       bytesToHexString(header, Math.min(bytesRead, 12)));
            return null;
        }
    }

    /**
     * Convierte un array de bytes a una representación hexadecimal para logging
     */
    private String bytesToHexString(byte[] bytes, int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(String.format("%02X ", bytes[i] & 0xFF));
        }
        return sb.toString().trim();
    }

    /**
     * Sanitiza el nombre del archivo eliminando caracteres peligrosos y normalizándolo.
     * Previene path traversal y otros ataques mediante nombres de archivo maliciosos.
     * 
     * @param filename El nombre original del archivo
     * @return El nombre sanitizado
     */
    private String sanitizeFilename(String filename) {
        if (filename == null) {
            return "";
        }
        
        // Obtener solo el nombre del archivo sin la ruta (por si acaso)
        String name = filename;
        int lastSeparator = Math.max(filename.lastIndexOf('/'), filename.lastIndexOf('\\'));
        if (lastSeparator >= 0 && lastSeparator < filename.length() - 1) {
            name = filename.substring(lastSeparator + 1);
        }
        
        // Eliminar caracteres peligrosos y espacios
        name = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        
        // Eliminar puntos múltiples consecutivos
        name = name.replaceAll("\\.{2,}", ".");
        
        // Eliminar puntos al inicio o final (excepto la extensión)
        name = name.replaceAll("^\\.+|\\.+$", "");
        
        return name.trim();
    }
}

