package com.cherryskincare.service;

import com.cherryskincare.dto.CreateOrderDTO;
import com.cherryskincare.dto.OrderDTO;
import com.cherryskincare.dto.OrderItemDTO;
import com.cherryskincare.model.Order;
import com.cherryskincare.model.OrderItem;
import com.cherryskincare.model.Product;
import com.cherryskincare.model.User;
import com.cherryskincare.repository.OrderRepository;
import com.cherryskincare.repository.ProductRepository;
import com.cherryskincare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public OrderDTO createOrder(Long userId, CreateOrderDTO createOrderDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(createOrderDTO.getShippingAddress());
        order.setShippingCity(createOrderDTO.getShippingCity());
        order.setShippingPostalCode(createOrderDTO.getShippingPostalCode());
        order.setShippingPhone(createOrderDTO.getShippingPhone());
        order.setStatus(Order.OrderStatus.SIN_CONFIRMAR);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemDTO itemDTO : createOrderDTO.getOrderItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemDTO.getProductId()));

            if (product.getStockQuantity() < itemDTO.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));

            order.getOrderItems().add(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());

            // Reducir stock
            product.setStockQuantity(product.getStockQuantity() - itemDTO.getQuantity());
            productRepository.save(product);
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        return convertToDTO(order);
    }

    public List<OrderDTO> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        return convertToDTO(order);
    }

    public OrderDTO updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        order.setStatus(status);
        order = orderRepository.save(order);
        return convertToDTO(order);
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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
}

