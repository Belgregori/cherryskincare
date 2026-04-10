package com.cherryskincare.exception;

public class ProductNotFoundException extends RuntimeException {
    
    public ProductNotFoundException(Long id) {
        super("Producto no encontrado con ID: " + id);
    }
    
    public ProductNotFoundException(String message) {
        super(message);
    }
}
