-- Script para configurar el auto-incremento en la tabla equipos
-- Base de datos: MySQL

-- Paso 1: Ver la estructura actual de la tabla
DESCRIBE equipos;

-- Paso 2: Ver las llaves primarias actuales
SHOW KEYS FROM equipos WHERE Key_name = 'PRIMARY';

-- Paso 3: Eliminar la clave primaria existente (si existe)
-- IMPORTANTE: Ejecuta este comando solo si la tabla tiene una PRIMARY KEY
ALTER TABLE equipos DROP PRIMARY KEY;

-- Paso 4: Establecer id_equipo como PRIMARY KEY con AUTO_INCREMENT
ALTER TABLE equipos 
MODIFY COLUMN id_equipo BIGINT NOT NULL AUTO_INCREMENT,
ADD PRIMARY KEY (id_equipo);

-- Paso 5 (Opcional): Si quieres mantener la columna 'codigo' pero que no sea requerida
ALTER TABLE equipos 
MODIFY COLUMN codigo VARCHAR(100) NULL;

-- Verificar la estructura actualizada
DESCRIBE equipos;

-- Verificar el valor del auto_increment actual
SHOW TABLE STATUS LIKE 'equipos';

-- Paso 6 (Opcional): Si necesitas establecer el auto_increment desde un valor específico
-- Por ejemplo, si ya tienes registros y el ID más alto es 8, establécelo en 9
SELECT MAX(id_equipo) FROM equipos;
-- Luego ejecuta (reemplaza 9 con MAX(id_equipo) + 1):
-- ALTER TABLE equipos AUTO_INCREMENT = 9;
