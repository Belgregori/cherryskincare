package com.cherryskincare.exception;

public class UserNotFoundException extends RuntimeException {
    
    public UserNotFoundException(Long id) {
        super("Usuario no encontrado con ID: " + id);
    }
    
    public UserNotFoundException(String identifier) {
        super("Usuario no encontrado: " + identifier);
    }
    
    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
