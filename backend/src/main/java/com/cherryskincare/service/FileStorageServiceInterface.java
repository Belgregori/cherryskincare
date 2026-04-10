package com.cherryskincare.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Interfaz para el servicio de almacenamiento de archivos.
 * 
 * Permite implementar diferentes estrategias de almacenamiento:
 * - Almacenamiento local (FileStorageService)
 * - Almacenamiento en la nube (S3, Azure Blob, Google Cloud Storage, etc.)
 * 
 * NOTA: Para producción, se recomienda usar almacenamiento externo (S3) porque:
 * - Escalabilidad: No consume espacio del servidor de aplicación
 * - Disponibilidad: CDN y redundancia
 * - Seguridad: Separación de responsabilidades
 * - Mantenimiento: Backups y versionado más fácil
 * 
 * @author Cherry Skincare Team
 */
public interface FileStorageServiceInterface {
    
    /**
     * Almacena un archivo y retorna su URL de acceso.
     * 
     * @param file El archivo a almacenar
     * @return La URL relativa o absoluta para acceder al archivo
     * @throws IOException Si hay un error al almacenar el archivo
     */
    String storeFile(MultipartFile file) throws IOException;
    
    /**
     * Elimina un archivo del almacenamiento.
     * 
     * @param imageUrl La URL del archivo a eliminar
     * @throws IOException Si hay un error al eliminar el archivo
     */
    void deleteFile(String imageUrl) throws IOException;
    
    /**
     * Verifica si un archivo existe en el almacenamiento.
     * 
     * @param imageUrl La URL del archivo
     * @return true si el archivo existe, false en caso contrario
     */
    boolean fileExists(String imageUrl);
}
