package com.cherryskincare.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderDTO {
    private List<OrderItemDTO> orderItems;
    private String shippingAddress;
    private String shippingCity;
    private String shippingPostalCode;
    private String shippingPhone;
}

