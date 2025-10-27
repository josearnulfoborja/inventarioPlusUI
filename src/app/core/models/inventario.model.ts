/**
 * Modelo para Cliente
 */
export interface Cliente {
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad?: string;
    estado?: string;
    codigoPostal?: string;
    tipoDocumento: 'DNI' | 'RUC' | 'PASAPORTE' | 'OTRO';
    numeroDocumento: string;
    fechaRegistro?: Date;
    activo: boolean;
    notas?: string;
}

/**
 * Modelo para Equipo
 */
export interface Equipo {
    id?: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    marca: string;
    modelo: string;
    numeroSerie?: string;
    categoria: string;
    estado: 'DISPONIBLE' | 'PRESTADO' | 'MANTENIMIENTO' | 'BAJA';
    valorEstimado?: number;
    fechaAdquisicion?: Date;
    ubicacion?: string;
    imagenUrl?: string;
    activo: boolean;
}

/**
 * Modelo para Préstamo
 */
export interface Prestamo {
    id?: number;
    clienteId: number;
    cliente?: Cliente;
    equipoId: number;
    equipo?: Equipo;
    fechaPrestamo: Date;
    fechaDevolucionEstimada: Date;
    fechaDevolucionReal?: Date;
    estado: 'ACTIVO' | 'DEVUELTO' | 'VENCIDO' | 'CANCELADO';
    observaciones?: string;
    usuarioRegistroId?: number;
    garantia?: string;
    montoGarantia?: number;
    // Campos adicionales para compatibilidad con la tabla Prestamos
    condicion_al_prestar?: string;
    condicion_al_devolver?: string;
    inspeccion_requerida?: string;
    inspeccion_realizada?: string;
    especialista_asignado_id?: number;
    fecha_inspeccion_programada?: Date;
    estado_inspeccion?: string;
    observaciones_inspeccion?: string;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
}

/**
 * Modelo para Evaluación
 */
export interface Evaluacion {
    id?: number;
    prestamoId: number;
    prestamo?: Prestamo;
    equipoId: number;
    equipo?: Equipo;
    tipoEvaluacion: 'SALIDA' | 'DEVOLUCION' | 'PERIODICA';
    fechaEvaluacion: Date;
    estadoGeneral: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'MALO';
    estadoFisico?: string;
    estadoFuncional?: string;
    observaciones?: string;
    imagenes?: string[];
    evaluadorId?: number;
    requiereMantenimiento: boolean;
}

/**
 * Modelo para Usuario
 */
export interface Usuario {
    id?: number;
    username: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';
    telefono?: string;
    fechaRegistro?: Date;
    ultimoAcceso?: Date;
    activo: boolean;
    password?: string; // Solo para creación/actualización
}

/**
 * Modelo para Rol
 */
export interface Rol {
    id?: number;
    nombreRol: string;
    descripcion?: string;
}

/**
 * Modelo para Permiso (opcional para futuro)
 */
export interface Permiso {
    codigo: string;
    nombre: string;
    descripcion?: string;
    modulo: string;
}

/**
 * Modelo para Reporte
 */
export interface Reporte {
    id?: number;
    tipo: 'PRESTAMOS' | 'EQUIPOS' | 'CLIENTES' | 'EVALUACIONES' | 'GENERAL';
    nombre: string;
    descripcion?: string;
    fechaGeneracion: Date;
    fechaInicio?: Date;
    fechaFin?: Date;
    formato: 'PDF' | 'EXCEL' | 'CSV';
    usuarioGeneradorId?: number;
    parametros?: Record<string, any>;
}

/**
 * DTO para estadísticas del Dashboard
 */
export interface DashboardStats {
    totalClientes: number;
    totalEquipos: number;
    prestamosActivos: number;
    prestamosVencidos: number;
    equiposDisponibles: number;
    equiposEnMantenimiento: number;
    clientesActivos: number;
    evaluacionesPendientes: number;
}

/**
 * Filtros para búsquedas
 */
export interface ClienteFiltro {
    nombre?: string;
    email?: string;
    tipoDocumento?: string;
    activo?: boolean;
}

export interface EquipoFiltro {
    codigo?: string;
    nombre?: string;
    categoria?: string;
    estado?: string;
    activo?: boolean;
}

export interface PrestamoFiltro {
    clienteId?: number;
    equipoId?: number;
    estado?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
}

export interface EvaluacionFiltro {
    prestamoId?: number;
    equipoId?: number;
    tipoEvaluacion?: string;
    estadoGeneral?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
}
