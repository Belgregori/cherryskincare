package com.cherryskincare.repository;

import com.cherryskincare.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c ORDER BY c.displayOrder ASC, c.name ASC")
    List<Category> findAllOrdered();

    Optional<Category> findByName(String name);

    Optional<Category> findByNameIgnoreCase(String name);
}
