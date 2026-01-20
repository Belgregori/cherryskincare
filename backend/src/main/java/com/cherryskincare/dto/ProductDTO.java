package com.cherryskincare.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Información de un producto")
public class ProductDTO {
    @Schema(description = "ID único del producto", example = "1")
    private Long id;
    
    @Schema(description = "Nombre del producto", example = "Crema Hidratante", required = true)
    private String name;
    
    @Schema(description = "Descripción detallada del producto", example = "Crema hidratante para piel seca")
    private String description;
    
    @Schema(description = "Precio del producto", example = "29.99", required = true)
    private BigDecimal price;
    
    @Schema(description = "URL de la imagen del producto", example = "/api/images/producto.jpg")
    private String imageUrl;
    
    @Schema(description = "Categoría del producto", example = "Cuidado Facial", required = true)
    private String category;
    
    @Schema(description = "Cantidad disponible en stock", example = "50")
    private Integer stockQuantity;
    
    @Schema(description = "Indica si el producto está activo y visible", example = "true")
    private Boolean isActive;

    public ProductDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

