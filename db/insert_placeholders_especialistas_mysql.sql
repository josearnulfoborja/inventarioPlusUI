-- db/insert_placeholders_especialistas_mysql.sql
-- Placeholders idempotentes para la tabla `especialistas`
-- Nota: el campo `disponibilidad` debe ser boolean/TINYINT(1). Usamos 1 (true) en lugar del texto 'Disponible'
INSERT INTO especialistas (id_especialista, nombre, documento, telefono, direccion, correo, disponibilidad, activo)
VALUES
  (200, 'Especialista 200', 'E-0000200', '771000200', 'Direccion X', 'especialista200@example.com', 1, 1),
  (201, 'Especialista 201', 'E-0000201', '771000201', 'Direccion Y', 'especialista201@example.com', 1, 1)
ON DUPLICATE KEY UPDATE id_especialista = id_especialista;
