package com.cherryskincare.exception;

public class ContactMessageNotFoundException extends RuntimeException {

    public ContactMessageNotFoundException(Long id) {
        super("Mensaje de contacto no encontrado con ID: " + id);
    }
}
