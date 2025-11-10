-- db/inserts_prestamos_especialista_opcional_mysql.sql
-- Inserciones para `prestamos` (MySQL) en modo AUTO_INCREMENT (omitimos id_prestamo)
-- Aquí el especialista sólo se incluye cuando es necesario; las columnas especialista_asignado_id e id_especialista pueden ser NULL.

INSERT INTO prestamos (
  fecha_prestamo,
  fecha_entrega,
  fecha_prevista,
  fecha_devolucion_estimada,
  fecha_devolucion_real,
  id_usuario,
  id_equipo,
  estado_prestamo,
  condicion_al_prestar,
  condicion_al_devolver,
  observaciones,
  inspeccion_requerida,
  inspeccion_realizada,
  especialista_asignado_id,
  id_especialista,
  fecha_inspeccion_programada,
  estado_inspeccion,
  observaciones_inspeccion,
  fecha_creacion,
  fecha_actualizacion,
  costo_total,
  fecha_devolucion,
  id_cliente
) VALUES
-- 1) Préstamo activo (no se requiere especialista)
('2025-11-01 09:00:00', '2025-11-01', '2025-11-07', '2025-11-07 00:00:00', NULL, 2, 10, 'ACTIVO',
 'Buen estado, sin golpes', NULL, 'Entrega urgente solicitada', 'NO', 'NO', NULL, NULL, NULL, NULL, NULL,
 '2025-11-01 09:00:00', '2025-11-01 09:00:00', 0.00, NULL, 1001),

-- 2) Préstamo devuelto (no especialista)
('2025-10-01 10:30:00', '2025-10-01', '2025-10-05', '2025-10-05 00:00:00', '2025-10-04 15:20:00', 3, 12, 'DEVUELTO',
 'Pequeñas marcas en carcasa', 'Sin daños aparentes', 'Devolución anticipada', 'NO', 'NO', NULL, NULL, NULL, NULL, NULL,
 '2025-10-01 10:30:00', '2025-10-04 15:20:00', 15.50, '2025-10-04', 1002),

-- 3) Préstamo que requiere especialista y está asignado (se incluye especialista)
('2025-09-20 08:45:00', '2025-09-20', '2025-09-27', '2025-09-27 00:00:00', NULL, 4, 15, 'ACTIVO',
 'Se entrega con batería al 80%', NULL, 'Requiere inspección antes de devolver', 'SI', 'NO', 200, 200, '2025-09-26 10:00:00', 'PENDIENTE', NULL,
 '2025-09-20 08:45:00', '2025-09-20 08:45:00', 0.00, NULL, 1003),

-- 4) Préstamo vencido (no especialista)
('2025-09-01 11:00:00', '2025-09-01', '2025-09-07', '2025-09-07 00:00:00', NULL, 5, 20, 'VENCIDO',
 'Estado perfecto', NULL, 'Cliente notificado por teléfono', 'NO', 'NO', NULL, NULL, NULL, NULL, NULL,
 '2025-09-01 11:00:00', '2025-09-08 09:20:00', 0.00, NULL, 1004),

-- 5) Préstamo con coste y especialista (incluye especialista)
('2025-08-15 14:10:00', '2025-08-15', '2025-08-20', '2025-08-20 00:00:00', '2025-08-21 10:05:00', 6, 22, 'DEVUELTO',
 'Entrega con manual y cargador', 'Pequeño golpe en esquina detectado', 'Se aplicó multa por retraso', 'NO', 'SI', 201, 201, '2025-08-21 09:00:00', 'REALIZADA', 'OK',
 '2025-08-15 14:10:00', '2025-08-21 10:05:00', 50.00, '2025-08-21', 1005);

-- Nota: si tu tabla tiene más columnas o nombres distintos, ajusta la lista de columnas arriba para que coincida exactamente con el esquema.
