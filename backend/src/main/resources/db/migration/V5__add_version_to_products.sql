-- Agregar columna version para bloqueo optimista en productos
ALTER TABLE products
ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
