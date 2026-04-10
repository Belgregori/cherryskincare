package com.cherryskincare.security;

import com.cherryskincare.controller.ProductController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("SecurityConfig Tests")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Debería permitir acceso público a /api/products")
    void shouldAllowPublicAccessToProducts() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Debería permitir acceso público a /api/products/{id}")
    void shouldAllowPublicAccessToProductById() throws Exception {
        // When/Then - El endpoint es público, aunque el producto no exista retornará 404 (no 401/403)
        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isNotFound()); // 404 significa que el endpoint es accesible pero el recurso no existe
    }
}
