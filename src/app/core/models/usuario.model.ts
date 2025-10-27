/**
 * Modelo/Interfaz para Usuario basado en la estructura SQL suministrada
 */
export interface Usuario {
    id_usuario?: number;
    nombre: string;
    apellido: string;
    correo_electronico: string;
    telefono?: string;
    dui?: string; // formato: 00000000-0
    username: string;
    password?: string; // normalmente no se trae del backend en listados
    rol_id?: number; // por defecto 3 al crear
    activo?: boolean;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
}
