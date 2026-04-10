package com.cherryskincare.service;

import com.cherryskincare.dto.ChangePasswordDTO;
import com.cherryskincare.dto.UpdateUserDTO;
import com.cherryskincare.dto.UserRegistrationDTO;
import com.cherryskincare.exception.InvalidCredentialsException;
import com.cherryskincare.exception.UserNotFoundException;
import com.cherryskincare.exception.ValidationException;
import com.cherryskincare.model.User;
import com.cherryskincare.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private String encodedPassword;

    @BeforeEach
    void setUp() {
        encodedPassword = "$2a$10$encodedPassword";
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPhone("1234567890");
        testUser.setPassword(encodedPassword);
        testUser.setRole(User.Role.USER);
    }

    @Test
    @DisplayName("Debería registrar un usuario exitosamente")
    void shouldRegisterUserSuccessfully() {
        // Given
        UserRegistrationDTO registrationDTO = new UserRegistrationDTO();
        registrationDTO.setName("New User");
        registrationDTO.setEmail("newuser@example.com");
        registrationDTO.setPhone("9876543210");
        registrationDTO.setPassword("password123");

        User savedUser = new User();
        savedUser.setId(2L);
        savedUser.setName("New User");
        savedUser.setEmail("newuser@example.com");
        savedUser.setPhone("9876543210");
        savedUser.setPassword(encodedPassword);
        savedUser.setRole(User.Role.USER);

        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // When
        User result = userService.registerUser(registrationDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("newuser@example.com");
        assertThat(result.getName()).isEqualTo("New User");
        assertThat(result.getRole()).isEqualTo(User.Role.USER);
        verify(userRepository).existsByEmail("newuser@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si el email ya existe")
    void shouldThrowExceptionWhenEmailExists() {
        // Given
        UserRegistrationDTO registrationDTO = new UserRegistrationDTO();
        registrationDTO.setName("Test User");
        registrationDTO.setEmail("test@example.com");
        registrationDTO.setPassword("password123");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> userService.registerUser(registrationDTO))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("email ya está registrado");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si falta el nombre")
    void shouldThrowExceptionWhenNameIsMissing() {
        // Given
        UserRegistrationDTO registrationDTO = new UserRegistrationDTO();
        registrationDTO.setEmail("test@example.com");
        registrationDTO.setPassword("password123");

        // When/Then
        assertThatThrownBy(() -> userService.registerUser(registrationDTO))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("nombre es obligatorio");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Debería encontrar un usuario por email")
    void shouldFindUserByEmail() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        User result = userService.findByEmail("test@example.com");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    @DisplayName("Debería lanzar excepción si el usuario no existe")
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> userService.findByEmail("notfound@example.com"))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    @DisplayName("Debería autenticar un usuario con credenciales válidas")
    void shouldAuthenticateUserWithValidCredentials() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", encodedPassword)).thenReturn(true);

        // When
        User result = userService.authenticate("test@example.com", "password123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(passwordEncoder).matches("password123", encodedPassword);
    }

    @Test
    @DisplayName("Debería lanzar excepción con credenciales inválidas")
    void shouldThrowExceptionWithInvalidCredentials() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", encodedPassword)).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> userService.authenticate("test@example.com", "wrongpassword"))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Credenciales inválidas");
    }

    @Test
    @DisplayName("Debería cambiar la contraseña exitosamente")
    void shouldChangePasswordSuccessfully() {
        // Given
        ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
        changePasswordDTO.setCurrentPassword("oldPassword");
        changePasswordDTO.setNewPassword("newPassword123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPassword", encodedPassword)).thenReturn(true);
        when(passwordEncoder.matches("newPassword123", encodedPassword)).thenReturn(false);
        when(passwordEncoder.encode("newPassword123")).thenReturn("$2a$10$newEncodedPassword");

        // When
        userService.changePassword(1L, changePasswordDTO);

        // Then
        verify(passwordEncoder).matches("oldPassword", encodedPassword);
        verify(passwordEncoder).matches("newPassword123", encodedPassword);
        verify(passwordEncoder).encode("newPassword123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si la contraseña actual es incorrecta")
    void shouldThrowExceptionWhenCurrentPasswordIsWrong() {
        // Given
        ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
        changePasswordDTO.setCurrentPassword("wrongPassword");
        changePasswordDTO.setNewPassword("newPassword123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", encodedPassword)).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> userService.changePassword(1L, changePasswordDTO))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("contraseña actual es incorrecta");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Debería lanzar excepción si la nueva contraseña es igual a la actual")
    void shouldThrowExceptionWhenNewPasswordIsSameAsCurrent() {
        // Given
        ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
        changePasswordDTO.setCurrentPassword("oldPassword");
        changePasswordDTO.setNewPassword("oldPassword");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPassword", encodedPassword)).thenReturn(true);
        when(passwordEncoder.matches("oldPassword", encodedPassword)).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> userService.changePassword(1L, changePasswordDTO))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("nueva contraseña debe ser diferente");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Debería actualizar un usuario exitosamente")
    void shouldUpdateUserSuccessfully() {
        // Given
        UpdateUserDTO updateUserDTO = new UpdateUserDTO();
        updateUserDTO.setName("Updated Name");
        updateUserDTO.setEmail("updated@example.com");
        updateUserDTO.setPhone("9999999999");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByEmail("updated@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.updateUser(1L, updateUserDTO);

        // Then
        assertThat(result).isNotNull();
        verify(userRepository).save(any(User.class));
    }
}
