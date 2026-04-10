package com.cherryskincare.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Implementación por defecto del servicio de escaneo antivirus.
 * 
 * Esta implementación NO realiza escaneo real, solo registra que se debería escanear.
 * 
 * Para habilitar escaneo real en producción:
 * 1. Implementar una de las opciones mencionadas en VirusScanService
 * 2. Configurar la propiedad: virus.scan.enabled=true
 * 3. Reemplazar esta implementación con una real
 * 
 * @author Cherry Skincare Team
 */
@Service
@ConditionalOnProperty(name = "virus.scan.enabled", havingValue = "false", matchIfMissing = true)
public class NoOpVirusScanService implements VirusScanService {
    
    private static final Logger logger = LoggerFactory.getLogger(NoOpVirusScanService.class);
    
    @Override
    public ScanResult scanFile(MultipartFile file) throws IOException, VirusDetectedException {
        // En desarrollo/testing, no se realiza escaneo real
        // Solo se registra que el archivo pasó por el servicio de escaneo
        logger.debug("Escaneo antivirus deshabilitado. Archivo: {} ({} bytes)", 
                    file.getOriginalFilename(), file.getSize());
        
        return new ScanResult(true, "Escaneo deshabilitado (modo desarrollo)", "NoOp");
    }
}
