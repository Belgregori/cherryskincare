package com.cherryskincare.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración global de CORS (Cross-Origin Resource Sharing).
 * 
 * Esta configuración reemplaza el uso de @CrossOrigin(origins = "*") en los controladores,
 * lo cual es inseguro en producción. Aquí se definen explícitamente los orígenes permitidos
 * desde las variables de entorno.
 * 
 * @author Cherry Skincare Team
 * @since 1.0.0
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Configuración del origen de CORS.
     * <p>
     * Define qué orígenes tienen permitido hacer peticiones a la API.
     * Los orígenes se configuran mediante la propiedad {@code cors.allowed-origins}
     * separados por comas (ejemplo: {@code http://localhost:3000,https://misitio.com}).
     * El registro aplica esta configuración a todas las rutas del contexto servlet.
     *
     * @return CorsConfigurationSource con la configuración de CORS
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Convertir la cadena de orígenes separados por comas en una lista
        List<String> allowedOriginsList = Arrays.asList(allowedOrigins.split(","));
        
        // Configurar orígenes permitidos
        configuration.setAllowedOrigins(allowedOriginsList);
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Headers que el cliente puede leer en la respuesta
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        // Permitir envío de credenciales (cookies, auth headers)
        // IMPORTANTE: Si allowCredentials es true, allowedOrigins NO puede ser "*"
        configuration.setAllowCredentials(true);
        
        // Tiempo de caché para las respuestas preflight (OPTIONS)
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Toda la app (incluye /api/** y cualquier otra ruta bajo el contexto servlet)
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
