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

/**
 * Service for managing user operations including registration, authentication, and profile updates.
 * 
 * @author Cherry Skincare Team
 */
@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Gets the password encoder instance.
     * 
     * @return The password encoder
     */
    public PasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }

    /**
     * Registers a new user in the system.
     * Validates that at least email or phone is provided, checks for duplicates,
     * and creates a new user with encoded password.
     * 
     * @param registrationDTO User registration data
     * @return The registered user
     * @throws ValidationException If validation fails (missing required fields, duplicate email/phone)
     */
    public User registerUser(UserRegistrationDTO registrationDTO) {
        logger.info("Attempting to register new user: {}", 
                registrationDTO.getEmail() != null ? registrationDTO.getEmail() : registrationDTO.getPhone());
        
        // Validate that at least email or phone is present
        if ((registrationDTO.getEmail() == null || registrationDTO.getEmail().trim().isEmpty()) &&
            (registrationDTO.getPhone() == null || registrationDTO.getPhone().trim().isEmpty())) {
            logger.warn("Registration attempt without email or phone");
            throw new ValidationException("You must provide an email or phone number");
        }

        // Validate name
        if (registrationDTO.getName() == null || registrationDTO.getName().trim().isEmpty()) {
            logger.warn("Registration attempt without name");
            throw new ValidationException("Name is required");
        }

        // Validate email uniqueness if present
        if (registrationDTO.getEmail() != null && !registrationDTO.getEmail().trim().isEmpty()) {
            if (userRepository.existsByEmail(registrationDTO.getEmail().trim().toLowerCase())) {
                logger.warn("Registration attempt with duplicate email: {}", registrationDTO.getEmail());
                throw new ValidationException("Email is already registered");
            }
        }

        // Validate phone uniqueness if present
        if (registrationDTO.getPhone() != null && !registrationDTO.getPhone().trim().isEmpty()) {
            if (userRepository.existsByPhone(registrationDTO.getPhone().trim())) {
                logger.warn("Registration attempt with duplicate phone: {}", registrationDTO.getPhone());
                throw new ValidationException("Phone number is already registered");
            }
        }

        User user = new User();
        user.setName(registrationDTO.getName().trim());
        
        // If no email, use phone as email (for login)
        if (registrationDTO.getEmail() == null || registrationDTO.getEmail().trim().isEmpty()) {
            // If using phone as email, verify that no other user has that phone as email
            if (userRepository.existsByEmail(registrationDTO.getPhone().trim())) {
                logger.warn("Registration attempt: phone already used as email: {}", registrationDTO.getPhone());
                throw new ValidationException("Phone number is already registered");
            }
            user.setEmail(registrationDTO.getPhone().trim());
        } else {
            user.setEmail(registrationDTO.getEmail().trim().toLowerCase());
        }
        
        user.setPhone(registrationDTO.getPhone() != null ? registrationDTO.getPhone().trim() : registrationDTO.getEmail().trim());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        user.setRole(User.Role.USER);

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully with ID: {}", savedUser.getId());
        return savedUser;
    }

    /**
     * Finds a user by email address.
     * 
     * @param email The email address to search for
     * @return The user with the specified email
     * @throws UserNotFoundException If no user is found with the given email
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));
    }

    /**
     * Finds a user by email or phone number.
     * First attempts to find by email, then by phone if not found.
     * 
     * @param identifier Email or phone number to search for
     * @return The user with the specified email or phone
     * @throws UserNotFoundException If no user is found with the given identifier
     */
    public User findByEmailOrPhone(String identifier) {
        // Try to find by email first
        Optional<User> userByEmail = userRepository.findByEmail(identifier);
        if (userByEmail.isPresent()) {
            return userByEmail.get();
        }
        
        // If not found by email, search by phone
        return userRepository.findByPhone(identifier)
                .orElseThrow(() -> new UserNotFoundException("User not found with identifier: " + identifier));
    }

    /**
     * Finds a user by ID.
     * 
     * @param id The user ID to search for
     * @return The user with the specified ID
     * @throws UserNotFoundException If no user is found with the given ID
     */
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    /**
     * Authenticates a user with email/phone and password.
     * 
     * @param email Email or phone number for authentication
     * @param password Plain text password
     * @return The authenticated user
     * @throws InvalidCredentialsException If credentials are invalid
     */
    public User authenticate(String email, String password) {
        logger.info("Authentication attempt for: {}", email);
        
        try {
            User user = findByEmailOrPhone(email);
            
            if (!passwordEncoder.matches(password, user.getPassword())) {
                logger.warn("Authentication failed - incorrect password for: {}", email);
                throw new InvalidCredentialsException("Invalid credentials");
            }
            
            logger.info("Authentication successful for user ID: {}, role: {}", user.getId(), user.getRole());
            return user;
        } catch (UserNotFoundException e) {
            logger.warn("Authentication failed - user not found: {}", email);
            throw new InvalidCredentialsException("Invalid credentials");
        }
    }

    /**
     * Updates user information.
     * Validates that at least email or phone is provided and checks for duplicates.
     * 
     * @param userId ID of the user to update
     * @param updateUserDTO Updated user data
     * @return The updated user
     * @throws ValidationException If validation fails (missing required fields, duplicate email/phone)
     * @throws UserNotFoundException If user is not found
     */
    public User updateUser(Long userId, UpdateUserDTO updateUserDTO) {
        logger.info("Updating user with ID: {}", userId);
        User user = findById(userId);
        
        // Validate that at least email or phone is present
        if ((updateUserDTO.getEmail() == null || updateUserDTO.getEmail().trim().isEmpty()) &&
            (updateUserDTO.getPhone() == null || updateUserDTO.getPhone().trim().isEmpty())) {
            logger.warn("Update attempt without email or phone for user ID: {}", userId);
            throw new ValidationException("You must provide an email or phone number");
        }
        
        // Validate email uniqueness if present and different from current
        if (updateUserDTO.getEmail() != null && !updateUserDTO.getEmail().trim().isEmpty()) {
            String newEmail = updateUserDTO.getEmail().trim().toLowerCase();
            if (!user.getEmail().equals(newEmail)) {
                if (userRepository.existsByEmail(newEmail)) {
                    logger.warn("Update attempt with duplicate email: {}", newEmail);
                    throw new ValidationException("Email is already registered");
                }
            }
        }

        // Validate phone uniqueness if present and different from current
        if (updateUserDTO.getPhone() != null && !updateUserDTO.getPhone().trim().isEmpty()) {
            String newPhone = updateUserDTO.getPhone().trim();
            if (!user.getPhone().equals(newPhone)) {
                if (userRepository.existsByPhone(newPhone)) {
                    logger.warn("Update attempt with duplicate phone: {}", newPhone);
                    throw new ValidationException("Phone number is already registered");
                }
            }
        }
        
        user.setName(updateUserDTO.getName());
        
        // If no email, use phone as email (for login)
        if (updateUserDTO.getEmail() == null || updateUserDTO.getEmail().trim().isEmpty()) {
            String phoneToUse = updateUserDTO.getPhone() != null ? updateUserDTO.getPhone().trim() : user.getPhone();
            // Verify that phone is not used as email by another user
            if (!user.getEmail().equals(phoneToUse) && userRepository.existsByEmail(phoneToUse)) {
                logger.warn("Update attempt: phone already used as email: {}", phoneToUse);
                throw new ValidationException("Phone number is already registered");
            }
            user.setEmail(phoneToUse);
        } else {
            user.setEmail(updateUserDTO.getEmail().trim().toLowerCase());
        }
        
        user.setPhone(updateUserDTO.getPhone() != null ? updateUserDTO.getPhone().trim() : 
                        (updateUserDTO.getEmail() != null && !updateUserDTO.getEmail().trim().isEmpty() ? 
                         updateUserDTO.getEmail().trim() : user.getPhone()));
        
        User updatedUser = userRepository.save(user);
        logger.info("User updated successfully with ID: {}", updatedUser.getId());
        return updatedUser;
    }

    /**
     * Changes a user's password.
     * Validates the current password and ensures the new password is different.
     * 
     * @param userId ID of the user changing the password
     * @param changePasswordDTO Password change data (current and new password)
     * @throws InvalidCredentialsException If current password is incorrect
     * @throws ValidationException If new password is the same as current password
     * @throws UserNotFoundException If user is not found
     */
    public void changePassword(Long userId, ChangePasswordDTO changePasswordDTO) {
        logger.info("Changing password for user ID: {}", userId);
        User user = findById(userId);
        
        // Verify current password
        if (!passwordEncoder.matches(changePasswordDTO.getCurrentPassword(), user.getPassword())) {
            logger.warn("Password change failed - incorrect current password for user ID: {}", userId);
            throw new InvalidCredentialsException("Current password is incorrect");
        }
        
        // Validate that new password is different
        if (passwordEncoder.matches(changePasswordDTO.getNewPassword(), user.getPassword())) {
            logger.warn("Password change failed - new password same as current for user ID: {}", userId);
            throw new ValidationException("New password must be different from current password");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(user);
        logger.info("Password changed successfully for user ID: {}", userId);
    }
}
