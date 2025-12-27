package com.cherryskincare.service;

import com.cherryskincare.dto.ProductDTO;
import com.cherryskincare.model.Product;
import com.cherryskincare.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.cherryskincare.service.FileStorageService fileStorageService;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndIsActiveTrue(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return convertToDTO(product);
    }

    public List<ProductDTO> searchProducts(String searchTerm) {
        return productRepository.findByNameContainingIgnoreCase(searchTerm).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = convertToEntity(productDTO);
        product = productRepository.save(product);
        return convertToDTO(product);
    }

    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setImageUrl(productDTO.getImageUrl());
        product.setCategory(productDTO.getCategory());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setIsActive(productDTO.getIsActive());

        product = productRepository.save(product);
        return convertToDTO(product);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        product.setIsActive(false);
        productRepository.save(product);
    }

    public String uploadProductImage(Long id, MultipartFile file) throws Exception {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Si ya tiene una imagen, eliminar la anterior
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(product.getImageUrl());
            } catch (Exception e) {
                // Si falla al eliminar, continuar de todas formas
            }
        }

        // Guardar nueva imagen
        String imageUrl = fileStorageService.storeFile(file);
        product.setImageUrl(imageUrl);
        productRepository.save(product);

        return imageUrl;
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setCategory(product.getCategory());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setIsActive(product.getIsActive());
        return dto;
    }

    private Product convertToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(dto.getCategory());
        product.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0);
        product.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return product;
    }
}

