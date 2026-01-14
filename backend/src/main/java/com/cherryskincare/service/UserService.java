package com.cherryskincare.service;

import com.cherryskincare.dto.ChangePasswordDTO;
import com.cherryskincare.dto.UpdateUserDTO;
import com.cherryskincare.dto.UserRegistrationDTO;
import com.cherryskincare.exception.InvalidCredentialsException;
import com.cherryskincare.exception.UserNotFoundException;
import com.cherryskincare.exception.ValidationException;
import com.cherryskincare.model.User;
import com.cherryskincare.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(UserRegistrationDTO registrationDTO) {
        logger.info("Intentando registrar nuevo usuario: {}", registrationDTO.getEmail() != null ? registrationDTO.getEmail() : registrationDTO.getTelefone());
        
        // Validar que al menos email o teléfono estén presentes
        if ((registrationDTO.getEmail() == null || registrationDTO.getEmail().trim().isEmpty()) &&
            (registrationDTO.getTelefone() == null || registrationDTO.getTelefone().trim().isEmpty())) {
            logger.warn("Intento de registro sin email ni teléfono");
            throw new ValidationException("Debes proporcionar un email o teléfono");
        }

        // Validar nombre
        if (registrationDTO.getName() == null || registrationDTO.getName().trim().isEmpty()) {
            logger.warn("Intento de registro sin nombre");
            throw new ValidationException("El nombre es obligatorio");
        }

        // Si hay email, verificar que no esté duplicado
        if (registrationDTO.getEmail() != null && !registrationDTO.getEmail().trim().isEmpty()) {
            if (userRepository.existsByEmail(registrationDTO.getEmail())) {
                logger.warn("Intento de registro con email duplicado: {}", registrationDTO.getEmail());
                throw new ValidationException("El email ya está registrado");
            }
        }

        User user = new User();
        user.setName(registrationDTO.getName().trim());
        
        // Si no hay email, usar el teléfono como email (para login)
        if (registrationDTO.getEmail() == null || registrationDTO.getEmail().trim().isEmpty()) {
            user.setEmail(registrationDTO.getTelefone());
        } else {
            user.setEmail(registrationDTO.getEmail().trim().toLowerCase());
        }
        
        user.setTelefone(registrationDTO.getTelefone() != null ? registrationDTO.getTelefone() : registrationDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        user.setRole(User.Role.USER);

        User savedUser = userRepository.save(user);
        logger.info("Usuario registrado exitosamente con ID: {}", savedUser.getId());
        return savedUser;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));
    }

    public User findByEmailOrTelefone(String identifier) {
        // Intentar buscar por email primero
        Optional<User> userByEmail = userRepository.findByEmail(identifier);
        if (userByEmail.isPresent()) {
            return userByEmail.get();
        }
        
        // Si no se encuentra por email, buscar por teléfono
        return userRepository.findByTelefone(identifier)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con identificador: " + identifier));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public User authenticate(String email, String password) {
        logger.info("Intento de autenticación para: {}", email);
        
        try {
            User user = findByEmailOrTelefone(email);
            
            if (!passwordEncoder.matches(password, user.getPassword())) {
                logger.warn("Intento de autenticación fallido - contraseña incorrecta para: {}", email);
                throw new InvalidCredentialsException("Credenciales inválidas");
            }
            
            logger.info("Autenticación exitosa para usuario ID: {}, rol: {}", user.getId(), user.getRole());
            return user;
        } catch (UserNotFoundException e) {
            logger.warn("Intento de autenticación fallido - usuario no encontrado: {}", email);
            throw new InvalidCredentialsException("Credenciales inválidas");
        }
    }

    public User updateUser(Long userId, UpdateUserDTO updateUserDTO) {
        User user = findById(userId);
        
        // Validar que al menos email o teléfono estén presentes
        if ((updateUserDTO.getEmail() == null || updateUserDTO.getEmail().trim().isEmpty()) &&
            (updateUserDTO.getTelefone() == null || updateUserDTO.getTelefone().trim().isEmpty())) {
            throw new ValidationException("Debes proporcionar un email o teléfono");
        }
        
        // Si hay email y es diferente al actual, verificar que no esté duplicado
        if (updateUserDTO.getEmail() != null && !updateUserDTO.getEmail().trim().isEmpty()) {
            if (!user.getEmail().equals(updateUserDTO.getEmail())) {
                if (userRepository.existsByEmail(updateUserDTO.getEmail())) {
                    throw new ValidationException("El email ya está registrado");
                }
            }
        }
        
        user.setName(updateUserDTO.getName());
        
        // Si no hay email, usar el teléfono como email (para login)
        if (updateUserDTO.getEmail() == null || updateUserDTO.getEmail().trim().isEmpty()) {
            user.setEmail(updateUserDTO.getTelefone());
        } else {
            user.setEmail(updateUserDTO.getEmail());
        }
        
        user.setTelefone(updateUserDTO.getTelefone() != null ? updateUserDTO.getTelefone() : updateUserDTO.getEmail());
        
        return userRepository.save(user);
    }

    public void changePassword(Long userId, ChangePasswordDTO changePasswordDTO) {
        User user = findById(userId);
        
        // Verificar contraseña actual
        if (!passwordEncoder.matches(changePasswordDTO.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("La contraseña actual es incorrecta");
        }
        
        // Validar que la nueva contraseña sea diferente
        if (passwordEncoder.matches(changePasswordDTO.getNewPassword(), user.getPassword())) {
            throw new ValidationException("La nueva contraseña debe ser diferente a la actual");
        }
        
        // Actualizar contraseña
        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(user);
    }
}

