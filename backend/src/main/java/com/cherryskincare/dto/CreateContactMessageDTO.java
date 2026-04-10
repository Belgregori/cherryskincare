package com.cherryskincare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateContactMessageDTO {

    @NotBlank(message = "El nombre es requerido")
    @Size(max = 255, message = "El nombre no puede superar 255 caracteres")
    private String name;

    @NotBlank(message = "El email es requerido")
    @Email(message = "El email no es válido")
    @Size(max = 255, message = "El email no puede superar 255 caracteres")
    private String email;

    @NotBlank(message = "El mensaje es requerido")
    @Size(max = 5000, message = "El mensaje no puede superar 5000 caracteres")
    private String message;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

