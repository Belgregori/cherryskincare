package com.cherryskincare.service;

import com.cherryskincare.dto.AdminOrderDTO;
import com.cherryskincare.dto.AdminProductDTO;
import com.cherryskincare.dto.AdminUserDTO;
import com.cherryskincare.dto.OrderItemDTO;
import com.cherryskincare.model.Order;
import com.cherryskincare.model.Product;
import com.cherryskincare.model.User;
import com.cherryskincare.repository.OrderRepository;
import com.cherryskincare.repository.ProductRepository;
import com.cherryskincare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    // ========== GESTIÓN DE PRODUCTOS ==========

    public List<AdminProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertProductToDTO)
                .collect(Collectors.toList());
    }

    public AdminProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return convertProductToDTO(product);
    }

    public AdminProductDTO createProduct(AdminProductDTO productDTO) {
        Product product = new Product();
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setImageUrl(productDTO.getImageUrl());
        product.setCategory(productDTO.getCategory());
        product.setStockQuantity(productDTO.getStockQuantity() != null ? productDTO.getStockQuantity() : 0);
        product.setIsActive(productDTO.getIsActive() != null ? productDTO.getIsActive() : true);

        product = productRepository.save(product);
        return convertProductToDTO(product);
    }

    public AdminProductDTO updateProduct(Long id, AdminProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setImageUrl(productDTO.getImageUrl());
        product.setCategory(productDTO.getCategory());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setIsActive(productDTO.getIsActive());

        product = productRepository.save(product);
        return convertProductToDTO(product);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        productRepository.delete(product);
    }

    // ========== GESTIÓN DE ÓRDENES ==========

    public List<AdminOrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertOrderToDTO)
                .collect(Collectors.toList());
    }

    public AdminOrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        return convertOrderToDTO(order);
    }

    public AdminOrderDTO updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        order.setStatus(status);
        order = orderRepository.save(order);
        return convertOrderToDTO(order);
    }

    // ========== GESTIÓN DE USUARIOS ==========

    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertUserToDTO)
                .collect(Collectors.toList());
    }

    public AdminUserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertUserToDTO(user);
    }

    // ========== MÉTODOS DE CONVERSIÓN ==========

    private AdminProductDTO convertProductToDTO(Product product) {
        AdminProductDTO dto = new AdminProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setCategory(product.getCategory());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setIsActive(product.getIsActive());
        return dto;
    }

    private AdminOrderDTO convertOrderToDTO(Order order) {
        AdminOrderDTO dto = new AdminOrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setUserName(order.getUser().getName());
        dto.setUserEmail(order.getUser().getEmail());
        dto.setUserPhone(order.getUser().getTelefone());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setShippingCity(order.getShippingCity());
        dto.setShippingPostalCode(order.getShippingPostalCode());
        dto.setShippingPhone(order.getShippingPhone());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        dto.setOrderItems(order.getOrderItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setProductId(item.getProduct().getId());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPrice(item.getPrice());
                    itemDTO.setSubtotal(item.getSubtotal());
                    return itemDTO;
                })
                .collect(Collectors.toList()));

        return dto;
    }

    private AdminUserDTO convertUserToDTO(User user) {
        AdminUserDTO dto = new AdminUserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setTelefone(user.getTelefone());
        dto.setRole(user.getRole().name());

        // Contar órdenes del usuario
        int orderCount = orderRepository.findByUserId(user.getId()).size();
        dto.setOrderCount(orderCount);

        return dto;
    }
}

