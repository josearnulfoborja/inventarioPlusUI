-- Script para limpiar la tabla equipos
-- Base de datos: MySQL

-- Opción 1: ELIMINAR TODOS LOS REGISTROS Y REINICIAR AUTO_INCREMENT
-- Esto borra todos los datos y reinicia el contador a 1
TRUNCATE TABLE equipos;

-- Opción 2: ELIMINAR TODOS LOS REGISTROS SIN REINICIAR AUTO_INCREMENT
-- Esto borra los datos pero mantiene el contador donde está
-- DELETE FROM equipos;

-- Opción 3: ELIMINAR REGISTROS ESPECÍFICOS (ejemplo)
-- DELETE FROM equipos WHERE id_equipo = 8;
-- DELETE FROM equipos WHERE id_equipo IN (1, 2, 3);

-- Verificar que la tabla está vacía
SELECT COUNT(*) as total_registros FROM equipos;

-- Ver el estado de la tabla después de limpiar
SHOW TABLE STATUS LIKE 'equipos';

-- Si usaste DELETE y quieres reiniciar el AUTO_INCREMENT manualmente:
-- ALTER TABLE equipos AUTO_INCREMENT = 1;
