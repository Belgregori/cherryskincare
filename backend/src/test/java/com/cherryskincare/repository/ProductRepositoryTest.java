package com.cherryskincare.repository;

import com.cherryskincare.model.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("ProductRepository Tests")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    private Product activeProduct;
    private Product inactiveProduct;
    private Product productInCategory;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();

        activeProduct = new Product();
        activeProduct.setName("Active Product");
        activeProduct.setPrice(new BigDecimal("29.99"));
        activeProduct.setCategory("Category1");
        activeProduct.setStockQuantity(10);
        activeProduct.setIsActive(true);
        activeProduct = productRepository.save(activeProduct);

        inactiveProduct = new Product();
        inactiveProduct.setName("Inactive Product");
        inactiveProduct.setPrice(new BigDecimal("19.99"));
        inactiveProduct.setCategory("Category1");
        inactiveProduct.setStockQuantity(5);
        inactiveProduct.setIsActive(false);
        inactiveProduct = productRepository.save(inactiveProduct);

        productInCategory = new Product();
        productInCategory.setName("Category Product");
        productInCategory.setPrice(new BigDecimal("39.99"));
        productInCategory.setCategory("Category2");
        productInCategory.setStockQuantity(15);
        productInCategory.setIsActive(true);
        productInCategory = productRepository.save(productInCategory);
    }

    @Test
    @DisplayName("Debería encontrar solo productos activos")
    void shouldFindOnlyActiveProducts() {
        // When
        List<Product> activeProducts = productRepository.findByIsActiveTrue();

        // Then
        assertThat(activeProducts).hasSize(2);
        assertThat(activeProducts).extracting(Product::getIsActive).containsOnly(true);
        assertThat(activeProducts).extracting(Product::getName)
                .contains("Active Product", "Category Product");
    }

    @Test
    @DisplayName("Debería encontrar productos por categoría")
    void shouldFindProductsByCategory() {
        // When
        List<Product> products = productRepository.findByCategory("Category1");

        // Then
        assertThat(products).hasSize(2);
        assertThat(products).extracting(Product::getCategory).containsOnly("Category1");
    }

    @Test
    @DisplayName("Debería encontrar productos activos por categoría")
    void shouldFindActiveProductsByCategory() {
        // When
        List<Product> products = productRepository.findByCategoryAndIsActiveTrue("Category1");

        // Then
        assertThat(products).hasSize(1);
        assertThat(products.get(0).getName()).isEqualTo("Active Product");
        assertThat(products.get(0).getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Debería buscar productos por nombre (case insensitive)")
    void shouldSearchProductsByNameCaseInsensitive() {
        // When
        List<Product> products = productRepository.findByNameContainingIgnoreCase("active");

        // Then
        assertThat(products).hasSize(2);
        assertThat(products).extracting(Product::getName)
                .contains("Active Product", "Inactive Product");
    }

    @Test
    @DisplayName("Debería retornar lista vacía cuando no hay productos activos")
    void shouldReturnEmptyListWhenNoActiveProducts() {
        // Given
        productRepository.deleteAll();

        // When
        List<Product> products = productRepository.findByIsActiveTrue();

        // Then
        assertThat(products).isEmpty();
    }
}
