package com.cherryskincare.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class CreateOrderDTO {
    @NotEmpty(message = "La orden debe tener al menos un producto")
    @Valid
    private List<OrderItemDTO> orderItems;
    
    @NotBlank(message = "La dirección de envío es obligatoria")
    private String shippingAddress;
    
    @NotBlank(message = "La ciudad es obligatoria")
    private String shippingCity;
    
    private String shippingPostalCode;
    
    private String shippingPhone;

    private String customerName;

    private Boolean insideRing;

    private String shippingMethod;

    private String paymentMethod;

    public CreateOrderDTO() {
    }

    public List<OrderItemDTO> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItemDTO> orderItems) {
        this.orderItems = orderItems;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getShippingCity() {
        return shippingCity;
    }

    public void setShippingCity(String shippingCity) {
        this.shippingCity = shippingCity;
    }

    public String getShippingPostalCode() {
        return shippingPostalCode;
    }

    public void setShippingPostalCode(String shippingPostalCode) {
        this.shippingPostalCode = shippingPostalCode;
    }

    public String getShippingPhone() {
        return shippingPhone;
    }

    public void setShippingPhone(String shippingPhone) {
        this.shippingPhone = shippingPhone;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Boolean getInsideRing() {
        return insideRing;
    }

    public void setInsideRing(Boolean insideRing) {
        this.insideRing = insideRing;
    }

    public String getShippingMethod() {
        return shippingMethod;
    }

    public void setShippingMethod(String shippingMethod) {
        this.shippingMethod = shippingMethod;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}

