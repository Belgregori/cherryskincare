package com.cherryskincare.controller;

import com.cherryskincare.dto.ForgotPasswordDTO;
import com.cherryskincare.dto.LoginRequestDTO;
import com.cherryskincare.dto.LoginResponseDTO;
import com.cherryskincare.dto.RefreshTokenRequestDTO;
import com.cherryskincare.dto.ResetPasswordDTO;
import com.cherryskincare.exception.InvalidCredentialsException;
import com.cherryskincare.model.RefreshToken;
import com.cherryskincare.model.User;
import com.cherryskincare.service.JwtService;
import com.cherryskincare.service.LoginAttemptService;
import com.cherryskincare.service.PasswordResetService;
import com.cherryskincare.service.RateLimitService;
import com.cherryskincare.service.RefreshTokenService;
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

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private PasswordResetService passwordResetService;

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

        // Generar token JWT y refresh token
        String token = jwtService.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        // Crear respuesta
        LoginResponseDTO response = new LoginResponseDTO();
        response.setToken(token);
        response.setRefreshToken(refreshToken.getToken());
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
        userInfo.put("phone", user.getPhone());

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

    @Operation(
            summary = "Refrescar token JWT",
            description = "Genera un nuevo access token usando un refresh token válido. No requiere autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Token refrescado exitosamente",
                    content = @Content(schema = @Schema(implementation = LoginResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Refresh token inválido o expirado",
                    content = @Content
            )
    })
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO request) {
        try {
            RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken())
                    .orElseThrow(() -> new RuntimeException("Refresh token no encontrado"));

            refreshTokenService.verifyExpiration(refreshToken);

            User user = refreshToken.getUser();

            // Generar nuevo access token
            String newToken = jwtService.generateToken(user.getEmail());

            // Crear respuesta
            LoginResponseDTO response = new LoginResponseDTO();
            response.setToken(newToken);
            response.setRefreshToken(refreshToken.getToken()); // Mismo refresh token
            response.setEmail(user.getEmail());
            response.setName(user.getName());
            response.setRole(user.getRole().name());
            response.setUserId(user.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Refresh token inválido o expirado"));
        }
    }

    @Operation(
            summary = "Cerrar sesión",
            description = "Revoca el refresh token del usuario. Requiere autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Sesión cerrada exitosamente"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "No autenticado",
                    content = @Content
            )
    })
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) RefreshTokenRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        // Si se proporciona un refresh token, revocarlo
        if (request != null && request.getRefreshToken() != null) {
            refreshTokenService.revokeToken(request.getRefreshToken());
        }

        return ResponseEntity.ok(Map.of("message", "Sesión cerrada exitosamente"));
    }

    @Operation(
            summary = "Solicitar recuperación de contraseña",
            description = "Envía un email con un enlace para recuperar la contraseña. No requiere autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Si el email existe, se enviará un correo con las instrucciones"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos inválidos",
                    content = @Content
            )
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordDTO request) {
        try {
            passwordResetService.requestPasswordReset(request.getEmailOrPhone());
            // Por seguridad, siempre retornar el mismo mensaje
            return ResponseEntity.ok(Map.of(
                    "message", 
                    "Si el email o teléfono está registrado, recibirás un correo con las instrucciones para recuperar tu contraseña"
            ));
        } catch (Exception e) {
            // Por seguridad, no revelar errores específicos
            return ResponseEntity.ok(Map.of(
                    "message", 
                    "Si el email o teléfono está registrado, recibirás un correo con las instrucciones para recuperar tu contraseña"
            ));
        }
    }

    @Operation(
            summary = "Resetear contraseña",
            description = "Resetea la contraseña usando el token recibido por email. No requiere autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Contraseña reseteada exitosamente"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Token inválido, expirado o ya utilizado",
                    content = @Content
            )
    })
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordDTO request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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

