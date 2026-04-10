package com.cherryskincare.service;

import com.cherryskincare.dto.CreateOrderDTO;
import com.cherryskincare.dto.OrderDTO;
import com.cherryskincare.dto.OrderItemDTO;
import com.cherryskincare.exception.InsufficientStockException;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService Tests")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Product testProduct;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPhone("1234567890");

        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Test Product");
        testProduct.setPrice(new BigDecimal("29.99"));
        testProduct.setCategory("Category1");
        testProduct.setStockQuantity(10);
        testProduct.setIsActive(true);

        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setUser(testUser);
        testOrder.setTotalAmount(new BigDecimal("29.99"));
        testOrder.setStatus(Order.OrderStatus.SIN_CONFIRMAR);
        testOrder.setShippingAddress("Test Address");
        testOrder.setShippingCity("Test City");
        testOrder.setOrderItems(new ArrayList<>());
    }

    @Test
    @DisplayName("Debería crear una orden exitosamente")
    void shouldCreateOrderSuccessfully() {
        // Given
        CreateOrderDTO createOrderDTO = new CreateOrderDTO();
        createOrderDTO.setShippingAddress("Test Address");
        createOrderDTO.setShippingCity("Test City");
        createOrderDTO.setShippingPostalCode("12345");

        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setProductId(1L);
        itemDTO.setQuantity(2);
        createOrderDTO.setOrderItems(Arrays.asList(itemDTO));

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            return order;
        });
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // When
        OrderDTO result = orderService.createOrder(1L, createOrderDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getShippingAddress()).isEqualTo("Test Address");
        verify(userRepository).findById(1L);
        verify(productRepository).findById(1L);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si no hay items en la orden")
    void shouldThrowExceptionWhenOrderHasNoItems() {
        // Given
        CreateOrderDTO createOrderDTO = new CreateOrderDTO();
        createOrderDTO.setShippingAddress("Test Address");
        createOrderDTO.setShippingCity("Test City");
        createOrderDTO.setOrderItems(new ArrayList<>());

        // When/Then
        assertThatThrownBy(() -> orderService.createOrder(1L, createOrderDTO))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("debe contener al menos un producto");
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si falta la dirección de envío")
    void shouldThrowExceptionWhenShippingAddressIsMissing() {
        // Given
        CreateOrderDTO createOrderDTO = new CreateOrderDTO();
        createOrderDTO.setShippingCity("Test City");
        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setProductId(1L);
        itemDTO.setQuantity(1);
        createOrderDTO.setOrderItems(Arrays.asList(itemDTO));

        // When/Then
        assertThatThrownBy(() -> orderService.createOrder(1L, createOrderDTO))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("dirección de envío es obligatoria");
    }

    @Test
    @DisplayName("Debería lanzar excepción si el usuario no existe")
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        CreateOrderDTO createOrderDTO = new CreateOrderDTO();
        createOrderDTO.setShippingAddress("Test Address");
        createOrderDTO.setShippingCity("Test City");
        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setProductId(1L);
        itemDTO.setQuantity(1);
        createOrderDTO.setOrderItems(Arrays.asList(itemDTO));

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> orderService.createOrder(999L, createOrderDTO))
                .isInstanceOf(UserNotFoundException.class);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si el producto no existe")
    void shouldThrowExceptionWhenProductNotFound() {
        // Given
        CreateOrderDTO createOrderDTO = new CreateOrderDTO();
        createOrderDTO.setShippingAddress("Test Address");
        createOrderDTO.setShippingCity("Test City");
        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setProductId(999L);
        itemDTO.setQuantity(1);
        createOrderDTO.setOrderItems(Arrays.asList(itemDTO));

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> orderService.createOrder(1L, createOrderDTO))
                .isInstanceOf(ProductNotFoundException.class);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si el stock es insuficiente")
    void shouldThrowExceptionWhenStockIsInsufficient() {
        // Given
        testProduct.setStockQuantity(5);
        CreateOrderDTO createOrderDTO = new CreateOrderDTO();
        createOrderDTO.setShippingAddress("Test Address");
        createOrderDTO.setShippingCity("Test City");
        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setProductId(1L);
        itemDTO.setQuantity(10); // Más de lo disponible
        createOrderDTO.setOrderItems(Arrays.asList(itemDTO));

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When/Then
        assertThatThrownBy(() -> orderService.createOrder(1L, createOrderDTO))
                .isInstanceOf(InsufficientStockException.class);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Debería obtener órdenes por usuario")
    void shouldGetOrdersByUser() {
        // Given
        when(orderRepository.findByUserId(1L)).thenReturn(Arrays.asList(testOrder));

        // When
        List<OrderDTO> result = orderService.getOrdersByUser(1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
        verify(orderRepository).findByUserId(1L);
    }

    @Test
    @DisplayName("Debería obtener una orden por ID")
    void shouldGetOrderById() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // When
        OrderDTO result = orderService.getOrderById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(orderRepository).findById(1L);
    }

    @Test
    @DisplayName("Debería lanzar excepción si la orden no existe")
    void shouldThrowExceptionWhenOrderNotFound() {
        // Given
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> orderService.getOrderById(999L))
                .isInstanceOf(OrderNotFoundException.class);
    }

    @Test
    @DisplayName("Debería actualizar el estado de una orden")
    void shouldUpdateOrderStatus() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        OrderDTO result = orderService.updateOrderStatus(1L, Order.OrderStatus.PAGADO);

        // Then
        assertThat(result).isNotNull();
        verify(orderRepository).findById(1L);
        verify(orderRepository).save(any(Order.class));
    }
}
