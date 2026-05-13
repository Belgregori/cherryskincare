package com.cherryskincare;

import com.cherryskincare.model.User;
import com.cherryskincare.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Clase principal de la aplicación Cherry Skincare.
 * 
 * Inicializa la aplicación Spring Boot y crea/actualiza el usuario administrador
 * si las variables de entorno están configuradas.
 * 
 * @author Cherry Skincare Team
 * @since 1.0.0
 */
@SpringBootApplication
public class CherrySkincareApplication implements CommandLineRunner {

	private static final Logger logger = LoggerFactory.getLogger(CherrySkincareApplication.class);

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Value("${admin.email:}")
	private String adminEmail;

	@Value("${admin.password:}")
	private String adminPassword;

	@Value("${admin.create-on-startup:false}")
	private boolean createAdminOnStartup;

	public static void main(String[] args) {
		SpringApplication.run(CherrySkincareApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// Solo crear/actualizar admin si está habilitado y las credenciales están configuradas
		if (!createAdminOnStartup) {
			logger.info("Creación de admin deshabilitada. Para habilitar, configura admin.create-on-startup=true");
			return;
		}

		if (adminEmail == null || adminEmail.trim().isEmpty()) {
			logger.warn("admin.email no configurado. El usuario admin no será creado.");
			logger.warn("Configura la variable de entorno ADMIN_EMAIL para crear el usuario admin.");
			return;
		}

		if (adminPassword == null || adminPassword.trim().isEmpty()) {
			logger.warn("admin.password no configurado. El usuario admin no será creado.");
			logger.warn("Configura la variable de entorno ADMIN_PASSWORD para crear el usuario admin.");
			return;
		}

		// Validar que la contraseña tenga al menos 8 caracteres
		if (adminPassword.length() < 8) {
			logger.error("admin.password debe tener al menos 8 caracteres. El usuario admin no será creado.");
			return;
		}

		logger.info("Verificando/creando usuario administrador: {}", adminEmail);

		userRepository.findByEmail(adminEmail).ifPresentOrElse(
			user -> {
				// Si el usuario existe, actualizar a ADMIN si no lo es
				if (user.getRole() != User.Role.ADMIN) {
					user.setRole(User.Role.ADMIN);
					userRepository.save(user);
					logger.info("Usuario {} actualizado a ADMIN", adminEmail);
				} else {
					logger.info("Usuario {} ya es ADMIN", adminEmail);
				}
				
				// Actualizar contraseña si cambió (útil para cambios de contraseña)
				if (!passwordEncoder.matches(adminPassword, user.getPassword())) {
					user.setPassword(passwordEncoder.encode(adminPassword));
					userRepository.save(user);
					logger.info("Contraseña del admin actualizada");
				}
			},
			() -> {
				// Si no existe, crear el usuario admin
				User admin = new User();
				admin.setName("Administrador");
				admin.setEmail(adminEmail.trim().toLowerCase());
				admin.setPhone("0000012340");
				admin.setPassword(passwordEncoder.encode(adminPassword));
				admin.setRole(User.Role.ADMIN);
				userRepository.save(admin);
				logger.info("Usuario admin creado exitosamente: {}", adminEmail);
				logger.warn("IMPORTANTE: Cambia la contraseña del admin después del primer inicio de sesión.");
			}
		);
	}
}
