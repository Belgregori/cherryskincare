package com.cherryskincare.exception;

public class CategoryNotFoundException extends RuntimeException {

    public CategoryNotFoundException(Long id) {
        super("Categoría no encontrada con ID: " + id);
    }
}
