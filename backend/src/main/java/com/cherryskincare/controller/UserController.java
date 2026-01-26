package com.cherryskincare.controller;

import com.cherryskincare.dto.ChangePasswordDTO;
import com.cherryskincare.dto.UpdateUserDTO;
import com.cherryskincare.dto.UserRegistrationDTO;
import com.cherryskincare.dto.UserResponseDTO;
import com.cherryskincare.model.User;
import com.cherryskincare.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for user management operations.
 * Handles user registration, profile retrieval, updates, and password changes.
 * 
 * @author Cherry Skincare Team
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "Usuarios", description = "Endpoints para gestión de usuarios")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    /**
     * Registers a new user in the system.
     * This endpoint is public and does not require authentication.
     * 
     * @param registrationDTO User registration data
     * @return ResponseEntity with the created user data
     */
    @Operation(
            summary = "Registrar nuevo usuario",
            description = "Crea una nueva cuenta de usuario. Este endpoint es público y no requiere autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Usuario registrado exitosamente",
                    content = @Content(schema = @Schema(implementation = User.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos inválidos o email ya registrado",
                    content = @Content
            )
    })
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        logger.info("Received registration request for email/phone: {}", 
                registrationDTO.getEmail() != null ? registrationDTO.getEmail() : registrationDTO.getPhone());
        try {
            User user = userService.registerUser(registrationDTO);
            logger.info("User registered successfully with ID: {}", user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(new UserResponseDTO(user));
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Retrieves user information by ID.
     * Users can only view their own information unless they are admins.
     * 
     * @param id User ID to retrieve
     * @return ResponseEntity with user data
     */
    @Operation(
            summary = "Obtener usuario por ID",
            description = "Retorna la información de un usuario específico. Requiere autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Usuario encontrado",
                    content = @Content(schema = @Schema(implementation = User.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Usuario no encontrado",
                    content = @Content
            )
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        logger.info("Retrieving user with ID: {}", id);
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
                logger.warn("Unauthenticated request to get user ID: {}", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
            }

            User currentUser = (User) authentication.getPrincipal();
            boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
            if (!isAdmin && !currentUser.getId().equals(id)) {
                logger.warn("User {} attempted to access user {} without permission", currentUser.getId(), id);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not have permission to view this user"));
            }

            User user = userService.findById(id);
            logger.info("User retrieved successfully: ID {}", id);
            return ResponseEntity.ok(new UserResponseDTO(user));
        } catch (RuntimeException e) {
            logger.error("Error retrieving user ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Updates user information.
     * Users can only update their own information.
     * 
     * @param id User ID to update
     * @param updateUserDTO Updated user data
     * @return ResponseEntity with updated user data
     */
    @Operation(
            summary = "Actualizar usuario",
            description = "Actualiza la información de un usuario. Solo el mismo usuario puede actualizar su información."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Usuario actualizado exitosamente"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "No tienes permiso para actualizar este usuario",
                    content = @Content
            )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserDTO updateUserDTO) {
        logger.info("Updating user with ID: {}", id);
        try {
            // Verify that the authenticated user is the same being updated
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
                logger.warn("Unauthenticated request to update user ID: {}", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
            }
            
            User currentUser = (User) authentication.getPrincipal();
            if (!currentUser.getId().equals(id)) {
                logger.warn("User {} attempted to update user {} without permission", currentUser.getId(), id);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not have permission to update this user"));
            }
            
            User updatedUser = userService.updateUser(id, updateUserDTO);
            logger.info("User updated successfully: ID {}", id);
            return ResponseEntity.ok(new UserResponseDTO(updatedUser));
        } catch (RuntimeException e) {
            logger.error("Error updating user ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Changes a user's password.
     * Requires the current password for verification.
     * 
     * @param id User ID changing the password
     * @param changePasswordDTO Password change data (current and new password)
     * @return ResponseEntity with success message
     */
    @Operation(
            summary = "Cambiar contraseña",
            description = "Permite a un usuario cambiar su contraseña. Requiere la contraseña actual."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Contraseña actualizada exitosamente"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Contraseña actual incorrecta o nueva contraseña inválida",
                    content = @Content
            )
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @Valid @RequestBody ChangePasswordDTO changePasswordDTO) {
        logger.info("Changing password for user ID: {}", id);
        try {
            // Verify that the authenticated user is the same changing the password
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
                logger.warn("Unauthenticated request to change password for user ID: {}", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
            }
            
            User currentUser = (User) authentication.getPrincipal();
            if (!currentUser.getId().equals(id)) {
                logger.warn("User {} attempted to change password for user {} without permission", currentUser.getId(), id);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You do not have permission to change this user's password"));
            }
            
            userService.changePassword(id, changePasswordDTO);
            logger.info("Password changed successfully for user ID: {}", id);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (RuntimeException e) {
            logger.error("Error changing password for user ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
