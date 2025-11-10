import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Mcodigo } from '@/core/models/inventario.model';

@Injectable({ providedIn: 'root' })
export class McodigosService {
  private readonly endpoint = '/mcodigos';

  constructor(private readonly api: ApiService) {}

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
    return this.api.delete<any>(`${this.endpoint}/${id}`).pipe(
      map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp))
    );
  }
}
