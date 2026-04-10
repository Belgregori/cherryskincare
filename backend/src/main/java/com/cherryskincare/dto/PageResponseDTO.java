package com.cherryskincare.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Respuesta paginada")
public class PageResponseDTO<T> {
    
    @Schema(description = "Lista de elementos en la página actual")
    private List<T> content;
    
    @Schema(description = "Número de página actual (0-indexed)")
    private int page;
    
    @Schema(description = "Tamaño de la página")
    private int size;
    
    @Schema(description = "Número total de elementos")
    private long totalElements;
    
    @Schema(description = "Número total de páginas")
    private int totalPages;
    
    @Schema(description = "Indica si hay una página siguiente")
    private boolean hasNext;
    
    @Schema(description = "Indica si hay una página anterior")
    private boolean hasPrevious;
    
    @Schema(description = "Indica si es la primera página")
    private boolean first;
    
    @Schema(description = "Indica si es la última página")
    private boolean last;

    public PageResponseDTO() {
    }

    public PageResponseDTO(List<T> content, int page, int size, long totalElements, int totalPages) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.hasNext = page < totalPages - 1;
        this.hasPrevious = page > 0;
        this.first = page == 0;
        this.last = page == totalPages - 1 || totalPages == 0;
    }

    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }

    public boolean isHasPrevious() {
        return hasPrevious;
    }

    public void setHasPrevious(boolean hasPrevious) {
        this.hasPrevious = hasPrevious;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }
}
