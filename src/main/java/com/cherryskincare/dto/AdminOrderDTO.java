package com.cherryskincare.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdminOrderDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private List<OrderItemDTO> orderItems;
    private BigDecimal totalAmount;
    private String status;
    private String shippingAddress;
    private String shippingCity;
    private String shippingPostalCode;
    private String shippingPhone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

