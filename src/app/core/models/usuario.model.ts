export interface Usuario {
  idUsuario?: number;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  telefono: string;
  username: string;
  password: string;
  rolId: number;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  dui?: string;
}
