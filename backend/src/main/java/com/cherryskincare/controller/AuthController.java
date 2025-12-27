package com.cherryskincare.controller;

import com.cherryskincare.dto.LoginRequestDTO;
import com.cherryskincare.dto.LoginResponseDTO;
import com.cherryskincare.model.User;
import com.cherryskincare.service.JwtService;
import com.cherryskincare.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        // Autenticar usuario
        User user = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        // Generar token JWT
        String token = jwtService.generateToken(user.getEmail());

        // Crear respuesta
        LoginResponseDTO response = new LoginResponseDTO();
        response.setToken(token);
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole().name());
        response.setUserId(user.getId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("email", user.getEmail());
        userInfo.put("name", user.getName());
        userInfo.put("role", user.getRole().name());
        userInfo.put("telefone", user.getTelefone());

        return ResponseEntity.ok(userInfo);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "error", "Token no proporcionado"));
        }

        String token = authHeader.substring(7);
        
        try {
            String email = jwtService.extractEmail(token);
            boolean isValid = jwtService.validateToken(token, email);
            
            if (isValid) {
                User user = userService.findByEmail(email);
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("email", email);
                response.put("role", user.getRole().name());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body(Map.of("valid", false, "error", "Token inválido o expirado"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "error", "Token inválido"));
        }
    }
}

