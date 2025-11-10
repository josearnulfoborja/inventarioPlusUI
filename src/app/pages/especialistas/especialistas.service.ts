import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '@/core/services/api.service';

export interface Especialista {
  idEspecialista?: number;
  nombre: string;
  disponibilidad: boolean;
}

/**
 * Servicio para especialistas. Usa `ApiService` para soportar envoltorios ApiResponse.
 */
@Injectable({ providedIn: 'root' })
export class EspecialistasService {
  private readonly endpoint = '/especialistas';

  constructor(private readonly apiService: ApiService) {}

  getEspecialistas(): Observable<Especialista[]> {
    return this.apiService.get<Especialista[]>(this.endpoint).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Especialista[])
    );
  }

  getEspecialista(id: number): Observable<Especialista> {
    return this.apiService.get<Especialista>(`${this.endpoint}/${id}`).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Especialista)
    );
  }

  addEspecialista(especialista: Especialista): Observable<Especialista> {
    return this.apiService.post<Especialista>(this.endpoint, especialista).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Especialista)
    );
  }

  updateEspecialista(id: number, especialista: Especialista): Observable<Especialista> {
    return this.apiService.put<Especialista>(`${this.endpoint}/${id}`, especialista).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Especialista)
    );
  }

  deleteEspecialista(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp))
    );
  }
}
