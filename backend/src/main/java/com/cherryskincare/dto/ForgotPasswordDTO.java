package com.cherryskincare.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request para solicitar recuperación de contraseña")
public class ForgotPasswordDTO {
    
    @Schema(description = "Email o teléfono del usuario", example = "usuario@example.com", required = true)
    @NotBlank(message = "El email o teléfono es obligatorio")
    private String emailOrPhone;

    public ForgotPasswordDTO() {
    }

    public String getEmailOrPhone() {
        return emailOrPhone;
    }

    public void setEmailOrPhone(String emailOrPhone) {
        this.emailOrPhone = emailOrPhone;
    }
}
