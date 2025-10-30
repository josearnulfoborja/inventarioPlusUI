import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluacionTecnica } from '../models/evaluacion-tecnica.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionTecnicaService {
  private apiUrl = 'http://localhost:8080/api/evaluaciones';

  constructor(private http: HttpClient) {}

  getEvaluaciones(): Observable<EvaluacionTecnica[]> {
    return this.http.get<EvaluacionTecnica[]>(this.apiUrl);
  }

  getEvaluacion(id: number): Observable<EvaluacionTecnica> {
    return this.http.get<EvaluacionTecnica>(`${this.apiUrl}/${id}`);
  }

  crearEvaluacion(evaluacion: EvaluacionTecnica): Observable<EvaluacionTecnica> {
    return this.http.post<EvaluacionTecnica>(this.apiUrl, evaluacion);
  }

  actualizarEvaluacion(id: number, evaluacion: EvaluacionTecnica): Observable<EvaluacionTecnica> {
    return this.http.put<EvaluacionTecnica>(`${this.apiUrl}/${id}`, evaluacion);
  }

  eliminarEvaluacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
