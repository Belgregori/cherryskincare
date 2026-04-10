package com.cherryskincare.exception;

public class InsufficientStockException extends RuntimeException {
    
    private final String productName;
    private final Integer requested;
    private final Integer available;
    
    public InsufficientStockException(String productName, Integer requested, Integer available) {
        super(String.format("Stock insuficiente para el producto '%s'. Solicitado: %d, Disponible: %d", 
            productName, requested, available));
        this.productName = productName;
        this.requested = requested;
        this.available = available;
    }
    
    public InsufficientStockException(String message) {
        super(message);
        this.productName = null;
        this.requested = null;
        this.available = null;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public Integer getRequested() {
        return requested;
    }
    
    public Integer getAvailable() {
        return available;
    }
}
