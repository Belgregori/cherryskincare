-- Script para actualizar el usuario gregoribeleen@gmail.com a ADMIN
-- Ejecutar este script en MySQL

USE cherry_skincare;

-- Actualizar el rol del usuario a ADMIN
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'gregoribeleen@gmail.com';

-- Verificar que se actualizó correctamente
SELECT id, name, email, role 
FROM users 
WHERE email = 'gregoribeleen@gmail.com';

