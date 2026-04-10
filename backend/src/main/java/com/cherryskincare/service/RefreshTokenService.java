package com.cherryskincare.service;

import com.cherryskincare.exception.ApiException;
import com.cherryskincare.exception.ErrorCode;
import com.cherryskincare.model.RefreshToken;
import com.cherryskincare.model.User;
import com.cherryskincare.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class RefreshTokenService {

    private static final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class);

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtService jwtService;

    @Value("${jwt.refresh-expiration:604800000}")
    private Long refreshExpiration;

    public RefreshToken createRefreshToken(User user) {
        // Eliminar tokens anteriores del usuario
        refreshTokenRepository.findByUser(user).ifPresent(refreshTokenRepository::delete);

        // Generar nuevo refresh token
        String token = jwtService.generateRefreshToken(user.getEmail());
        Instant expiryDate = Instant.now().plusMillis(refreshExpiration);

        RefreshToken refreshToken = new RefreshToken(token, user, expiryDate);
        refreshToken = refreshTokenRepository.save(refreshToken);

        logger.info("Refresh token creado para usuario: {}", user.getEmail());
        return refreshToken;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            logger.warn("Refresh token expirado eliminado para usuario: {}", token.getUser().getEmail());
            throw new ApiException(ErrorCode.TOKEN_EXPIRED,
                    "Refresh token expirado. Por favor, inicia sesión nuevamente.");
        }

        if (token.getRevoked()) {
            logger.warn("Intento de uso de refresh token revocado para usuario: {}", token.getUser().getEmail());
            throw new ApiException(ErrorCode.TOKEN_INVALID,
                    "Refresh token revocado. Por favor, inicia sesión nuevamente.");
        }

        return token;
    }

    @Transactional
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
        logger.info("Refresh tokens eliminados para usuario: {}", user.getEmail());
    }

    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(refreshToken -> {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            logger.info("Refresh token revocado para usuario: {}", refreshToken.getUser().getEmail());
        });
    }

    @Transactional
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(Instant.now());
    }
}
