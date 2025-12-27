package com.cherryskincare.service;

import com.cherryskincare.dto.UserRegistrationDTO;
import com.cherryskincare.model.User;
import com.cherryskincare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(UserRegistrationDTO registrationDTO) {
        // Validar que al menos email o teléfono estén presentes
        if ((registrationDTO.getEmail() == null || registrationDTO.getEmail().trim().isEmpty()) &&
            (registrationDTO.getTelefone() == null || registrationDTO.getTelefone().trim().isEmpty())) {
            throw new RuntimeException("Debes proporcionar un email o teléfono");
        }

        // Si hay email, verificar que no esté duplicado
        if (registrationDTO.getEmail() != null && !registrationDTO.getEmail().trim().isEmpty()) {
            if (userRepository.existsByEmail(registrationDTO.getEmail())) {
                throw new RuntimeException("El email ya está registrado");
            }
        }

        User user = new User();
        user.setName(registrationDTO.getName());
        
        // Si no hay email, usar el teléfono como email (para login)
        if (registrationDTO.getEmail() == null || registrationDTO.getEmail().trim().isEmpty()) {
            user.setEmail(registrationDTO.getTelefone());
        } else {
            user.setEmail(registrationDTO.getEmail());
        }
        
        user.setTelefone(registrationDTO.getTelefone() != null ? registrationDTO.getTelefone() : registrationDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        user.setRole(User.Role.USER);

        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public User findByEmailOrTelefone(String identifier) {
        // Intentar buscar por email primero
        Optional<User> userByEmail = userRepository.findByEmail(identifier);
        if (userByEmail.isPresent()) {
            return userByEmail.get();
        }
        
        // Si no se encuentra por email, buscar por teléfono
        return userRepository.findByTelefone(identifier)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public User authenticate(String email, String password) {
        User user = findByEmailOrTelefone(email);
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }
        
        return user;
    }
}

