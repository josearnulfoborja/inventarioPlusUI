export interface EvaluacionTecnica {
  idEvaluacion?: number;
  observaciones: string;
  aprobado: boolean;
  equipo: { idEquipo: number; nombre?: string };
  usuario: { idUsuario: number; nombre?: string };
}
