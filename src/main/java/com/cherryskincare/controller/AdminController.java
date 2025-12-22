package com.cherryskincare.controller;

import com.cherryskincare.dto.AdminOrderDTO;
import com.cherryskincare.dto.AdminProductDTO;
import com.cherryskincare.dto.AdminUserDTO;
import com.cherryskincare.model.Order;
import com.cherryskincare.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private com.cherryskincare.service.ProductService productService;

    // ========== GESTIÓN DE PRODUCTOS ==========

    @GetMapping("/products")
    public ResponseEntity<List<AdminProductDTO>> getAllProducts() {
        return ResponseEntity.ok(adminService.getAllProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<AdminProductDTO> getProductById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.getProductById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/products")
    public ResponseEntity<AdminProductDTO> createProduct(@RequestBody AdminProductDTO productDTO) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(adminService.createProduct(productDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<AdminProductDTO> updateProduct(
            @PathVariable Long id,
            @RequestBody AdminProductDTO productDTO) {
        try {
            return ResponseEntity.ok(adminService.updateProduct(id, productDTO));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            adminService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/products/{id}/image")
    public ResponseEntity<?> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = productService.uploadProductImage(id, file);
            return ResponseEntity.ok().body(new ImageResponse(imageUrl));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ========== GESTIÓN DE ÓRDENES ==========

    @GetMapping("/orders")
    public ResponseEntity<List<AdminOrderDTO>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<AdminOrderDTO> getOrderById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.getOrderById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<AdminOrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(adminService.updateOrderStatus(id, orderStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== GESTIÓN DE USUARIOS ==========

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDTO> getUserById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.getUserById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Clase interna para respuesta de imagen
    private static class ImageResponse {
        private String imageUrl;

        public ImageResponse(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public String getImageUrl() {
            return imageUrl;
        }
    }
}

