package com.cherryskincare.service;

import com.cherryskincare.dto.ProductDTO;
import com.cherryskincare.exception.ProductNotFoundException;
import com.cherryskincare.model.Product;
import com.cherryskincare.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService Tests")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private ProductDTO testProductDTO;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Test Product");
        testProduct.setDescription("Test Description");
        testProduct.setPrice(new BigDecimal("29.99"));
        testProduct.setCategory("Category1");
        testProduct.setStockQuantity(10);
        testProduct.setIsActive(true);

        testProductDTO = new ProductDTO();
        testProductDTO.setId(1L);
        testProductDTO.setName("Test Product");
        testProductDTO.setDescription("Test Description");
        testProductDTO.setPrice(new BigDecimal("29.99"));
        testProductDTO.setCategory("Category1");
        testProductDTO.setStockQuantity(10);
        testProductDTO.setIsActive(true);
    }

    @Test
    @DisplayName("Debería obtener todos los productos activos")
    void shouldGetAllActiveProducts() {
        // Given
        Product activeProduct1 = new Product();
        activeProduct1.setId(1L);
        activeProduct1.setName("Product 1");
        activeProduct1.setIsActive(true);
        activeProduct1.setCategory("Category1");

        Product activeProduct2 = new Product();
        activeProduct2.setId(2L);
        activeProduct2.setName("Product 2");
        activeProduct2.setIsActive(true);
        activeProduct2.setCategory("Category1");

        when(productRepository.findByIsActiveTrue()).thenReturn(Arrays.asList(activeProduct1, activeProduct2));

        // When
        List<ProductDTO> result = productService.getAllProducts();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(ProductDTO::getName).contains("Product 1", "Product 2");
        verify(productRepository).findByIsActiveTrue();
    }

    @Test
    @DisplayName("Debería obtener productos por categoría")
    void shouldGetProductsByCategory() {
        // Given
        when(productRepository.findByCategoryAndIsActiveTrue("Category1"))
                .thenReturn(Arrays.asList(testProduct));

        // When
        List<ProductDTO> result = productService.getProductsByCategory("Category1");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("Category1");
        verify(productRepository).findByCategoryAndIsActiveTrue("Category1");
    }

    @Test
    @DisplayName("Debería obtener un producto por ID")
    void shouldGetProductById() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When
        ProductDTO result = productService.getProductById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test Product");
        verify(productRepository).findById(1L);
    }

    @Test
    @DisplayName("Debería lanzar excepción si el producto no existe")
    void shouldThrowExceptionWhenProductNotFound() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> productService.getProductById(999L))
                .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    @DisplayName("Debería buscar productos por nombre")
    void shouldSearchProductsByName() {
        // Given
        when(productRepository.findByNameContainingIgnoreCase("test"))
                .thenReturn(Arrays.asList(testProduct));

        // When
        List<ProductDTO> result = productService.searchProducts("test");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).containsIgnoringCase("test");
        verify(productRepository).findByNameContainingIgnoreCase("test");
    }

    @Test
    @DisplayName("Debería crear un producto exitosamente")
    void shouldCreateProductSuccessfully() {
        // Given
        ProductDTO newProductDTO = new ProductDTO();
        newProductDTO.setName("New Product");
        newProductDTO.setPrice(new BigDecimal("19.99"));
        newProductDTO.setCategory("Category2");
        newProductDTO.setStockQuantity(5);
        newProductDTO.setIsActive(true);

        Product savedProduct = new Product();
        savedProduct.setId(2L);
        savedProduct.setName("New Product");
        savedProduct.setPrice(new BigDecimal("19.99"));
        savedProduct.setCategory("Category2");
        savedProduct.setStockQuantity(5);
        savedProduct.setIsActive(true);

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        // When
        ProductDTO result = productService.createProduct(newProductDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("New Product");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Debería actualizar un producto exitosamente")
    void shouldUpdateProductSuccessfully() {
        // Given
        ProductDTO updateDTO = new ProductDTO();
        updateDTO.setName("Updated Product");
        updateDTO.setPrice(new BigDecimal("39.99"));
        updateDTO.setCategory("Category3");

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // When
        ProductDTO result = productService.updateProduct(1L, updateDTO);

        // Then
        assertThat(result).isNotNull();
        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Debería eliminar un producto (desactivarlo)")
    void shouldDeleteProduct() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // When
        productService.deleteProduct(1L);

        // Then
        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Debería subir una imagen de producto exitosamente")
    void shouldUploadProductImageSuccessfully() throws Exception {
        // Given
        MultipartFile file = mock(MultipartFile.class);
        String imageUrl = "/api/images/test-image.jpg";

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // Crear stub manual de FileStorageService
        FileStorageService fileStorageStub = new FileStorageService() {
            @Override
            public String storeFile(MultipartFile file) throws IOException {
                return imageUrl;
            }

            @Override
            public void deleteFile(String imageUrl) throws IOException {
                // No hacer nada
            }

            @Override
            public java.nio.file.Path loadFile(String filename) {
                return java.nio.file.Paths.get("test");
            }
        };
        ReflectionTestUtils.setField(productService, "fileStorageService", fileStorageStub);
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // When
        String result = productService.uploadProductImage(1L, file);

        // Then
        assertThat(result).isEqualTo(imageUrl);
        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Debería eliminar la imagen anterior al subir una nueva")
    void shouldDeleteOldImageWhenUploadingNew() throws Exception {
        // Given
        testProduct.setImageUrl("/api/images/old-image.jpg");
        MultipartFile file = mock(MultipartFile.class);
        String newImageUrl = "/api/images/new-image.jpg";
        boolean[] deleteCalled = {false};

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // Crear stub manual de FileStorageService
        FileStorageService fileStorageStub = new FileStorageService() {
            @Override
            public String storeFile(MultipartFile file) throws IOException {
                return newImageUrl;
            }

            @Override
            public void deleteFile(String imageUrl) throws IOException {
                if (imageUrl.equals("/api/images/old-image.jpg")) {
                    deleteCalled[0] = true;
                }
            }

            @Override
            public java.nio.file.Path loadFile(String filename) {
                return java.nio.file.Paths.get("test");
            }
        };
        ReflectionTestUtils.setField(productService, "fileStorageService", fileStorageStub);
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // When
        productService.uploadProductImage(1L, file);

        // Then
        assertThat(deleteCalled[0]).isTrue();
        verify(productRepository).save(any(Product.class));
    }
}
