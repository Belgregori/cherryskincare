package com.cherryskincare.service;

import com.cherryskincare.exception.UserNotFoundException;
import com.cherryskincare.exception.ValidationException;
import com.cherryskincare.model.PasswordResetToken;
import com.cherryskincare.model.User;
import com.cherryskincare.repository.PasswordResetTokenRepository;
import com.cherryskincare.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${password.reset.expiration:3600000}")
    private Long tokenExpiration; // 1 hora por defecto

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    @Value("${spring.mail.enabled:false}")
    private boolean mailEnabled;

    public void requestPasswordReset(String emailOrPhone) {
        logger.info("Solicitud de recuperación de contraseña para: {}", emailOrPhone);

        User user;
        try {
            user = userService.findByEmailOrPhone(emailOrPhone);
        } catch (UserNotFoundException e) {
            // Por seguridad, no revelar si el usuario existe o no
            logger.warn("Intento de recuperación de contraseña para usuario inexistente: {}", emailOrPhone);
            return; // No lanzar excepción para no revelar información
        }

        // Invalidar tokens anteriores del usuario
        tokenRepository.markAllAsUsedByUser(user);

        // Generar nuevo token
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusMillis(tokenExpiration);

        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
        resetToken = tokenRepository.save(resetToken);

        logger.info("Token de recuperación creado para usuario ID: {}", user.getId());

        // Enviar email si está configurado
        if (mailEnabled && mailSender != null && user.getEmail() != null && !user.getEmail().equals(user.getPhone())) {
            sendPasswordResetEmail(user, token);
        } else {
            logger.warn("Email no configurado o usuario sin email válido. Token generado: {}", token);
            // En producción, esto debería enviarse por email
        }
    }

    public void resetPassword(String token, String newPassword) {
        logger.info("Intento de resetear contraseña con token");

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    logger.warn("Intento de usar token de recuperación inválido");
                    return new ValidationException("Token de recuperación inválido o expirado");
                });

        if (resetToken.isExpired()) {
            logger.warn("Intento de usar token de recuperación expirado");
            tokenRepository.delete(resetToken);
            throw new ValidationException("Token de recuperación expirado. Solicita uno nuevo.");
        }

        if (resetToken.getUsed()) {
            logger.warn("Intento de reutilizar token de recuperación");
            throw new ValidationException("Este token ya fue utilizado. Solicita uno nuevo.");
        }

        User user = resetToken.getUser();

        // Cambiar contraseña
        user.setPassword(userService.getPasswordEncoder().encode(newPassword));
        userRepository.save(user);

        // Marcar token como usado
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        logger.info("Contraseña reseteada exitosamente para usuario ID: {}", user.getId());
    }

    private void sendPasswordResetEmail(User user, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Recuperación de Contraseña - Cherry Skincare");
            message.setText(buildEmailContent(user.getName(), token));
            
            mailSender.send(message);
            logger.info("Email de recuperación enviado a: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Error al enviar email de recuperación: {}", e.getMessage());
            // No lanzar excepción, el token ya fue creado
        }
    }

    private String buildEmailContent(String userName, String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        
        return String.format(
            "Hola %s,\n\n" +
            "Has solicitado recuperar tu contraseña en Cherry Skincare.\n\n" +
            "Para crear una nueva contraseña, haz clic en el siguiente enlace:\n" +
            "%s\n\n" +
            "Este enlace expirará en 1 hora.\n\n" +
            "Si no solicitaste este cambio, ignora este email.\n\n" +
            "Saludos,\n" +
            "Equipo Cherry Skincare",
            userName != null ? userName : "Usuario",
            resetUrl
        );
    }

    @Transactional
    public void deleteExpiredTokens() {
        tokenRepository.deleteExpiredTokens(Instant.now());
    }
}
