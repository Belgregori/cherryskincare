package com.cherryskincare.service;

import com.cherryskincare.dto.AdminOrderDTO;
import com.cherryskincare.dto.AdminProductDTO;
import com.cherryskincare.dto.AdminUserDTO;
import com.cherryskincare.exception.OrderNotFoundException;
import com.cherryskincare.exception.ProductNotFoundException;
import com.cherryskincare.exception.UserNotFoundException;
import com.cherryskincare.exception.ValidationException;
import com.cherryskincare.model.Order;
import com.cherryskincare.model.Product;
import com.cherryskincare.model.User;
import com.cherryskincare.repository.OrderRepository;
import com.cherryskincare.repository.ProductRepository;
import com.cherryskincare.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService Tests")
class AdminServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminService adminService;

    private Product testProduct;
    private Order testOrder;
    private User testUser;

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

        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPhone("1234567890");

        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setUser(testUser);
        testOrder.setTotalAmount(new BigDecimal("29.99"));
        testOrder.setStatus(Order.OrderStatus.SIN_CONFIRMAR);
        testOrder.setShippingAddress("Test Address");
        testOrder.setShippingCity("Test City");
    }

    @Test
    @DisplayName("Debería obtener todos los productos")
    void shouldGetAllProducts() {
        // Given
        when(productRepository.findAll()).thenReturn(Arrays.asList(testProduct));

        // When
        List<AdminProductDTO> result = adminService.getAllProducts();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Product");
        verify(productRepository).findAll();
    }

    @Test
    @DisplayName("Debería obtener un producto por ID")
    void shouldGetProductById() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When
        AdminProductDTO result = adminService.getProductById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test Product");
        verify(productRepository).findById(1L);
    }

    @Test
    @DisplayName("Debería crear un producto exitosamente")
    void shouldCreateProductSuccessfully() {
        // Given
        AdminProductDTO productDTO = new AdminProductDTO();
        productDTO.setName("New Product");
        productDTO.setPrice(new BigDecimal("19.99"));
        productDTO.setCategory("Category2");
        productDTO.setStockQuantity(5);
        productDTO.setIsActive(true);

        Product savedProduct = new Product();
        savedProduct.setId(2L);
        savedProduct.setName("New Product");
        savedProduct.setPrice(new BigDecimal("19.99"));
        savedProduct.setCategory("Category2");
        savedProduct.setStockQuantity(5);
        savedProduct.setIsActive(true);

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        // When
        AdminProductDTO result = adminService.createProduct(productDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("New Product");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si el nombre del producto está vacío")
    void shouldThrowExceptionWhenProductNameIsEmpty() {
        // Given
        AdminProductDTO productDTO = new AdminProductDTO();
        productDTO.setName("");
        productDTO.setPrice(new BigDecimal("19.99"));

        // When/Then
        assertThatThrownBy(() -> adminService.createProduct(productDTO))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("nombre del producto es obligatorio");
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si el precio es inválido")
    void shouldThrowExceptionWhenPriceIsInvalid() {
        // Given
        AdminProductDTO productDTO = new AdminProductDTO();
        productDTO.setName("Test Product");
        productDTO.setPrice(new BigDecimal("0"));

        // When/Then
        assertThatThrownBy(() -> adminService.createProduct(productDTO))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("precio debe ser mayor a cero");
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Debería actualizar un producto exitosamente")
    void shouldUpdateProductSuccessfully() {
        // Given
        AdminProductDTO productDTO = new AdminProductDTO();
        productDTO.setName("Updated Product");
        productDTO.setPrice(new BigDecimal("39.99"));

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // When
        AdminProductDTO result = adminService.updateProduct(1L, productDTO);

        // Then
        assertThat(result).isNotNull();
        verify(productRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Debería eliminar un producto")
    void shouldDeleteProduct() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        doNothing().when(productRepository).delete(any(Product.class));

        // When
        adminService.deleteProduct(1L);

        // Then
        verify(productRepository).findById(1L);
        verify(productRepository).delete(any(Product.class));
    }

    @Test
    @DisplayName("Debería obtener todas las órdenes")
    void shouldGetAllOrders() {
        // Given
        when(orderRepository.findAll()).thenReturn(Arrays.asList(testOrder));

        // When
        List<AdminOrderDTO> result = adminService.getAllOrders();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(orderRepository).findAll();
    }

    @Test
    @DisplayName("Debería obtener una orden por ID")
    void shouldGetOrderById() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // When
        AdminOrderDTO result = adminService.getOrderById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(orderRepository).findById(1L);
    }

    @Test
    @DisplayName("Debería actualizar el estado de una orden")
    void shouldUpdateOrderStatus() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        AdminOrderDTO result = adminService.updateOrderStatus(1L, Order.OrderStatus.PAGADO);

        // Then
        assertThat(result).isNotNull();
        verify(orderRepository).findById(1L);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Debería obtener todos los usuarios")
    void shouldGetAllUsers() {
        // Given
        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser));
        when(orderRepository.findByUserId(1L)).thenReturn(Arrays.asList());

        // When
        List<AdminUserDTO> result = adminService.getAllUsers();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test User");
        verify(userRepository).findAll();
    }

    @Test
    @DisplayName("Debería obtener un usuario por ID")
    void shouldGetUserById() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(orderRepository.findByUserId(1L)).thenReturn(Arrays.asList());

        // When
        AdminUserDTO result = adminService.getUserById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test User");
        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("Debería lanzar excepción si el producto no existe al obtener")
    void shouldThrowExceptionWhenProductNotFound() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> adminService.getProductById(999L))
                .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    @DisplayName("Debería lanzar excepción si la orden no existe")
    void shouldThrowExceptionWhenOrderNotFound() {
        // Given
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> adminService.getOrderById(999L))
                .isInstanceOf(OrderNotFoundException.class);
    }

    @Test
    @DisplayName("Debería lanzar excepción si el usuario no existe")
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> adminService.getUserById(999L))
                .isInstanceOf(UserNotFoundException.class);
    }
}
