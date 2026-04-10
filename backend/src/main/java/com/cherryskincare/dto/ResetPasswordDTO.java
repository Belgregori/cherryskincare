package com.cherryskincare.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request para resetear contraseña con token")
public class ResetPasswordDTO {
    
    @Schema(description = "Token de recuperación de contraseña", example = "abc123...", required = true)
    @NotBlank(message = "El token es obligatorio")
    private String token;
    
    @Schema(description = "Nueva contraseña", example = "nuevaPassword123", required = true)
    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String newPassword;

    public ResetPasswordDTO() {
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
