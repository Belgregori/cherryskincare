package com.cherryskincare.service;

import com.cherryskincare.dto.AdminOrderDTO;
import com.cherryskincare.dto.AdminProductDTO;
import com.cherryskincare.dto.AdminUserDTO;
import com.cherryskincare.dto.OrderItemDTO;
import com.cherryskincare.dto.PageResponseDTO;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

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

    public PageResponseDTO<AdminProductDTO> getAllProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productPage = productRepository.findAll(pageable);
        
        List<AdminProductDTO> content = productPage.getContent().stream()
                .map(this::convertProductToDTO)
                .collect(Collectors.toList());
        
        return new PageResponseDTO<>(
                content,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages()
        );
    }

    public AdminProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return convertProductToDTO(product);
    }

    public AdminProductDTO createProduct(AdminProductDTO productDTO) {
        logger.info("Creando nuevo producto: {}", productDTO.getName());
        
        // Validaciones
        if (productDTO.getName() == null || productDTO.getName().trim().isEmpty()) {
            logger.warn("Intento de crear producto sin nombre");
            throw new ValidationException("El nombre del producto es obligatorio");
        }
        
        if (productDTO.getPrice() == null || productDTO.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            logger.warn("Intento de crear producto con precio inválido: {}", productDTO.getPrice());
            throw new ValidationException("El precio debe ser mayor a cero");
        }

        Product product = new Product();
        product.setName(productDTO.getName().trim());
        product.setDescription(productDTO.getDescription() != null ? productDTO.getDescription().trim() : null);
        product.setPrice(productDTO.getPrice());
        product.setImageUrl(productDTO.getImageUrl());
        product.setCategory(productDTO.getCategory() != null ? productDTO.getCategory().trim() : null);
        product.setStockQuantity(productDTO.getStockQuantity() != null ? productDTO.getStockQuantity() : 0);
        product.setIsActive(productDTO.getIsActive() != null ? productDTO.getIsActive() : true);

        product = productRepository.save(product);
        logger.info("Producto creado exitosamente - ID: {}, Nombre: {}", product.getId(), product.getName());
        
        return convertProductToDTO(product);
    }

    public AdminProductDTO updateProduct(Long id, AdminProductDTO productDTO) {
        logger.info("Actualizando producto ID: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Producto no encontrado al actualizar: {}", id);
                    return new ProductNotFoundException(id);
                });

        // Validaciones
        if (productDTO.getName() != null && productDTO.getName().trim().isEmpty()) {
            logger.warn("Intento de actualizar producto con nombre vacío");
            throw new ValidationException("El nombre del producto no puede estar vacío");
        }
        
        if (productDTO.getPrice() != null && productDTO.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            logger.warn("Intento de actualizar producto con precio inválido: {}", productDTO.getPrice());
            throw new ValidationException("El precio debe ser mayor a cero");
        }

        if (productDTO.getName() != null) {
            product.setName(productDTO.getName().trim());
        }
        if (productDTO.getDescription() != null) {
            product.setDescription(productDTO.getDescription().trim());
        }
        if (productDTO.getPrice() != null) {
            product.setPrice(productDTO.getPrice());
        }
        if (productDTO.getImageUrl() != null) {
            product.setImageUrl(productDTO.getImageUrl());
        }
        if (productDTO.getCategory() != null) {
            product.setCategory(productDTO.getCategory().trim());
        }
        if (productDTO.getStockQuantity() != null) {
            product.setStockQuantity(productDTO.getStockQuantity());
        }
        if (productDTO.getIsActive() != null) {
            product.setIsActive(productDTO.getIsActive());
        }

        product = productRepository.save(product);
        logger.info("Producto actualizado exitosamente - ID: {}, Nombre: {}", product.getId(), product.getName());
        
        return convertProductToDTO(product);
    }

    public void deleteProduct(Long id) {
        logger.info("Eliminando producto ID: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Producto no encontrado al eliminar: {}", id);
                    return new RuntimeException("Producto no encontrado");
                });
        
        logger.info("Producto eliminado - ID: {}, Nombre: {}", product.getId(), product.getName());
        productRepository.delete(product);
    }

    // ========== GESTIÓN DE ÓRDENES ==========

    public List<AdminOrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertOrderToDTO)
                .collect(Collectors.toList());
    }

    public PageResponseDTO<AdminOrderDTO> getAllOrders(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Order> orderPage = orderRepository.findAll(pageable);
        
        List<AdminOrderDTO> content = orderPage.getContent().stream()
                .map(this::convertOrderToDTO)
                .collect(Collectors.toList());
        
        return new PageResponseDTO<>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages()
        );
    }

    public AdminOrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return convertOrderToDTO(order);
    }

    public AdminOrderDTO updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
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

    public PageResponseDTO<AdminUserDTO> getAllUsers(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> userPage = userRepository.findAll(pageable);
        
        List<AdminUserDTO> content = userPage.getContent().stream()
                .map(this::convertUserToDTO)
                .collect(Collectors.toList());
        
        return new PageResponseDTO<>(
                content,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages()
        );
    }

    public AdminUserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
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
        dto.setUserPhone(order.getUser().getPhone());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setShippingCity(order.getShippingCity());
        dto.setShippingPostalCode(order.getShippingPostalCode());
        dto.setShippingPhone(order.getShippingPhone());
        dto.setCustomerName(order.getCustomerName());
        dto.setInsideRing(order.getInsideRing());
        dto.setShippingMethod(order.getShippingMethod());
        dto.setPaymentMethod(order.getPaymentMethod());
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
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());

        // Contar órdenes del usuario
        int orderCount = orderRepository.findByUserId(user.getId()).size();
        dto.setOrderCount(orderCount);

        return dto;
    }
}

