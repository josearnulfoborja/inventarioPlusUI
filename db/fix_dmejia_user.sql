-- ============================================
-- Script para actualizar el usuario dmejia
-- ============================================

-- PASO 1: Verificar si el usuario existe
SELECT 'PASO 1: Verificando usuario dmejia...' AS Paso;
SELECT id_usuario, username, nombre, email, activo, rol, fecha_creacion 
FROM usuarios 
WHERE username = 'dmejia';

-- PASO 2: Actualizar la contraseña del usuario dmejia
-- Este hash BCrypt corresponde a la contraseña: "dmejia123"
SELECT 'PASO 2: Actualizando contraseña...' AS Paso;
UPDATE usuarios 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqG',
    activo = 1
WHERE username = 'dmejia';

-- PASO 3: Verificar el resultado
SELECT 'PASO 3: Verificando resultado...' AS Paso;
SELECT id_usuario, username, nombre, email, activo, rol, 
       CONCAT('Contraseña actualizada: ', LEFT(password, 20), '...') AS password_info
FROM usuarios 
WHERE username = 'dmejia';

-- ============================================
-- OPCIONES ALTERNATIVAS
-- ============================================

-- OPCIÓN A: Si quieres usar una contraseña diferente
-- Genera el hash en: https://bcrypt-generator.com/ (usa rounds: 10)
-- Luego ejecuta:
-- UPDATE usuarios SET password = 'TU_HASH_AQUI' WHERE username = 'dmejia';

-- OPCIÓN B: Otras contraseñas pre-generadas (BCrypt con rounds=10)
-- Contraseña: "12345678"
-- UPDATE usuarios SET password = '$2a$10$ZLhnHxdpHETcxmtEStgpI.Ejvzj8wvdgJu3cuS1QcJg6w6uDkfSj6' WHERE username = 'dmejia';

-- Contraseña: "admin123"
-- UPDATE usuarios SET password = '$2a$10$DYlZWLdMJL0tW4gHpOvPKeZaXqQiHHHKqX5dGJYx8qhZwB5RTSH5W' WHERE username = 'dmejia';

-- Contraseña: "password"
-- UPDATE usuarios SET password = '$2a$10$E/DqDqczPyG6PNZqGqHjveiQPXuV8GYJ0qDWGKMqWvFKFXFYPLKFG' WHERE username = 'dmejia';

-- OPCIÓN C: Si el usuario NO existe y necesitas crearlo
/*
INSERT INTO usuarios (username, password, nombre, email, activo, rol, fecha_creacion)
VALUES (
    'dmejia', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhqG', -- password: dmejia123
    'Daniel Mejía', 
    'dmejia@example.com', 
    1, 
    'ADMIN', 
    NOW()
);
*/

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================
-- 1. Ejecuta este script completo en MySQL Workbench o tu cliente SQL
-- 2. Después de ejecutar, intenta hacer login con:
--    Usuario: dmejia
--    Contraseña: dmejia123
-- 3. Si no funciona, revisa los logs del backend
-- ============================================
