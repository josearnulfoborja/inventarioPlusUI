-- db/insert_placeholders_clientes_mysql.sql
-- Placeholders idempotentes para la tabla `clientes`
INSERT INTO clientes (id_cliente, nombre, documento, telefono, direccion, correo)
VALUES
  (1001, 'Cliente Ejemplo 1', 'D-0001001', '770000001', 'Col Los Laureles', 'cliente1001@example.com'),
  (1002, 'Cliente Ejemplo 2', 'D-0001002', '770000002', 'Col Centro',       'cliente1002@example.com'),
  (1003, 'Cliente Ejemplo 3', 'D-0001003', '770000003', 'Av Principal',     'cliente1003@example.com'),
  (1004, 'Cliente Ejemplo 4', 'D-0001004', '770000004', 'Sector Norte',     'cliente1004@example.com'),
  (1005, 'Cliente Ejemplo 5', 'D-0001005', '770000005', 'Barrio Sur',       'cliente1005@example.com')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  documento = VALUES(documento),
  telefono = VALUES(telefono),
  direccion = VALUES(direccion),
  correo = VALUES(correo);
