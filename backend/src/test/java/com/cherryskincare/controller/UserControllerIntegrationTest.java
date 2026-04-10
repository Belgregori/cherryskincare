package com.cherryskincare.controller;

import com.cherryskincare.dto.ChangePasswordDTO;
import com.cherryskincare.dto.UpdateUserDTO;
import com.cherryskincare.dto.UserRegistrationDTO;
import com.cherryskincare.model.User;
import com.cherryskincare.repository.UserRepository;
import com.cherryskincare.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("UserController Integration Tests")
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    private User testUser;
    private String testToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPhone("1234567890");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole(User.Role.USER);
        testUser = userRepository.save(testUser);

        testToken = jwtService.generateToken(testUser.getEmail());
    }

    @Test
    @DisplayName("Debería registrar un nuevo usuario")
    void shouldRegisterNewUser() throws Exception {
        // Given
        UserRegistrationDTO registrationDTO = new UserRegistrationDTO();
        registrationDTO.setName("New User");
        registrationDTO.setEmail("newuser@example.com");
        registrationDTO.setPhone("9876543210");
        registrationDTO.setPassword("password123");

        // When/Then
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registrationDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("newuser@example.com"))
                .andExpect(jsonPath("$.name").value("New User"));
    }

    @Test
    @DisplayName("Debería rechazar registro con email duplicado")
    void shouldRejectRegistrationWithDuplicateEmail() throws Exception {
        // Given
        UserRegistrationDTO registrationDTO = new UserRegistrationDTO();
        registrationDTO.setName("Another User");
        registrationDTO.setEmail(testUser.getEmail()); // Email duplicado
        registrationDTO.setPhone("1111111111");
        registrationDTO.setPassword("password123");

        // When/Then
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registrationDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Debería obtener usuario por ID cuando es el mismo usuario")
    void shouldGetUserByIdWhenSameUser() throws Exception {
        // When/Then
        mockMvc.perform(get("/api/users/{id}", testUser.getId())
                        .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.email").value(testUser.getEmail()));
    }

    @Test
    @DisplayName("Debería rechazar obtener usuario de otro usuario")
    void shouldRejectGettingOtherUser() throws Exception {
        // Given - crear otro usuario
        User otherUser = new User();
        otherUser.setName("Other User");
        otherUser.setEmail("other@example.com");
        otherUser.setPhone("2222222222");
        otherUser.setPassword(passwordEncoder.encode("password123"));
        otherUser.setRole(User.Role.USER);
        otherUser = userRepository.save(otherUser);

        // When/Then
        mockMvc.perform(get("/api/users/{id}", otherUser.getId())
                        .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Debería actualizar usuario cuando es el mismo usuario")
    void shouldUpdateUserWhenSameUser() throws Exception {
        // Given
        UpdateUserDTO updateDTO = new UpdateUserDTO();
        updateDTO.setName("Updated Name");
        updateDTO.setEmail("updated@example.com");
        updateDTO.setPhone("9999999999");

        // When/Then
        mockMvc.perform(put("/api/users/{id}", testUser.getId())
                        .header("Authorization", "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.email").value("updated@example.com"));
    }

    @Test
    @DisplayName("Debería cambiar contraseña exitosamente")
    void shouldChangePasswordSuccessfully() throws Exception {
        // Given
        ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
        changePasswordDTO.setCurrentPassword("password123");
        changePasswordDTO.setNewPassword("newpassword123");

        // When/Then
        mockMvc.perform(put("/api/users/{id}/password", testUser.getId())
                        .header("Authorization", "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changePasswordDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Contraseña actualizada exitosamente"));
    }

    @Test
    @DisplayName("Debería rechazar cambio de contraseña con contraseña actual incorrecta")
    void shouldRejectPasswordChangeWithWrongCurrentPassword() throws Exception {
        // Given
        ChangePasswordDTO changePasswordDTO = new ChangePasswordDTO();
        changePasswordDTO.setCurrentPassword("wrongpassword");
        changePasswordDTO.setNewPassword("newpassword123");

        // When/Then
        mockMvc.perform(put("/api/users/{id}/password", testUser.getId())
                        .header("Authorization", "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changePasswordDTO)))
                .andExpect(status().isBadRequest());
    }
}
