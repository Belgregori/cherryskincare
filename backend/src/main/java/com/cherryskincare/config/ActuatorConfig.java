package com.cherryskincare.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.boot.actuate.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Configuración de Spring Boot Actuator para health checks y monitoreo.
 */
@Configuration
public class ActuatorConfig {

    @Bean
    public HealthIndicator customHealthIndicator() {
        return new HealthIndicator() {
            @Override
            public Health health() {
                // Verificaciones adicionales de salud personalizadas
                // Por ejemplo, verificar conectividad a servicios externos, etc.
                return Health.up()
                        .withDetail("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                        .withDetail("application", "Cherry Skincare API")
                        .build();
            }
        };
    }

    @Bean
    public InfoContributor customInfoContributor() {
        return new InfoContributor() {
            @Override
            public void contribute(Info.Builder builder) {
                builder.withDetail("application", Map.of(
                        "name", "Cherry Skincare",
                        "version", "1.0.0",
                        "description", "API para tienda online de productos de skincare"
                ));
                builder.withDetail("environment", System.getProperty("spring.profiles.active", "default"));
                builder.withDetail("java", Map.of(
                        "version", System.getProperty("java.version"),
                        "vendor", System.getProperty("java.vendor")
                ));
            }
        };
    }
}
