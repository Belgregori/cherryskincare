# Reparar Estado de Flyway

Si Flyway marca la migración V4 como fallida, necesitas reparar el estado manualmente.

## Opción 1: Usar Flyway Repair (Recomendado)

Ejecuta en MySQL:
```sql
-- Conectar a la base de datos
USE cherry_skincare;

-- Ver el estado actual de las migraciones
SELECT * FROM flyway_schema_history;

-- Si V4 está marcada como FAILED, actualizar su estado
UPDATE flyway_schema_history 
SET success = 1 
WHERE version = '4' AND success = 0;
```

## Opción 2: Eliminar y Recrear (Solo Desarrollo)

Si estás en desarrollo y puedes perder datos:

```sql
-- Eliminar todas las migraciones del historial
DELETE FROM flyway_schema_history WHERE version >= '4';

-- Luego reinicia la aplicación y Flyway ejecutará las migraciones desde V4
```

## Opción 3: Ejecutar Manualmente

Si prefieres ejecutar manualmente:

```sql
-- 1. Verificar si existe el índice
SHOW INDEX FROM users WHERE Key_name = 'uk_users_telefone';

-- 2. Si no existe, crearlo
ALTER TABLE users ADD UNIQUE KEY uk_users_telefone (telefone);

-- 3. Eliminar el índice antes de renombrar
ALTER TABLE users DROP INDEX uk_users_telefone;

-- 4. Renombrar la columna
ALTER TABLE users CHANGE COLUMN telefone phone VARCHAR(255) NOT NULL;

-- 5. Crear el nuevo índice
ALTER TABLE users ADD UNIQUE KEY uk_users_phone (phone);

-- 6. Marcar V4 y V6 como exitosas en Flyway
UPDATE flyway_schema_history SET success = 1 WHERE version IN ('4', '6');
```
