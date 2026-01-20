package com.cherryskincare.controller;

import com.cherryskincare.dto.LoginRequestDTO;
import com.cherryskincare.dto.LoginResponseDTO;
import com.cherryskincare.exception.InvalidCredentialsException;
import com.cherryskincare.model.User;
import com.cherryskincare.service.JwtService;
import com.cherryskincare.service.LoginAttemptService;
import com.cherryskincare.service.RateLimitService;
import com.cherryskincare.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para autenticación y gestión de sesión de usuarios")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private LoginAttemptService loginAttemptService;

    @Autowired
    private RateLimitService rateLimitService;

    @Operation(
            summary = "Iniciar sesión",
            description = "Autentica un usuario y retorna un token JWT para acceder a los endpoints protegidos"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Login exitoso",
                    content = @Content(schema = @Schema(implementation = LoginResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Credenciales inválidas",
                    content = @Content
            )
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest, HttpServletRequest request) {
        String identifier = loginRequest.getEmail();
        String clientIp = getClientIp(request);

        if (!rateLimitService.tryConsume(clientIp)) {
            return ResponseEntity.status(429).body(Map.of("error", "Demasiadas solicitudes. Intenta más tarde"));
        }

        if (loginAttemptService.isLocked(identifier)) {
            return ResponseEntity.status(429).body(Map.of("error", "Cuenta bloqueada temporalmente por intentos fallidos"));
        }

        // Autenticar usuario
        User user;
        try {
            user = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        } catch (InvalidCredentialsException e) {
            loginAttemptService.recordFailedAttempt(identifier);
            throw e;
        }

        loginAttemptService.resetAttempts(identifier);

        // Generar token JWT
        String token = jwtService.generateToken(user.getEmail());

        // Crear respuesta
        LoginResponseDTO response = new LoginResponseDTO();
        response.setToken(token);
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole().name());
        response.setUserId(user.getId());

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Obtener usuario actual",
            description = "Retorna la información del usuario autenticado actualmente"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Información del usuario obtenida exitosamente"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autenticado",
                    content = @Content
            )
    })
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("email", user.getEmail());
        userInfo.put("name", user.getName());
        userInfo.put("role", user.getRole().name());
        userInfo.put("telefone", user.getTelefone());

        return ResponseEntity.ok(userInfo);
    }

    @Operation(
            summary = "Verificar token JWT",
            description = "Verifica si un token JWT es válido y retorna información del usuario asociado"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Token válido"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Token inválido o no proporcionado",
                    content = @Content
            )
    })
    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "error", "Token no proporcionado"));
        }

        String token = authHeader.substring(7);
        
        try {
            String email = jwtService.extractEmail(token);
            boolean isValid = jwtService.validateToken(token, email);
            
            if (isValid) {
                User user = userService.findByEmail(email);
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("email", email);
                response.put("role", user.getRole().name());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body(Map.of("valid", false, "error", "Token inválido o expirado"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "error", "Token inválido"));
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

