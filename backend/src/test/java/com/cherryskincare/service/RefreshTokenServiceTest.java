package com.cherryskincare.service;

import com.cherryskincare.model.RefreshToken;
import com.cherryskincare.model.User;
import com.cherryskincare.repository.RefreshTokenRepository;
import com.cherryskincare.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("RefreshTokenService Tests")
class RefreshTokenServiceTest {

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        refreshTokenRepository.deleteAll();

        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPhone("1234567890");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole(User.Role.USER);
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("Debería crear un refresh token para un usuario")
    void shouldCreateRefreshToken() {
        // When
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(testUser);

        // Then
        assertThat(refreshToken).isNotNull();
        assertThat(refreshToken.getId()).isNotNull();
        assertThat(refreshToken.getToken()).isNotBlank();
        assertThat(refreshToken.getUser()).isEqualTo(testUser);
        assertThat(refreshToken.getExpiryDate()).isAfter(Instant.now());
        assertThat(refreshToken.getRevoked()).isFalse();
    }

    @Test
    @DisplayName("Debería eliminar tokens anteriores al crear uno nuevo")
    void shouldDeletePreviousTokensWhenCreatingNew() {
        // Given - crear un token inicial
        RefreshToken firstToken = refreshTokenService.createRefreshToken(testUser);
        String firstTokenValue = firstToken.getToken();

        // When - crear un nuevo token
        RefreshToken secondToken = refreshTokenService.createRefreshToken(testUser);

        // Then - el primer token debería estar eliminado
        Optional<RefreshToken> foundFirst = refreshTokenRepository.findByToken(firstTokenValue);
        assertThat(foundFirst).isEmpty();
        
        // Y el nuevo token debería existir
        assertThat(secondToken).isNotNull();
        assertThat(secondToken.getToken()).isNotEqualTo(firstTokenValue);
    }

    @Test
    @DisplayName("Debería encontrar un refresh token por su valor")
    void shouldFindRefreshTokenByToken() {
        // Given
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(testUser);

        // When
        Optional<RefreshToken> found = refreshTokenService.findByToken(refreshToken.getToken());

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getToken()).isEqualTo(refreshToken.getToken());
    }

    @Test
    @DisplayName("Debería verificar que un token no expirado es válido")
    void shouldVerifyNonExpiredToken() {
        // Given
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(testUser);

        // When
        RefreshToken verified = refreshTokenService.verifyExpiration(refreshToken);

        // Then
        assertThat(verified).isNotNull();
        assertThat(verified.getToken()).isEqualTo(refreshToken.getToken());
    }

    @Test
    @DisplayName("Debería lanzar excepción para token expirado")
    void shouldThrowExceptionForExpiredToken() {
        // Given - crear un token con fecha de expiración pasada
        RefreshToken expiredToken = new RefreshToken();
        expiredToken.setToken("expired-token");
        expiredToken.setUser(testUser);
        expiredToken.setExpiryDate(Instant.now().minusSeconds(3600)); // 1 hora atrás
        expiredToken.setRevoked(false);
        RefreshToken savedExpiredToken = refreshTokenRepository.save(expiredToken);

        // When/Then
        assertThatThrownBy(() -> refreshTokenService.verifyExpiration(savedExpiredToken))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("expirado");
    }

    @Test
    @DisplayName("Debería lanzar excepción para token revocado")
    void shouldThrowExceptionForRevokedToken() {
        // Given - crear un token revocado
        RefreshToken revokedToken = refreshTokenService.createRefreshToken(testUser);
        revokedToken.setRevoked(true);
        RefreshToken savedRevokedToken = refreshTokenRepository.save(revokedToken);

        // When/Then
        assertThatThrownBy(() -> refreshTokenService.verifyExpiration(savedRevokedToken))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("revocado");
    }

    @Test
    @DisplayName("Debería revocar un token")
    void shouldRevokeToken() {
        // Given
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(testUser);
        String tokenValue = refreshToken.getToken();

        // When
        refreshTokenService.revokeToken(tokenValue);

        // Then
        Optional<RefreshToken> found = refreshTokenRepository.findByToken(tokenValue);
        assertThat(found).isPresent();
        assertThat(found.get().getRevoked()).isTrue();
    }

    @Test
    @DisplayName("Debería eliminar todos los tokens de un usuario")
    void shouldDeleteAllTokensForUser() {
        // Given - crear múltiples tokens
        refreshTokenService.createRefreshToken(testUser);
        refreshTokenService.createRefreshToken(testUser);

        // When
        refreshTokenService.deleteByUser(testUser);

        // Then
        Optional<RefreshToken> found = refreshTokenRepository.findByUser(testUser);
        assertThat(found).isEmpty();
    }
}
