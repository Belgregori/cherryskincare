package com.cherryskincare.controller;

import com.cherryskincare.dto.ProductDTO;
import com.cherryskincare.model.Product;
import com.cherryskincare.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("ProductController Integration Tests")
class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();

        testProduct = new Product();
        testProduct.setName("Test Product");
        testProduct.setDescription("Test Description");
        testProduct.setPrice(new BigDecimal("29.99"));
        testProduct.setCategory("Category1");
        testProduct.setStockQuantity(10);
        testProduct.setIsActive(true);
        productRepository.save(testProduct);
    }

    @Test
    @DisplayName("Debería obtener todos los productos activos")
    void shouldGetAllActiveProducts() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Product"));
    }

    @Test
    @DisplayName("Debería obtener un producto por ID")
    void shouldGetProductById() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/products/{id}", testProduct.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testProduct.getId()))
                .andExpect(jsonPath("$.name").value("Test Product"));
    }

    @Test
    @DisplayName("Debería retornar 404 si el producto no existe")
    void shouldReturn404WhenProductNotFound() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Debería obtener productos por categoría")
    void shouldGetProductsByCategory() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/products/category/Category1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].category").value("Category1"));
    }

    @Test
    @DisplayName("Debería buscar productos por nombre")
    void shouldSearchProducts() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/products/search")
                        .param("q", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Debería crear un producto")
    void shouldCreateProduct() throws Exception {
        // Given
        ProductDTO productDTO = new ProductDTO();
        productDTO.setName("New Product");
        productDTO.setPrice(new BigDecimal("19.99"));
        productDTO.setCategory("Category2");
        productDTO.setStockQuantity(5);
        productDTO.setIsActive(true);

        // When/Then
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Product"));
    }
}
