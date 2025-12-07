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
  // Filename or URL of the user's avatar image (optional)
  avatar?: string;
  // Optional nested role object (some backends return this)
  rol?: any;
  // Derived display name for templates
  rolNombre?: string;
}
