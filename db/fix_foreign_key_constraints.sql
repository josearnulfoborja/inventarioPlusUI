-- Script para solucionar el problema de eliminación de equipos
-- El error indica que hay restricciones de clave foránea (foreign keys)

-- OPCIÓN 1: Ver todas las restricciones de clave foránea relacionadas con equipos
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
    REFERENCED_TABLE_NAME = 'equipos'
    AND TABLE_SCHEMA = DATABASE();

-- OPCIÓN 2: Modificar las restricciones para permitir CASCADE DELETE
-- Esto eliminará automáticamente los registros relacionados cuando se elimine un equipo

-- Ejemplo para la tabla prestamos (ajusta según tus nombres de tabla y constraint)
-- Primero elimina la constraint existente
ALTER TABLE prestamos 
DROP FOREIGN KEY fk_prestamos_equipo;  -- Reemplaza con el nombre real de tu constraint

-- Luego agrega la constraint con ON DELETE CASCADE
ALTER TABLE prestamos
ADD CONSTRAINT fk_prestamos_equipo 
FOREIGN KEY (equipo_id) 
REFERENCES equipos(id_equipo) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- OPCIÓN 3: Modificar para SET NULL en lugar de CASCADE
-- Esto establecerá NULL en lugar de eliminar los registros relacionados
ALTER TABLE prestamos 
DROP FOREIGN KEY fk_prestamos_equipo;

ALTER TABLE prestamos
ADD CONSTRAINT fk_prestamos_equipo 
FOREIGN KEY (equipo_id) 
REFERENCES equipos(id_equipo) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- OPCIÓN 4: Eliminar manualmente los registros relacionados primero
-- Antes de eliminar un equipo
DELETE FROM prestamos WHERE equipo_id = 8;  -- ID del equipo a eliminar
-- Luego eliminar el equipo
DELETE FROM equipos WHERE id_equipo = 8;

-- VERIFICACIÓN: Ver el estado de las constraints
SHOW CREATE TABLE prestamos;
