package com.cherryskincare.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("JwtService Tests")
class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_SECRET = "testSecretKeyForJWTTokenGenerationInTestsOnly12345678901234567890";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "expiration", 3600000L); // 1 hora
    }

    @Test
    @DisplayName("Debería generar un token válido")
    void shouldGenerateValidToken() {
        // When
        String token = jwtService.generateToken(TEST_EMAIL);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3); // JWT tiene 3 partes: header.payload.signature
    }

    @Test
    @DisplayName("Debería extraer el email del token")
    void shouldExtractEmailFromToken() {
        // Given
        String token = jwtService.generateToken(TEST_EMAIL);

        // When
        String extractedEmail = jwtService.extractEmail(token);

        // Then
        assertThat(extractedEmail).isEqualTo(TEST_EMAIL);
    }

    @Test
    @DisplayName("Debería validar un token válido")
    void shouldValidateValidToken() {
        // Given
        String token = jwtService.generateToken(TEST_EMAIL);

        // When
        Boolean isValid = jwtService.validateToken(token, TEST_EMAIL);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Debería rechazar un token con email incorrecto")
    void shouldRejectTokenWithWrongEmail() {
        // Given
        String token = jwtService.generateToken(TEST_EMAIL);
        String wrongEmail = "wrong@example.com";

        // When
        Boolean isValid = jwtService.validateToken(token, wrongEmail);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Debería detectar un token expirado")
    void shouldDetectExpiredToken() {
        // Given - token con expiración muy corta
        ReflectionTestUtils.setField(jwtService, "expiration", 100L); // 100ms
        String token = jwtService.generateToken(TEST_EMAIL);

        // When - esperar a que expire
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then - debería lanzar excepción al intentar extraer claims
        assertThatThrownBy(() -> jwtService.isTokenExpired(token))
                .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    @DisplayName("Debería rechazar un token expirado en validación")
    void shouldRejectExpiredToken() {
        // Given - token con expiración muy corta
        ReflectionTestUtils.setField(jwtService, "expiration", 100L); // 100ms
        String token = jwtService.generateToken(TEST_EMAIL);

        // When - esperar a que expire
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then - validación debería fallar
        assertThatThrownBy(() -> jwtService.validateToken(token, TEST_EMAIL))
                .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    @DisplayName("Debería extraer la fecha de expiración del token")
    void shouldExtractExpirationDate() {
        // Given
        String token = jwtService.generateToken(TEST_EMAIL);

        // When
        Date expiration = jwtService.extractExpiration(token);

        // Then
        assertThat(expiration).isAfter(new Date());
    }

    @Test
    @DisplayName("Debería generar tokens diferentes para diferentes emails")
    void shouldGenerateDifferentTokensForDifferentEmails() {
        // When
        String token1 = jwtService.generateToken("user1@example.com");
        String token2 = jwtService.generateToken("user2@example.com");

        // Then
        assertThat(token1).isNotEqualTo(token2);
    }
}
