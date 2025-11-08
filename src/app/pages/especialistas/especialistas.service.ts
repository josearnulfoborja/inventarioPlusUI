import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Especialista {
  idEspecialista?: number;
  nombre: string;
  disponibilidad: boolean;
}

@Injectable({ providedIn: 'root' })
export class EspecialistasService {
  private apiUrl = '/api/especialistas';

  constructor(private http: HttpClient) {}

  getEspecialistas(): Observable<Especialista[]> {
    return this.http.get<Especialista[]>(this.apiUrl);
  }

  getEspecialista(id: number): Observable<Especialista> {
    return this.http.get<Especialista>(`${this.apiUrl}/${id}`);
  }

  addEspecialista(especialista: Especialista): Observable<Especialista> {
    return this.http.post<Especialista>(this.apiUrl, especialista);
  }

  updateEspecialista(id: number, especialista: Especialista): Observable<Especialista> {
    return this.http.put<Especialista>(`${this.apiUrl}/${id}`, especialista);
  }

  deleteEspecialista(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
