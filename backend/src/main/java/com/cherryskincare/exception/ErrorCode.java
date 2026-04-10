package com.cherryskincare.exception;

/**
 * Códigos de error estandarizados para la aplicación.
 * Facilita el manejo consistente de errores y la comunicación con el frontend.
 * Los códigos siguen el formato: PREFIX-XXX (ej: AUTH-001, BUSINESS-001)
 */
public enum ErrorCode {
    // Errores de autenticación
    INVALID_CREDENTIALS("AUTH-001", "error.auth.invalid_credentials"),
    TOKEN_EXPIRED("AUTH-002", "error.auth.token_expired"),
    TOKEN_INVALID("AUTH-003", "error.auth.token_invalid"),
    UNAUTHORIZED("AUTH-004", "error.auth.unauthorized"),
    FORBIDDEN("AUTH-005", "error.auth.forbidden"),
    
    // Errores de validación
    VALIDATION_ERROR("VALID-001", "error.validation.general"),
    INVALID_INPUT("VALID-002", "error.validation.invalid_input"),
    MISSING_REQUIRED_FIELD("VALID-003", "error.validation.missing_field"),
    INVALID_FORMAT("VALID-004", "error.validation.invalid_format"),
    
    // Errores de recursos
    RESOURCE_NOT_FOUND("RESOURCE-001", "error.resource.not_found"),
    USER_NOT_FOUND("RESOURCE-002", "error.user.not_found"),
    PRODUCT_NOT_FOUND("RESOURCE-003", "error.product.not_found"),
    ORDER_NOT_FOUND("RESOURCE-004", "error.order.not_found"),
    
    // Errores de negocio
    INSUFFICIENT_STOCK("BUSINESS-001", "error.business.insufficient_stock"),
    DUPLICATE_ENTRY("BUSINESS-002", "error.business.duplicate_entry"),
    OPERATION_NOT_ALLOWED("BUSINESS-003", "error.business.operation_not_allowed"),
    RESOURCE_IN_USE("BUSINESS-004", "error.business.resource_in_use"),
    
    // Errores de servidor
    INTERNAL_ERROR("SERVER-001", "error.server.internal"),
    SERVICE_UNAVAILABLE("SERVER-002", "error.server.unavailable"),
    DATABASE_ERROR("SERVER-003", "error.server.database"),
    
    // Errores de rate limiting
    RATE_LIMIT_EXCEEDED("RATE-001", "error.rate.limit_exceeded"),
    ACCOUNT_LOCKED("RATE-002", "error.rate.account_locked"),
    
    // Errores de archivos
    FILE_TOO_LARGE("FILE-001", "error.file.too_large"),
    INVALID_FILE_TYPE("FILE-002", "error.file.invalid_type"),
    FILE_UPLOAD_ERROR("FILE-003", "error.file.upload_error");

    private final String code;
    private final String messageKey;

    ErrorCode(String code, String messageKey) {
        this.code = code;
        this.messageKey = messageKey;
    }

    public String getCode() {
        return code;
    }

    public String getMessageKey() {
        return messageKey;
    }
}
