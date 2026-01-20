package com.cherryskincare.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.http.HttpMethod;

/**
 * Configuración de seguridad de la aplicación.
 * 
 * Define las políticas de seguridad, autenticación y autorización para la API.
 * 
 * NOTA SOBRE CSRF:
 * CSRF está deshabilitado porque:
 * 1. La aplicación usa autenticación stateless con JWT (no hay cookies de sesión)
 * 2. Los tokens JWT se almacenan en localStorage del cliente (no en cookies)
 * 3. CSRF protege contra ataques basados en cookies de sesión del navegador
 * 4. Con JWT en headers Authorization, cada request debe incluir explícitamente el token
 * 
 * En una aplicación tradicional con cookies de sesión, CSRF SÍ debe estar habilitado.
 * 
 * @author Cherry Skincare Team
 * @since 1.0.0
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    @Lazy
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Configurar CORS usando la configuración global definida en CorsConfig
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            
            // CSRF deshabilitado - Ver documentación de la clase para justificación
            // Para APIs REST stateless con JWT, CSRF no es necesario porque:
            // - No hay cookies de sesión
            // - El token JWT debe incluirse explícitamente en cada request
            // - El navegador no envía automáticamente el token (como haría con cookies)
            .csrf(csrf -> csrf.disable())

            // Headers de seguridad básicos para APIs
            .headers(headers -> headers
                .contentTypeOptions(contentType -> {})
                .frameOptions(frame -> frame.deny())
                .referrerPolicy(referrer -> referrer.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"))
            )
            
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos (no requieren autenticación)
                .requestMatchers("/api/auth/login", "/api/auth/verify").permitAll()
                .requestMatchers("/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/images/**").permitAll()
                .requestMatchers("/api/images/upload").hasRole("ADMIN")
                .requestMatchers("/api/users/register").permitAll()
                // Swagger UI y documentación OpenAPI
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**").permitAll()
                
                // Endpoints de admin - requieren rol ADMIN
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Endpoints protegidos - requieren autenticación (cualquier usuario autenticado)
                .requestMatchers("/api/auth/me").authenticated()
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers("/api/orders/**").authenticated()
                
                // Resto de endpoints requieren autenticación
                .anyRequest().authenticated()
            )
            
            // Configurar sesiones stateless (sin cookies de sesión, solo JWT)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Agregar el filtro JWT antes del filtro de autenticación de Spring Security
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

