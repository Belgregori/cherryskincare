package com.cherryskincare;

import com.cherryskincare.model.User;
import com.cherryskincare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class CherrySkincareApplication implements CommandLineRunner {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	public static void main(String[] args) {
		SpringApplication.run(CherrySkincareApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		// Crear o actualizar usuario admin
		String adminEmail = "gregoribeleen@gmail.com";
		String adminPassword = "admin123"; // Cambia esta contraseña si es necesario

		userRepository.findByEmail(adminEmail).ifPresentOrElse(
			user -> {
				// Si el usuario existe, actualizar a ADMIN
				if (user.getRole() != User.Role.ADMIN) {
					user.setRole(User.Role.ADMIN);
					userRepository.save(user);
					System.out.println("Usuario " + adminEmail + " actualizado a ADMIN");
				} else {
					System.out.println("Usuario " + adminEmail + " ya es ADMIN");
				}
			},
			() -> {
				// Si no existe, crear el usuario admin
				User admin = new User();
				admin.setName("Administrador");
				admin.setEmail(adminEmail);
				admin.setTelefone("0000000000");
				admin.setPassword(passwordEncoder.encode(adminPassword));
				admin.setRole(User.Role.ADMIN);
				userRepository.save(admin);
				System.out.println("Usuario admin creado: " + adminEmail + " / Contraseña: " + adminPassword);
			}
		);
	}
}
