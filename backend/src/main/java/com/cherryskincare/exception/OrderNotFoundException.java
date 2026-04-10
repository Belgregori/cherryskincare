package com.cherryskincare.exception;

public class OrderNotFoundException extends RuntimeException {
    
    public OrderNotFoundException(Long id) {
        super("Pedido no encontrado con ID: " + id);
    }
    
    public OrderNotFoundException(String message) {
        super(message);
    }
}
