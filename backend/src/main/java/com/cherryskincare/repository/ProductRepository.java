package com.cherryskincare.repository;

import com.cherryskincare.model.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    List<Product> findByIsActiveTrue();
    List<Product> findByCategoryAndIsActiveTrue(String category);
    long countByCategoryAndIsActiveTrue(String category);
    @Query("SELECT COUNT(p) FROM Product p WHERE UPPER(p.category) = UPPER(:category) AND p.isActive = true")
    long countByCategoryIgnoreCaseAndIsActiveTrue(@Param("category") String category);
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // Métodos paginados
    Page<Product> findByIsActiveTrue(Pageable pageable);
    Page<Product> findByCategoryAndIsActiveTrue(String category, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    // Método con bloqueo optimista para prevenir condiciones de carrera
    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithOptimisticLock(@Param("id") Long id);
}

