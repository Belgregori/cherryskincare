package com.cherryskincare.service;

import com.cherryskincare.dto.CategoryDTO;
import com.cherryskincare.exception.CategoryNotFoundException;
import com.cherryskincare.model.Category;
import com.cherryskincare.repository.CategoryRepository;
import com.cherryskincare.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<CategoryDTO> findAll() {
        List<Category> categories = categoryRepository.findAllOrdered();
        if (logger.isDebugEnabled()) {
            logger.debug("Categorías cargadas: {}", categories.size());
        }
        return categories.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
        return toDTO(category);
    }

    @Transactional
    public CategoryDTO create(CategoryDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }
        String name = normalizeCategoryName(dto.getName());
        if (categoryRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }
        Category category = new Category();
        category.setName(name);
        category.setImageUrl(dto.getImageUrl());
        category.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        category = categoryRepository.save(category);
        return toDTO(category);
    }

    @Transactional
    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
        
        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            String newName = normalizeCategoryName(dto.getName());
            Optional<Category> other = categoryRepository.findByNameIgnoreCase(newName);
            if (other.isPresent() && !other.get().getId().equals(id)) {
                throw new IllegalArgumentException("Ya existe otra categoría con ese nombre");
            }
            String oldName = category.getName();
            category.setName(newName);
            // Actualizar productos que usaban el nombre antiguo
            var products = productRepository.findByCategory(oldName);
            products.forEach(p -> p.setCategory(newName));
            productRepository.saveAll(products);
        }
        
        if (dto.getImageUrl() != null) {
            category.setImageUrl(dto.getImageUrl());
        }
        
        if (dto.getDisplayOrder() != null) {
            category.setDisplayOrder(dto.getDisplayOrder());
        }
        
        category = categoryRepository.save(category);
        return toDTO(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
        
        long count = productRepository.countByCategoryAndIsActiveTrue(category.getName());
        if (count > 0) {
            throw new IllegalStateException("No se puede eliminar la categoría: tiene " + count + " producto(s) asociado(s)");
        }
        
        if (category.getImageUrl() != null && !category.getImageUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(category.getImageUrl());
            } catch (Exception ignored) {}
        }
        
        categoryRepository.delete(category);
    }

    public String uploadImage(Long id, MultipartFile file) throws Exception {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
        
        if (category.getImageUrl() != null && !category.getImageUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(category.getImageUrl());
            } catch (Exception ignored) {}
        }
        
        // Usar método específico para categorías que guarda en uploads/categories/
        String imageUrl = fileStorageService.storeCategoryFile(file);
        category.setImageUrl(imageUrl);
        categoryRepository.save(category);
        return imageUrl;
    }

    private CategoryDTO toDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        
        // SIEMPRE buscar imagen en el sistema de archivos, NO usar la BD
        String imageUrl = findImageByCategoryName(category.getName());
        dto.setImageUrl(imageUrl);
        dto.setDisplayOrder(category.getDisplayOrder());
        // Calcular el conteo de productos activos para esta categoría (case-insensitive)
        long productCount = productRepository.countByCategoryIgnoreCaseAndIsActiveTrue(category.getName());
        dto.setProductCount(productCount);
        return dto;
    }
    
    /**
     * Busca una imagen por nombre de categoría en el directorio uploads/images
     * SIEMPRE busca en el sistema de archivos, NO en la BD
     * Mapea nombres de categorías a nombres exactos de archivos
     */
    private String findImageByCategoryName(String categoryName) {
        if (categoryName == null || categoryName.isEmpty()) {
            return null;
        }
        
        // Mapeo directo de nombres de categorías a nombres de archivos exactos
        java.util.Map<String, String> categoryToImageMap = new java.util.HashMap<>();
        categoryToImageMap.put("MAQUILLAJE", "maquillaje.png");
        categoryToImageMap.put("SKINCARE", "skincare.png");
        categoryToImageMap.put("COMPLEMENTOS", "complementos.png");
        categoryToImageMap.put("ACCCESORIOS PARA EL PELO", "pelo.png");
        categoryToImageMap.put("NECESER Y BOLSOS", "neceser.png");
        categoryToImageMap.put("VELAS AROMATICAS", "velas.png");
        
        // Buscar en el mapa primero
        String imageFilename = categoryToImageMap.get(categoryName.toUpperCase());
        if (imageFilename == null) {
            // Si no está en el mapa, intentar normalizar y buscar
            String normalizedName = categoryName.toLowerCase()
                .replace(" ", "")
                .replace("á", "a")
                .replace("é", "e")
                .replace("í", "i")
                .replace("ó", "o")
                .replace("ú", "u")
                .replace("ñ", "n");
            
            // Mapeos normalizados
            java.util.Map<String, String> normalizedMap = new java.util.HashMap<>();
            normalizedMap.put("maquillaje", "maquillaje.png");
            normalizedMap.put("skincare", "skincare.png");
            normalizedMap.put("complementos", "complementos.png");
            normalizedMap.put("acccesoriosparaelpelo", "pelo.png");
            normalizedMap.put("accesoriosparaelpelo", "pelo.png");
            normalizedMap.put("neceserybolsos", "neceser.png");
            normalizedMap.put("velasaromaticas", "velas.png");
            
            imageFilename = normalizedMap.get(normalizedName);
        }
        
        if (imageFilename == null) {
            return null;
        }
        
        // Buscar el archivo en el sistema de archivos
        try {
            java.nio.file.Path imagesDir = java.nio.file.Paths.get("uploads/images");
            if (!java.nio.file.Files.exists(imagesDir)) {
                imagesDir = java.nio.file.Paths.get(System.getProperty("user.dir"), "backend", "uploads", "images");
            }
            
            if (!java.nio.file.Files.exists(imagesDir)) {
                System.err.println("Directorio de imágenes no encontrado: " + imagesDir);
                return null;
            }
            
            java.nio.file.Path imagePath = imagesDir.resolve(imageFilename);
            if (java.nio.file.Files.exists(imagePath)) {
                System.out.println("✅ Imagen encontrada para categoría '" + categoryName + "': " + imageFilename);
                return "/api/images/" + imageFilename;
            } else {
                System.err.println("❌ Imagen no encontrada: " + imagePath);
                // Listar archivos disponibles para debug
                try {
                    java.nio.file.Files.list(imagesDir)
                        .filter(p -> p.getFileName().toString().toLowerCase().endsWith(".png"))
                        .forEach(p -> System.out.println("  - Disponible: " + p.getFileName().toString()));
                } catch (Exception e) {
                    // Ignorar errores al listar
                }
            }
        } catch (Exception e) {
            System.err.println("Error buscando imagen para categoría '" + categoryName + "': " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }

    /**
     * Primera letra en mayúscula y el resto en minúsculas (ej. "Skincare").
     */
    private static String normalizeCategoryName(String raw) {
        if (raw == null) {
            return null;
        }
        String t = raw.trim();
        if (t.isEmpty()) {
            return t;
        }
        return t.substring(0, 1).toUpperCase(Locale.ROOT) + t.substring(1).toLowerCase(Locale.ROOT);
    }
}
