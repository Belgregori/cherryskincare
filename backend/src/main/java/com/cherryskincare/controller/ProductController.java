package com.cherryskincare.controller;

import com.cherryskincare.dto.PageResponseDTO;
import com.cherryskincare.dto.ProductDTO;
import com.cherryskincare.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Productos", description = "Endpoints para gestión de productos")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Operation(
            summary = "Obtener todos los productos activos",
            description = "Retorna una lista de todos los productos que están activos en el catálogo. Soporta paginación opcional."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Lista de productos obtenida exitosamente"
    )
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        
        // Si no se proporcionan parámetros de paginación, retornar lista completa (compatibilidad hacia atrás)
        if (page == null && size == null) {
            return ResponseEntity.ok(productService.getAllProducts());
        }
        
        // Valores por defecto para paginación
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        
        // Validar tamaño máximo
        if (pageSize > 100) {
            pageSize = 100;
        }
        
        PageResponseDTO<ProductDTO> response = productService.getAllProducts(pageNum, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Obtener producto por ID",
            description = "Retorna la información detallada de un producto específico"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Producto encontrado",
                    content = @Content(schema = @Schema(implementation = ProductDTO.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Producto no encontrado",
                    content = @Content
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productService.getProductById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Obtener productos por categoría",
            description = "Retorna una lista de productos activos filtrados por categoría. Soporta paginación opcional."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Lista de productos de la categoría obtenida exitosamente"
    )
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        
        // Si no se proporcionan parámetros de paginación, retornar lista completa
        if (page == null && size == null) {
            return ResponseEntity.ok(productService.getProductsByCategory(category));
        }
        
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        
        if (pageSize > 100) {
            pageSize = 100;
        }
        
        PageResponseDTO<ProductDTO> response = productService.getProductsByCategory(category, pageNum, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Buscar productos",
            description = "Busca productos por nombre (búsqueda case-insensitive). Soporta paginación opcional."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Resultados de búsqueda obtenidos exitosamente"
    )
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        
        // Si no se proporcionan parámetros de paginación, retornar lista completa
        if (page == null && size == null) {
            return ResponseEntity.ok(productService.searchProducts(q));
        }
        
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        
        if (pageSize > 100) {
            pageSize = 100;
        }
        
        PageResponseDTO<ProductDTO> response = productService.searchProducts(q, pageNum, pageSize, sortBy, sortDir);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Crear producto",
            description = "Crea un nuevo producto en el catálogo (requiere autenticación)"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Producto creado exitosamente",
                    content = @Content(schema = @Schema(implementation = ProductDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos inválidos",
                    content = @Content
            )
    })
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(productService.createProduct(productDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(
            summary = "Subir imagen de producto",
            description = "Sube una imagen para un producto existente. Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Imagen subida exitosamente"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Producto no encontrado",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Archivo inválido o muy grande",
                    content = @Content
            )
    })
    @PostMapping("/{id}/image")
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

    @Operation(
            summary = "Actualizar producto",
            description = "Actualiza la información de un producto existente"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Producto actualizado exitosamente",
                    content = @Content(schema = @Schema(implementation = ProductDTO.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Producto no encontrado",
                    content = @Content
            )
    })
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        try {
            return ResponseEntity.ok(productService.updateProduct(id, productDTO));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Eliminar producto",
            description = "Elimina (desactiva) un producto del catálogo. El producto se marca como inactivo en lugar de eliminarse físicamente"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Producto eliminado exitosamente"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Producto no encontrado",
                    content = @Content
            )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

