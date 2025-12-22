package com.cherryskincare.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemDTO {
    private Long productId;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}

