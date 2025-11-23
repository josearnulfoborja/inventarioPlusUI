import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { Mcodigo } from '@/core/models/inventario.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class McodigosService {
  private readonly endpoint = '/mcodigos';
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly api: ApiService,
    private readonly http: HttpClient
  ) {}

  listar(grupo?: string): Observable<Mcodigo[]> {
    const url = grupo ? `${this.endpoint}?grupo=${encodeURIComponent(grupo)}` : this.endpoint;
    return this.api.get<Mcodigo[]>(url).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Mcodigo[])
    );
  }

  obtener(id: number): Observable<Mcodigo> {
    return this.api.get<Mcodigo>(`${this.endpoint}/${id}`).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Mcodigo)
    );
  }

  crear(m: Mcodigo): Observable<Mcodigo> {
    return this.api.post<Mcodigo>(this.endpoint, m).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Mcodigo)
    );
  }

  actualizar(id: number, m: Mcodigo): Observable<Mcodigo> {
    return this.api.put<Mcodigo>(`${this.endpoint}/${id}`, m).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Mcodigo)
    );
  }

  eliminar(id: number): Observable<any> {
    // Usar HttpClient directamente con responseType: 'text' para manejar respuestas de texto plano
    const url = `${this.apiUrl}${this.endpoint}/${id}`;
    return this.http.delete(url, { responseType: 'text' }).pipe(
      map((resp: string) => ({ success: true, message: resp })),
      catchError((error) => {
        console.error('Error eliminando:', error);
        throw error;
      })
    );
  }

  /** Algunos backends exponen DELETE con query param en vez de ruta */
  eliminarPorQuery(id: number): Observable<any> {
    return this.api.delete<any>(`${this.endpoint}`, { params: { id } }).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp))
    );
  }

  /** Algunos proyectos legacy usan POST para eliminar */
  eliminarPorPost(id: number): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/eliminar`, { id }).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp))
    );
  }

  /** Otra convención: /delete/{id} */
  eliminarRutaDelete(id: number): Observable<any> {
    return this.api.delete<any>(`${this.endpoint}/delete/${id}`).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp))
    );
  }
}
