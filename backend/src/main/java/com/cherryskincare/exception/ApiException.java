package com.cherryskincare.exception;

/**
 * Excepción base para errores de la API con código de error estandarizado.
 */
public class ApiException extends RuntimeException {
    
    private final ErrorCode errorCode;
    private final Object[] messageArgs;

    public ApiException(ErrorCode errorCode) {
        super(errorCode.getCode() + ": " + errorCode.getMessageKey());
        this.errorCode = errorCode;
        this.messageArgs = null;
    }

    public ApiException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.messageArgs = null;
    }

    public ApiException(ErrorCode errorCode, String message, Object... messageArgs) {
        super(message);
        this.errorCode = errorCode;
        this.messageArgs = messageArgs;
    }

    public ApiException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.messageArgs = null;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public Object[] getMessageArgs() {
        return messageArgs;
    }
}
