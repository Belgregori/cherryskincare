package com.cherryskincare.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("LoginAttemptService Tests")
class LoginAttemptServiceTest {

    @Autowired
    private LoginAttemptService loginAttemptService;

    @BeforeEach
    void setUp() {
        // Configurar límites bajos para tests
        ReflectionTestUtils.setField(loginAttemptService, "maxAttempts", 3);
        ReflectionTestUtils.setField(loginAttemptService, "lockoutMinutes", 1);
    }

    @Test
    @DisplayName("Debería permitir login cuando no hay intentos previos")
    void shouldAllowLoginWithNoPreviousAttempts() {
        // When/Then
        boolean isLocked = loginAttemptService.isLocked("test@example.com");
        assertThat(isLocked).isFalse();
    }

    @Test
    @DisplayName("Debería bloquear después de múltiples intentos fallidos")
    void shouldLockAfterMultipleFailedAttempts() {
        // Given
        String identifier = "test@example.com";

        // When - registrar múltiples intentos fallidos
        for (int i = 0; i < 3; i++) {
            loginAttemptService.recordFailedAttempt(identifier);
        }

        // Then - debería estar bloqueado
        boolean isLocked = loginAttemptService.isLocked(identifier);
        assertThat(isLocked).isTrue();
    }

    @Test
    @DisplayName("Debería resetear intentos después de login exitoso")
    void shouldResetAttemptsAfterSuccessfulLogin() {
        // Given
        String identifier = "test@example.com";
        loginAttemptService.recordFailedAttempt(identifier);
        loginAttemptService.recordFailedAttempt(identifier);

        // When - login exitoso
        loginAttemptService.resetAttempts(identifier);

        // Then - no debería estar bloqueado
        boolean isLocked = loginAttemptService.isLocked(identifier);
        assertThat(isLocked).isFalse();
    }

    @Test
    @DisplayName("Debería normalizar el identificador (lowercase, trim)")
    void shouldNormalizeIdentifier() {
        // Given
        String identifier1 = "  Test@Example.com  ";
        String identifier2 = "test@example.com";

        // When
        loginAttemptService.recordFailedAttempt(identifier1);
        loginAttemptService.recordFailedAttempt(identifier1);
        loginAttemptService.recordFailedAttempt(identifier1);

        // Then - ambos deberían estar bloqueados (mismo identificador normalizado)
        assertThat(loginAttemptService.isLocked(identifier1)).isTrue();
        assertThat(loginAttemptService.isLocked(identifier2)).isTrue();
    }

    @Test
    @DisplayName("Debería manejar identificadores null o vacíos")
    void shouldHandleNullOrEmptyIdentifiers() {
        // When/Then - no debería lanzar excepción
        loginAttemptService.recordFailedAttempt(null);
        loginAttemptService.recordFailedAttempt("");
        loginAttemptService.recordFailedAttempt("   ");
        
        assertThat(loginAttemptService.isLocked(null)).isFalse();
        assertThat(loginAttemptService.isLocked("")).isFalse();
    }
}
