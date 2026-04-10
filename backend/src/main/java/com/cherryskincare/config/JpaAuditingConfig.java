package com.cherryskincare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Configuración de JPA Auditing para auditoría automática de entidades.
 * 
 * Permite usar @CreatedDate y @LastModifiedDate en las entidades
 * para rastrear automáticamente cuándo se crean y modifican los registros.
 * 
 * @author Cherry Skincare Team
 * @since 1.0.0
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
    // La configuración se activa automáticamente con @EnableJpaAuditing
}
