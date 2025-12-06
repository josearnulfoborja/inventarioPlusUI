-- DDL para tabla genérica de códigos 'mcodigos'
-- MySQL
CREATE TABLE IF NOT EXISTS mcodigos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  grupo VARCHAR(60) NOT NULL,
  codigo VARCHAR(80) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  orden INT DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_mcodigos_grupo_codigo (grupo, codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserts de ejemplo
INSERT INTO mcodigos (grupo,codigo,nombre,descripcion,orden,activo) VALUES
('EQUIPO','DISPONIBLE','Disponible','Equipo disponible para préstamo',10,1),
('EQUIPO','PRESTADO','Prestado','Equipo actualmente prestado',20,1),
('EQUIPO','MANTENIMIENTO','Mantenimiento','Equipo en mantenimiento',30,1),
('EQUIPO','BAJA','Baja','Equipo dado de baja',40,1),
('PRESTAMO','ACTIVO','Activo','Préstamo activo (entregado)',10,1),
('PRESTAMO','DEVUELTO','Devuelto','Préstamo devuelto',20,1),
('PRESTAMO','VENCIDO','Vencido','Préstamo vencido',30,1),
('PRESTAMO','ANULADO','Anulado','Préstamo anulado',40,1),
('MARCA','ACTIVA','Activa','Marca activa y disponible',10,1),
('MARCA','INACTIVA','Inactiva','Marca temporalmente inactiva',20,1),
('MARCA','EN_REVISION','En Revisión','Marca en proceso de revisión',30,1),
('INSPECCION','PENDIENTE','Pendiente','Inspección pendiente de realizar',10,1),
('INSPECCION','APROBADO','Aprobado','Inspección aprobada',20,1),
('INSPECCION','RECHAZADO','Rechazado','Inspección rechazada',30,1);

-- Nota: si usas PostgreSQL, cambia AUTO_INCREMENT por BIGSERIAL y los tipos booleanos según corresponda.
