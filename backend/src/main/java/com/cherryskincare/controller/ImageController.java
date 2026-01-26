package com.cherryskincare.controller;

import com.cherryskincare.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = fileStorageService.storeFile(file);
            return ResponseEntity.ok().body(new ImageUploadResponse(imageUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al subir la imagen: " + e.getMessage());
        }
    }

    /**
     * Obtiene una imagen por su nombre de archivo.
     * 
     * NOTA DE SEGURIDAD:
     * - Las rutas no son predecibles (usamos UUIDs)
     * - Se valida path traversal en FileStorageService.loadFile()
     * - El acceso está permitido públicamente para imágenes de productos
     * - Para mayor seguridad, considerar restringir acceso o usar tokens temporales
     * 
     * @param filename Nombre del archivo (UUID + extensión)
     * @return La imagen como recurso
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            // Validación adicional de seguridad: asegurar que el filename tiene formato válido
            // Formato esperado: UUID sin guiones (32 chars hex) + extensión
            if (filename == null || filename.trim().isEmpty() || filename.length() > 50) {
                return ResponseEntity.badRequest().build();
            }
            
            // Validar que el filename solo contiene caracteres alfanuméricos y punto
            if (!filename.matches("^[a-fA-F0-9]{32}\\.[a-z]{3,4}$")) {
                // Log de intento de acceso con formato inválido (posible ataque)
                org.slf4j.LoggerFactory.getLogger(ImageController.class)
                    .warn("Intento de acceso a imagen con formato inválido: {}", filename);
                return ResponseEntity.badRequest().build();
            }
            
            Path filePath = fileStorageService.loadFile(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                MediaType mediaType = contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM;
                
                // Headers de seguridad adicionales
                return ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + sanitizeFilenameForHeader(resource.getFilename()) + "\"")
                        // Prevenir que el navegador ejecute el contenido como script
                        .header("X-Content-Type-Options", "nosniff")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Sanitiza el nombre del archivo para usarlo en headers HTTP.
     * Previene inyección de caracteres especiales en headers.
     */
    private String sanitizeFilenameForHeader(String filename) {
        if (filename == null) {
            return "image";
        }
        // Eliminar caracteres peligrosos que podrían usarse en headers
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    // Clase interna para la respuesta
    @SuppressWarnings("unused")
    private static class ImageUploadResponse {
        private String imageUrl;

        public ImageUploadResponse(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
}

