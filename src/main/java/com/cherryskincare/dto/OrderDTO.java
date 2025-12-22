package com.cherryskincare.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private Long userId;
    private List<OrderItemDTO> orderItems;
    private BigDecimal totalAmount;
    private String status;
    private String shippingAddress;
    private String shippingCity;
    private String shippingPostalCode;
    private String shippingPhone;
}

