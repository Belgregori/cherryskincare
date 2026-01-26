package com.cherryskincare.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @Autowired
    private MessageSource messageSource;
    
    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
    
    /**
     * Construye una respuesta de error estandarizada.
     * Usa MessageSource para obtener mensajes localizados del catálogo.
     */
    private Map<String, Object> buildErrorResponse(ErrorCode errorCode, String customMessage, HttpStatus status, HttpServletRequest request, Object... messageArgs) {
        Map<String, Object> errorResponse = new HashMap<>();
        
        // Si hay un mensaje personalizado, usarlo; sino, obtener del catálogo
        String errorMessage;
        if (customMessage != null && !customMessage.isEmpty()) {
            errorMessage = customMessage;
        } else {
            try {
                errorMessage = messageSource.getMessage(
                    errorCode.getMessageKey(), 
                    messageArgs != null ? messageArgs : new Object[]{}, 
                    errorCode.getMessageKey(), // Fallback al key si no se encuentra
                    LocaleContextHolder.getLocale()
                );
            } catch (Exception e) {
                logger.warn("No se pudo obtener mensaje para key: {}, usando mensaje por defecto", errorCode.getMessageKey());
                errorMessage = errorCode.getMessageKey();
            }
        }
        
        errorResponse.put("error", errorMessage);
        errorResponse.put("errorCode", errorCode.getCode()); // Código alfanumérico (ej: BUSINESS-001)
        errorResponse.put("errorType", errorCode.name());
        errorResponse.put("status", status.value());
        errorResponse.put("timestamp", Instant.now().toString());
        
        if (request != null) {
            errorResponse.put("path", request.getRequestURI());
            errorResponse.put("method", request.getMethod());
        }
        
        return errorResponse;
    }

    // ========== EXCEPCIONES PERSONALIZADAS ==========

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException e, HttpServletRequest request) {
        ErrorCode errorCode = e.getErrorCode();
        HttpStatus status = mapErrorCodeToHttpStatus(errorCode);
        
        MDC.put("errorCode", errorCode.getCode());
        MDC.put("errorType", errorCode.name());
        logger.warn("API Exception: {} - {}", errorCode, e.getMessage());
        MDC.clear();
        
        return ResponseEntity.status(status)
                .body(buildErrorResponse(errorCode, e.getMessage(), status, request));
    }

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleProductNotFoundException(ProductNotFoundException e, HttpServletRequest request) {
        MDC.put("errorType", "PRODUCT_NOT_FOUND");
        logger.warn("Producto no encontrado: {}", e.getMessage());
        MDC.clear();
        
        // Extraer ID del mensaje si está disponible, sino usar mensaje personalizado
        String message = e.getMessage();
        Long productId = extractIdFromMessage(message);
        if (productId != null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(buildErrorResponse(ErrorCode.PRODUCT_NOT_FOUND, null, HttpStatus.NOT_FOUND, request, productId));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildErrorResponse(ErrorCode.PRODUCT_NOT_FOUND, message, HttpStatus.NOT_FOUND, request));
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleOrderNotFoundException(OrderNotFoundException e, HttpServletRequest request) {
        MDC.put("errorType", "ORDER_NOT_FOUND");
        logger.warn("Pedido no encontrado: {}", e.getMessage());
        MDC.clear();
        
        Long orderId = extractIdFromMessage(e.getMessage());
        if (orderId != null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(buildErrorResponse(ErrorCode.ORDER_NOT_FOUND, null, HttpStatus.NOT_FOUND, request, orderId));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildErrorResponse(ErrorCode.ORDER_NOT_FOUND, e.getMessage(), HttpStatus.NOT_FOUND, request));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(UserNotFoundException e, HttpServletRequest request) {
        MDC.put("errorType", "USER_NOT_FOUND");
        logger.warn("Usuario no encontrado: {}", e.getMessage());
        MDC.clear();
        
        Long userId = extractIdFromMessage(e.getMessage());
        if (userId != null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(buildErrorResponse(ErrorCode.USER_NOT_FOUND, null, HttpStatus.NOT_FOUND, request, userId));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildErrorResponse(ErrorCode.USER_NOT_FOUND, e.getMessage(), HttpStatus.NOT_FOUND, request));
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<Map<String, Object>> handleInsufficientStockException(InsufficientStockException e, HttpServletRequest request) {
        MDC.put("errorType", "INSUFFICIENT_STOCK");
        logger.warn("Stock insuficiente: {} - IP: {}", e.getMessage(), getClientIp(request));
        MDC.clear();
        
        Map<String, Object> errorResponse;
        if (e.getProductName() != null && e.getRequested() != null && e.getAvailable() != null) {
            // Usar mensaje del catálogo con parámetros
            errorResponse = buildErrorResponse(
                ErrorCode.INSUFFICIENT_STOCK, 
                null, 
                HttpStatus.BAD_REQUEST, 
                request,
                e.getProductName(),
                e.getRequested(),
                e.getAvailable()
            );
            errorResponse.put("productName", e.getProductName());
            errorResponse.put("requested", e.getRequested());
            errorResponse.put("available", e.getAvailable());
        } else {
            errorResponse = buildErrorResponse(ErrorCode.INSUFFICIENT_STOCK, e.getMessage(), HttpStatus.BAD_REQUEST, request);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentialsException(InvalidCredentialsException e, HttpServletRequest request) {
        MDC.put("errorType", "INVALID_CREDENTIALS");
        logger.warn("Credenciales inválidas - IP: {}", getClientIp(request));
        MDC.clear();
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildErrorResponse(ErrorCode.INVALID_CREDENTIALS, e.getMessage(), HttpStatus.UNAUTHORIZED, request));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(ValidationException e, HttpServletRequest request) {
        MDC.put("errorType", "VALIDATION_ERROR");
        logger.warn("Error de validación: {} - IP: {}", e.getMessage(), getClientIp(request));
        MDC.clear();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildErrorResponse(ErrorCode.VALIDATION_ERROR, e.getMessage(), HttpStatus.BAD_REQUEST, request));
    }

    // ========== EXCEPCIONES DE VALIDACIÓN DE SPRING ==========

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        MDC.put("errorType", "VALIDATION_ERROR");
        logger.warn("Error de validación de argumentos: {} - IP: {}", ex.getMessage(), getClientIp(request));
        MDC.clear();
        
        Map<String, Object> errors = buildErrorResponse(ErrorCode.VALIDATION_ERROR, "Error de validación", HttpStatus.BAD_REQUEST, request);
        Map<String, String> fieldErrors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        
        errors.put("fields", fieldErrors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    // ========== EXCEPCIONES GENÉRICAS ==========

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e, HttpServletRequest request) {
        MDC.put("errorType", "ILLEGAL_ARGUMENT");
        logger.warn("Argumento inválido: {} - IP: {}", e.getMessage(), getClientIp(request));
        MDC.clear();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildErrorResponse(ErrorCode.INVALID_INPUT, e.getMessage(), HttpStatus.BAD_REQUEST, request));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        MDC.put("errorType", "RUNTIME_ERROR");
        MDC.put("exceptionClass", e.getClass().getSimpleName());
        logger.error("RuntimeException no manejada: {} - IP: {} - Path: {}", 
                e.getMessage(), getClientIp(request), request.getRequestURI(), e);
        MDC.clear();
        
        // No exponer detalles internos en producción
        String message = e.getMessage() != null ? e.getMessage() : "Error inesperado";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorResponse(ErrorCode.INTERNAL_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR, request));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception e, HttpServletRequest request) {
        MDC.put("errorType", "INTERNAL_ERROR");
        MDC.put("exceptionClass", e.getClass().getSimpleName());
        logger.error("Excepción no manejada: {} - IP: {} - Path: {}", 
                e.getMessage(), getClientIp(request), request.getRequestURI(), e);
        MDC.clear();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorResponse(ErrorCode.INTERNAL_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR, request));
    }
    
    /**
     * Extrae un ID numérico de un mensaje de error.
     * Útil para formatear mensajes con parámetros.
     */
    private Long extractIdFromMessage(String message) {
        if (message == null) return null;
        try {
            // Buscar patrones como "ID: 123" o "con ID: 123"
            String[] parts = message.split("ID:");
            if (parts.length > 1) {
                String idPart = parts[1].trim().split("\\s")[0];
                return Long.parseLong(idPart);
            }
            // Buscar números al final del mensaje
            String[] words = message.split("\\s");
            for (int i = words.length - 1; i >= 0; i--) {
                try {
                    return Long.parseLong(words[i].replaceAll("[^0-9]", ""));
                } catch (NumberFormatException ignored) {
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }
    
    private HttpStatus mapErrorCodeToHttpStatus(ErrorCode errorCode) {
        return switch (errorCode) {
            case INVALID_CREDENTIALS, TOKEN_EXPIRED, TOKEN_INVALID, UNAUTHORIZED -> HttpStatus.UNAUTHORIZED;
            case FORBIDDEN -> HttpStatus.FORBIDDEN;
            case VALIDATION_ERROR, INVALID_INPUT, MISSING_REQUIRED_FIELD, INVALID_FORMAT -> HttpStatus.BAD_REQUEST;
            case RESOURCE_NOT_FOUND, USER_NOT_FOUND, PRODUCT_NOT_FOUND, ORDER_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case INSUFFICIENT_STOCK, DUPLICATE_ENTRY, OPERATION_NOT_ALLOWED, RESOURCE_IN_USE -> HttpStatus.BAD_REQUEST;
            case RATE_LIMIT_EXCEEDED, ACCOUNT_LOCKED -> HttpStatus.TOO_MANY_REQUESTS;
            case FILE_TOO_LARGE, INVALID_FILE_TYPE, FILE_UPLOAD_ERROR -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}

