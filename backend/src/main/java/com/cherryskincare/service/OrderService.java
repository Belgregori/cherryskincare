package com.cherryskincare.service;

import com.cherryskincare.dto.CreateOrderDTO;
import com.cherryskincare.dto.OrderDTO;
import com.cherryskincare.dto.OrderItemDTO;
import com.cherryskincare.dto.PageResponseDTO;
import com.cherryskincare.exception.InsufficientStockException;
import com.cherryskincare.exception.OrderNotFoundException;
import com.cherryskincare.exception.ProductNotFoundException;
import com.cherryskincare.exception.UserNotFoundException;
import com.cherryskincare.exception.ValidationException;
import com.cherryskincare.model.Order;
import com.cherryskincare.model.OrderItem;
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
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    private static final int MAX_RETRY_ATTEMPTS = 3;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public OrderDTO createOrder(Long userId, CreateOrderDTO createOrderDTO) {
        logger.info("Creando nueva orden para usuario ID: {}", userId);
        
        // Validaciones de entrada
        if (createOrderDTO.getOrderItems() == null || createOrderDTO.getOrderItems().isEmpty()) {
            logger.warn("Intento de crear orden sin productos para usuario ID: {}", userId);
            throw new ValidationException("La orden debe contener al menos un producto");
        }

        if (createOrderDTO.getShippingAddress() == null || createOrderDTO.getShippingAddress().trim().isEmpty()) {
            logger.warn("Intento de crear orden sin dirección de envío para usuario ID: {}", userId);
            throw new ValidationException("La dirección de envío es obligatoria");
        }

        if (createOrderDTO.getShippingCity() == null || createOrderDTO.getShippingCity().trim().isEmpty()) {
            logger.warn("Intento de crear orden sin ciudad de envío para usuario ID: {}", userId);
            throw new ValidationException("La ciudad de envío es obligatoria");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("Usuario no encontrado al crear orden: {}", userId);
                    return new UserNotFoundException(userId);
                });

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(createOrderDTO.getShippingAddress().trim());
        order.setShippingCity(createOrderDTO.getShippingCity().trim());
        order.setShippingPostalCode(createOrderDTO.getShippingPostalCode() != null ? createOrderDTO.getShippingPostalCode().trim() : null);
        order.setShippingPhone(createOrderDTO.getShippingPhone() != null ? createOrderDTO.getShippingPhone().trim() : null);
        order.setCustomerName(createOrderDTO.getCustomerName() != null ? createOrderDTO.getCustomerName().trim() : null);
        order.setInsideRing(createOrderDTO.getInsideRing() != null ? createOrderDTO.getInsideRing() : false);
        order.setShippingMethod(createOrderDTO.getShippingMethod());
        order.setPaymentMethod(createOrderDTO.getPaymentMethod());
        order.setStatus(Order.OrderStatus.SIN_CONFIRMAR);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemDTO itemDTO : createOrderDTO.getOrderItems()) {
            // Validar cantidad
            if (itemDTO.getQuantity() == null || itemDTO.getQuantity() <= 0) {
                logger.warn("Intento de agregar producto con cantidad inválida: {}", itemDTO.getQuantity());
                throw new ValidationException("La cantidad debe ser mayor a cero");
            }

            // Procesar item con reintentos para manejar concurrencia
            OrderItem orderItem = processOrderItemWithRetry(order, itemDTO, MAX_RETRY_ATTEMPTS);
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        logger.info("Orden creada exitosamente - ID: {}, Usuario: {}, Total: ${}", 
            order.getId(), userId, totalAmount);
        
        return convertToDTO(order);
    }

    public List<OrderDTO> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PageResponseDTO<OrderDTO> getOrdersByUser(Long userId, int page, int size, String sortBy, String sortDir) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Order> orderPage = orderRepository.findByUser(user, pageable);
        
        List<OrderDTO> content = orderPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new PageResponseDTO<>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages()
        );
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return convertToDTO(order);
    }

    public OrderDTO updateOrderStatus(Long id, Order.OrderStatus status) {
        logger.info("Actualizando estado de orden ID: {} a estado: {}", id, status);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Orden no encontrada al actualizar estado: {}", id);
                    return new OrderNotFoundException(id);
                });
        
        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        order = orderRepository.save(order);
        
        logger.info("Estado de orden actualizado - ID: {}, {} -> {}", id, oldStatus, status);
        
        return convertToDTO(order);
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PageResponseDTO<OrderDTO> getAllOrders(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Order> orderPage = orderRepository.findAll(pageable);
        
        List<OrderDTO> content = orderPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new PageResponseDTO<>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages()
        );
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
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

        dto.setOrderItems(order.getOrderItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    private OrderItemDTO convertItemToDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setProductId(item.getProduct().getId());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }

    /**
     * Procesa un item de orden con reintentos para manejar condiciones de carrera.
     * Usa bloqueo optimista para prevenir ventas negativas.
     */
    private OrderItem processOrderItemWithRetry(Order order, OrderItemDTO itemDTO, int maxAttempts) {
        int attempt = 0;
        while (attempt < maxAttempts) {
            try {
                // Usar bloqueo optimista para leer el producto
                Product product = productRepository.findByIdWithOptimisticLock(itemDTO.getProductId())
                        .orElseThrow(() -> {
                            logger.error("Producto no encontrado al crear orden: {}", itemDTO.getProductId());
                            return new ProductNotFoundException(itemDTO.getProductId());
                        });

                // Validar que el producto esté activo
                if (!product.getIsActive()) {
                    logger.warn("Intento de agregar producto inactivo a orden: {}", product.getId());
                    throw new ValidationException("El producto " + product.getName() + " no está disponible");
                }

                // Validar stock (con el valor actualizado)
                if (product.getStockQuantity() < itemDTO.getQuantity()) {
                    logger.warn("Stock insuficiente para producto ID: {} (solicitado: {}, disponible: {})", 
                        product.getId(), itemDTO.getQuantity(), product.getStockQuantity());
                    throw new InsufficientStockException(product.getName(), itemDTO.getQuantity(), product.getStockQuantity());
                }

                // Crear item de orden
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(itemDTO.getQuantity());
                orderItem.setPrice(product.getPrice());
                orderItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));

                order.getOrderItems().add(orderItem);

                // Reducir stock (el bloqueo optimista detectará si hubo cambios concurrentes)
                int oldStock = product.getStockQuantity();
                product.setStockQuantity(oldStock - itemDTO.getQuantity());
                productRepository.save(product);
                
                logger.debug("Stock actualizado para producto ID: {} ({} -> {})", 
                    product.getId(), oldStock, product.getStockQuantity());
                
                return orderItem;
                
            } catch (ObjectOptimisticLockingFailureException e) {
                attempt++;
                logger.warn("Conflicto de concurrencia al procesar producto ID: {} (intento {}/{})", 
                    itemDTO.getProductId(), attempt, maxAttempts);
                
                if (attempt >= maxAttempts) {
                    logger.error("No se pudo procesar producto ID: {} después de {} intentos debido a conflictos de concurrencia", 
                        itemDTO.getProductId(), maxAttempts);
                    throw new ValidationException("No se pudo procesar el producto debido a una actualización concurrente. Por favor, intente nuevamente.");
                }
                
                // Pequeña pausa antes de reintentar
                try {
                    Thread.sleep(50 * attempt); // Backoff exponencial simple
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new ValidationException("Error al procesar la orden");
                }
            }
        }
        
        // No debería llegar aquí, pero por seguridad
        throw new ValidationException("Error al procesar el producto después de múltiples intentos");
    }
}

