package com.cherryskincare.dto;

import lombok.Data;

@Data
public class AdminUserDTO {
    private Long id;
    private String name;
    private String email;
    private String telefone;
    private String role;
    private Integer orderCount; // Número de órdenes del usuario
}

