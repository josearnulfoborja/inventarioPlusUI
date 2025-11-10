-- db/insert_placeholders_especialistas_mysql.sql
-- Placeholders idempotentes para la tabla `especialistas`
INSERT INTO especialistas (id_especialista, nombre, documento, telefono, direccion, correo, disponibilidad, activo)
VALUES
  (200, 'Especialista 200', 'E-0000200', '771000200', 'Direccion X', 'especialista200@example.com', 'Disponible', 1),
  (201, 'Especialista 201', 'E-0000201', '771000201', 'Direccion Y', 'especialista201@example.com', 'Disponible', 1)
ON DUPLICATE KEY UPDATE id_especialista = id_especialista;
