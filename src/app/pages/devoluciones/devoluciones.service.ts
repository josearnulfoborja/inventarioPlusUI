import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesService {
  private apiUrl = 'http://localhost:8080/api/devoluciones';

  constructor(private http: HttpClient) {}

  getDevoluciones(): Observable<any[]> {
    const token = localStorage.getItem('inventarioplus_token');
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    // many backend endpoints return ApiResponse<{...}>; normalize to array
    return this.http.get<any>(this.apiUrl, { headers, withCredentials: true }).pipe(
      map((resp: any) => {
        // if ApiResponse shape: { success, data }
        if (resp == null) return [];
        if (Array.isArray(resp)) return resp;
        if (resp.data && Array.isArray(resp.data)) return resp.data;
        // try common fields
        if (resp.devoluciones && Array.isArray(resp.devoluciones)) return resp.devoluciones;
        return [];
      })
    );
  }

  crearDevolucion(payload: any): Observable<any> {
    // send as JSON; backend should accept the shape { idUsuario, idEquipo, motivo, fechaDevolucion, observaciones }
    const token = localStorage.getItem('inventarioplus_token');
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    return this.http.post<any>(this.apiUrl, payload, { headers, withCredentials: true });
  }
}
