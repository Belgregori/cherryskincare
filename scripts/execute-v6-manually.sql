-- Script para ejecutar V6 manualmente
USE cherry_skincare;

-- Verificar estado actual
SELECT 'Estado actual de la tabla users:' AS info;
DESCRIBE users;

SELECT 'Índices actuales:' AS info;
SHOW INDEX FROM users;

-- Paso 1: Eliminar índice uk_users_telefone si existe
SET @sql = (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE users DROP INDEX uk_users_telefone',
        'SELECT "Índice uk_users_telefone no existe" AS mensaje'
    )
    FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
    AND table_name = 'users' 
    AND index_name = 'uk_users_telefone'
);

-- Paso 2: Renombrar columna
ALTER TABLE users CHANGE COLUMN telefone phone VARCHAR(255) NOT NULL;

-- Paso 3: Agregar índice único en phone
ALTER TABLE users ADD UNIQUE KEY uk_users_phone (phone);

-- Verificar resultado
SELECT 'Estado después de la migración:' AS info;
DESCRIBE users;
SHOW INDEX FROM users;
