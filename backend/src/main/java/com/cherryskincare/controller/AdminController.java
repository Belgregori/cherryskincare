package com.cherryskincare.controller;

import com.cherryskincare.dto.AdminOrderDTO;
import com.cherryskincare.dto.AdminProductDTO;
import com.cherryskincare.dto.AdminUserDTO;
import com.cherryskincare.dto.CategoryDTO;
import com.cherryskincare.dto.ContactMessageDTO;
import com.cherryskincare.model.Order;
import com.cherryskincare.service.AdminService;
import com.cherryskincare.service.CategoryService;
import com.cherryskincare.service.ContactMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Administración", description = "Endpoints para gestión administrativa. Requiere rol ADMIN.")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private com.cherryskincare.service.ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ContactMessageService contactMessageService;

    // ========== GESTIÓN DE PRODUCTOS ==========

    @Operation(
            summary = "Obtener todos los productos (Admin)",
            description = "Retorna todos los productos incluyendo los inactivos. Solo para administradores."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Lista de productos obtenida exitosamente"
    )
    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        
        if (page == null && size == null) {
            return ResponseEntity.ok(adminService.getAllProducts());
        }
        
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        if (pageSize > 100) pageSize = 100;
        
        return ResponseEntity.ok(adminService.getAllProducts(pageNum, pageSize, sortBy, sortDir));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<AdminProductDTO> getProductById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.getProductById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Crear producto (Admin)",
            description = "Crea un nuevo producto en el catálogo. Solo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Producto creado exitosamente",
                    content = @Content(schema = @Schema(implementation = AdminProductDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos inválidos",
                    content = @Content
            )
    })
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

    // ========== GESTIÓN DE CATEGORÍAS ==========

    @Operation(summary = "Listar categorías (Admin)")
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    @Operation(summary = "Obtener categoría por ID (Admin)")
    @GetMapping("/categories/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(categoryService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Crear categoría (Admin)")
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody CategoryDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Actualizar categoría (Admin)")
    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        try {
            return ResponseEntity.ok(categoryService.update(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Eliminar categoría (Admin)")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Subir imagen de categoría (Admin)")
    @PostMapping("/categories/{id}/image")
    public ResponseEntity<?> uploadCategoryImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = categoryService.uploadImage(id, file);
            return ResponseEntity.ok().body(new ImageResponse(imageUrl));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ========== GESTIÓN DE ÓRDENES ==========

    @Operation(
            summary = "Obtener todas las órdenes (Admin)",
            description = "Retorna todas las órdenes del sistema. Solo para administradores."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Lista de órdenes obtenida exitosamente"
    )
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir) {
        
        if (page == null && size == null) {
            return ResponseEntity.ok(adminService.getAllOrders());
        }
        
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        if (pageSize > 100) pageSize = 100;
        
        return ResponseEntity.ok(adminService.getAllOrders(pageNum, pageSize, sortBy, sortDir));
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

    @Operation(
            summary = "Obtener todos los usuarios (Admin)",
            description = "Retorna todos los usuarios del sistema. Solo para administradores."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Lista de usuarios obtenida exitosamente"
    )
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        
        if (page == null && size == null) {
            return ResponseEntity.ok(adminService.getAllUsers());
        }
        
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        if (pageSize > 100) pageSize = 100;
        
        return ResponseEntity.ok(adminService.getAllUsers(pageNum, pageSize, sortBy, sortDir));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDTO> getUserById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.getUserById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== MENSAJES DE CONTACTO ==========

    @Operation(summary = "Listar mensajes de contacto (Admin)")
    @GetMapping("/contact-messages")
    public ResponseEntity<List<ContactMessageDTO>> getAllContactMessages() {
        return ResponseEntity.ok(contactMessageService.listAll());
    }

    @Operation(summary = "Marcar mensaje como leído/no leído (Admin)")
    @PutMapping("/contact-messages/{id}/read")
    public ResponseEntity<ContactMessageDTO> markContactMessageRead(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean read
    ) {
        return ResponseEntity.ok(contactMessageService.markRead(id, read));
    }

    // Clase interna para respuesta de imagen
    @SuppressWarnings("unused")
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

