import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from 'src/app/core/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  /**
   * Try to load current logged user profile from backend
   * Many backends expose GET /api/usuarios/me — if not present caller can catch error
   */
  miPerfil(): Observable<Usuario> {
    // Try the common '/me' endpoint first, then fallback to '/perfil' if the server uses that path
    return this.http.get<Usuario>(`${this.apiUrl}/me`).pipe(
      catchError(() => this.http.get<Usuario>(`${this.apiUrl}/perfil`))
    );
  }

  /** Upload avatar image for user. Expects FormData with file under key 'file' */
  uploadAvatar(id: number, file: File) {
    const fd = new FormData();
    // Append under common keys to be compatible with different backends
    fd.append('file', file, file.name);
    fd.append('avatar', file, file.name);
    try { console.debug('[UsuariosService] uploadAvatar called', { id, fileName: file.name }); } catch (e) {}

    // Ensure Authorization header is sent if token exists, and include credentials for cookie-based sessions
    const token = localStorage.getItem('inventarioplus_token');
    let headers: any = {};
    if (token) {
      headers = { Authorization: `Bearer ${token}` };
    }

    return this.http.post(`${this.apiUrl}/${id}/avatar`, fd, { headers, withCredentials: true });
  }

  /** Save current user's profile. Many backends accept POST /api/usuarios/perfil */
  guardarPerfil(payload: any) {
    // If a token is present, send it explicitly. Also enable withCredentials so cookie-based sessions work.
    const token = localStorage.getItem('inventarioplus_token');
    let headers: any = {};
    if (token) {
      headers = { Authorization: `Bearer ${token}` };
      try { console.debug('[UsuariosService] sending Authorization header for guardarPerfil', !!token); } catch (e) {}
    }

    return this.http.post<Usuario>(`${this.apiUrl}/perfil`, payload, { headers, withCredentials: true });
  }
}
