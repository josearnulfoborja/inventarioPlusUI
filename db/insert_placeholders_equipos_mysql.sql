-- db/insert_placeholders_equipos_mysql.sql
-- Placeholders idempotentes para la tabla `equipos`. Ajusta columnas si tu esquema las nombra distinto.
INSERT INTO equipos (id_equipo, codigo, nombre, marca, modelo, numero_serie, categoria, estado, activo)
VALUES
  (10, 'EQ-00010', 'Taladro 10', 'MarcaX', 'M-100', 'SN10010', 'Herramienta', 'DISPONIBLE', 1),
  (12, 'EQ-00012', 'Multimetro 12', 'MarcaY', 'M-200', 'SN10012', 'Medidor', 'DISPONIBLE', 1),
  (15, 'EQ-00015', 'Laptop 15', 'MarcaZ', 'M-300', 'SN10015', 'Computo', 'DISPONIBLE', 1),
  (20, 'EQ-00020', 'Compresor 20', 'MarcaA', 'M-400', 'SN10020', 'Maquinaria', 'DISPONIBLE', 1),
  (22, 'EQ-00022', 'Impresora 22', 'MarcaB', 'M-500', 'SN10022', 'Oficina', 'DISPONIBLE', 1)
ON DUPLICATE KEY UPDATE id_equipo = id_equipo;
