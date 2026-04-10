-- Tabla de categorías (nombre e imagen); los productos siguen referenciando por nombre (category)
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(512),
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_categories_name (name)
);

-- Insertar categorías por defecto para compatibilidad con productos existentes
INSERT INTO categories (name, display_order, created_at) VALUES
('MAQUILLAJE', 1, NOW()),
('SKINCARE', 2, NOW()),
('COMPLEMENTOS', 3, NOW()),
('ACCCESORIOS PARA EL PELO', 4, NOW()),
('NECESER Y BOLSOS', 5, NOW()),
('VELAS AROMATICAS', 6, NOW())
ON DUPLICATE KEY UPDATE name = name;
