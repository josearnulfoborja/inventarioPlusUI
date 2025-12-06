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
    tipoDocumento: 'DUI' | 'RUC' | 'PASAPORTE' | 'OTRO';
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
    /**
     * Campo de estado (compatibilidad hacia atrás con código textual)
     */
    estado: 'DISPONIBLE' | 'PRESTADO' | 'MANTENIMIENTO' | 'BAJA' | string;
    /**
     * Nuevo: id del mcodigo para el estado (grupo 'EQUIPO').
     * Preferir este campo al guardar/editar. Mantener 'estado' como respaldo.
     */
    estadoId?: number | null;
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
    idPrestamo: number;
    fechaPrestamo?: string;
    fechaEntrega: string;
    fechaDevolucion: string;
    fechaPrevista: string;
    costoTotal: number;
    /**
     * Campo de estado (compatibilidad hacia atrás con código textual)
     */
    estadoPrestamo: string | null;
    /**
     * Nuevo: id del mcodigo para el estado de préstamo (grupo 'PRESTAMO').
     * Preferir este campo al guardar/editar.
     */
    estadoPrestamoId?: number | null;
    cliente: Cliente;
    equipo: Equipo;
    especialista: Especialista;
}

export interface Cliente {
    idCliente: number;
    nombre: string;
    apellido: string;
    // ...otros campos relevantes
}

export interface Equipo {
    idEquipo: number;
    nombre: string;
    // ...otros campos relevantes
}

export interface Especialista {
    idEspecialista: number;
    nombre: string;
    // ...otros campos relevantes
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
    idRol?: number; // Propiedad usada por el backend
    nombreRol: string;
    /** posibles nombres alternativos que algunos backends devuelven */
    nombre?: string;
    name?: string;
    descripcion?: string | null;
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

/**
 * Catalog/lookup types for Equipos
 */
export interface EstadoEquipo {
    id?: number;
    codigo: string; // e.g. 'DISPONIBLE'
    nombre: string; // e.g. 'Disponible'
    descripcion?: string;
    activo?: boolean;
}

export interface TipoEquipo {
    id?: number;
    codigo?: string;
    nombre: string; // e.g. 'Herramienta'
    descripcion?: string;
    activo?: boolean;
}

export interface Modelo {
    id?: number;
    codigo?: string;
    nombre: string; // e.g. 'GBH 2-26'
    marca?: string | number; // Puede ser string (nombre) o number (ID) dependiendo del contexto
    marcaId?: number; // ID de la marca (requerido por el backend)
    descripcion?: string;
    activo?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

/**
 * Modelo para Marca
 */
export interface Marca {
    id?: number;
    nombre: string;
    activo?: boolean;
    descripcion?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

/**
 * Modelo genérico para códigos maestros (mcodigos)
 * Se usa como tabla unificada para estados, marcas simples, tipos, etc.
 */
export interface Mcodigo {
    id?: number;
    grupo: string;    // e.g. 'EQUIPO' | 'PRESTAMO' | 'MARCA' | 'TIPO_EQUIPO'
    codigo: string;   // e.g. 'DISPONIBLE', 'ACTIVO', 'BOSCH'
    nombre: string;   // e.g. 'Disponible', 'Activo', 'Bosch'
    descripcion?: string;
    orden?: number;
    activo?: boolean;
}

export interface Ubicacion {
    id?: number;
    codigo?: string;
    nombre: string; // e.g. 'Bodega A'
    tipo?: string; // 'Bodega'|'Oficina'|'Obra' etc.
    direccion?: string;
    piso?: string;
    sector?: string;
    lat?: number;
    lng?: number;
    responsable?: string;
    telefono?: string;
    descripcion?: string;
    activo?: boolean;
    /** timestamps manejados por backend; enviar createdAt si es requerido not-null */
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
