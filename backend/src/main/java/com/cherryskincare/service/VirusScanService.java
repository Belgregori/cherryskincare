package com.cherryskincare.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Servicio para escanear archivos en busca de virus y malware.
 * 
 * IMPORTANTE: Para producción, se recomienda implementar escaneo antivirus porque:
 * - Previene la subida de archivos maliciosos
 * - Protege contra malware que podría ejecutarse en el servidor
 * - Cumple con estándares de seguridad empresariales
 * 
 * OPCIONES DE IMPLEMENTACIÓN:
 * 
 * 1. ClamAV (Open Source):
 *    - Librería: com.github.clamav:clamav-client
 *    - Requiere servidor ClamAV corriendo
 *    - Gratuito pero requiere infraestructura
 * 
 * 2. VirusTotal API:
 *    - Servicio en la nube
 *    - Límites de uso gratuito
 *    - Requiere API key
 * 
 * 3. AWS Macie / Amazon GuardDuty:
 *    - Si se usa S3 para almacenamiento
 *    - Integración nativa con AWS
 * 
 * 4. Content Disarm & Reconstruction (CDR):
 *    - OPSWAT, Votiro, etc.
 *    - Reconstruye archivos eliminando contenido potencialmente peligroso
 *    - Más seguro pero puede alterar archivos legítimos
 * 
 * IMPLEMENTACIÓN ACTUAL:
 * - Por defecto, este servicio no realiza escaneo (solo validaciones básicas)
 * - Para producción, se debe implementar una de las opciones anteriores
 * 
 * @author Cherry Skincare Team
 */
public interface VirusScanService {
    
    /**
     * Escanea un archivo en busca de virus y malware.
     * 
     * @param file El archivo a escanear
     * @return Resultado del escaneo
     * @throws IOException Si hay un error al leer el archivo
     * @throws VirusDetectedException Si se detecta un virus o malware
     */
    ScanResult scanFile(MultipartFile file) throws IOException, VirusDetectedException;
    
    /**
     * Resultado del escaneo de un archivo.
     */
    class ScanResult {
        private final boolean isClean;
        private final String message;
        private final String scanEngine;
        
        public ScanResult(boolean isClean, String message, String scanEngine) {
            this.isClean = isClean;
            this.message = message;
            this.scanEngine = scanEngine;
        }
        
        public boolean isClean() {
            return isClean;
        }
        
        public String getMessage() {
            return message;
        }
        
        public String getScanEngine() {
            return scanEngine;
        }
    }
    
    /**
     * Excepción lanzada cuando se detecta un virus o malware.
     */
    class VirusDetectedException extends Exception {
        public VirusDetectedException(String message) {
            super(message);
        }
        
        public VirusDetectedException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
