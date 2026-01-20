package com.cherryskincare.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta de autenticación exitosa")
public class LoginResponseDTO {
    @Schema(description = "Token JWT para autenticación en requests posteriores", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @Schema(description = "Email del usuario autenticado", example = "usuario@example.com")
    private String email;
    
    @Schema(description = "Nombre del usuario", example = "Juan Pérez")
    private String name;
    
    @Schema(description = "Rol del usuario", example = "USER", allowableValues = {"USER", "ADMIN"})
    private String role;
    
    @Schema(description = "ID del usuario", example = "1")
    private Long userId;

    public LoginResponseDTO() {
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}

