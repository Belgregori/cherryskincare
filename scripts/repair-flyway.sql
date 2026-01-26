-- Script para reparar el estado de Flyway después de eliminar V4
-- Ejecuta este script en MySQL antes de reiniciar la aplicación

USE cherry_skincare;

-- Ver el estado actual de las migraciones
SELECT version, description, type, script, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank;

-- Eliminar el registro de V4 si existe y está marcado como fallido
DELETE FROM flyway_schema_history 
WHERE version = '4' AND success = 0;

-- Si V6 ya se ejecutó pero falló, también eliminarla
DELETE FROM flyway_schema_history 
WHERE version = '6' AND success = 0;

-- Verificar el resultado
SELECT version, description, type, script, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank;
