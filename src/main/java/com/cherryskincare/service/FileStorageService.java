package com.cherryskincare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads/images}")
    private String uploadDir;

    public String storeFile(MultipartFile file) throws IOException {
        // Validar que sea una imagen
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen");
        }

        // Validar tamaño (máximo 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("La imagen no puede ser mayor a 5MB");
        }

        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único para el archivo
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;

        // Guardar archivo
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retornar la URL relativa
        return "/api/images/" + filename;
    }

    public void deleteFile(String imageUrl) throws IOException {
        if (imageUrl != null && imageUrl.startsWith("/api/images/")) {
            String filename = imageUrl.substring("/api/images/".length());
            Path filePath = Paths.get(uploadDir).resolve(filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        }
    }

    public Path loadFile(String filename) {
        return Paths.get(uploadDir).resolve(filename);
    }
}

