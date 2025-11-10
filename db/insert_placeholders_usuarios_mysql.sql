-- db/insert_placeholders_usuarios_mysql.sql
-- Placeholders idempotentes para la tabla `usuarios2` (ajusta columnas si tu esquema difiere)
INSERT INTO usuarios2 (id_usuario, username, nombre, apellido, email, activo)
VALUES
  (2, 'user2', 'Usuario', 'Dos', 'user2@example.com', 1),
  (3, 'user3', 'Usuario', 'Tres', 'user3@example.com', 1),
  (4, 'user4', 'Usuario', 'Cuatro', 'user4@example.com', 1),
  (5, 'user5', 'Usuario', 'Cinco', 'user5@example.com', 1),
  (6, 'user6', 'Usuario', 'Seis', 'user6@example.com', 1)
ON DUPLICATE KEY UPDATE id_usuario = id_usuario;
