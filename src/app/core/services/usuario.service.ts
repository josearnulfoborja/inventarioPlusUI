import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@/core/services/api.service';
import { ApiResponse, PaginatedResponse } from '@/core/models/api.model';
import { Usuario } from '@/core/models/usuario.model';

/**
 * Servicio para gestión de Usuarios (única implementación consolidada)
 */
@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private readonly endpoint = '/usuarios';

    constructor(private readonly apiService: ApiService) {}

    getUsuarios(page: number = 1, pageSize: number = 10, activo?: boolean): Observable<PaginatedResponse<Usuario>> {
        const params = activo === undefined ? undefined : { activo };
        return this.apiService.getPaginated<Usuario>(this.endpoint, page, pageSize, { params: params as any });
    }

    getUsuarioById(id: number): Observable<ApiResponse<Usuario>> {
        return this.apiService.get<Usuario>(`${this.endpoint}/${id}`);
    }

    crearUsuario(usuario: Usuario): Observable<ApiResponse<Usuario>> {
        const payload = { ...usuario, rol_id: usuario.rol_id ?? 3 };
        return this.apiService.post<Usuario>(this.endpoint, payload);
    }

    actualizarParcialUsuario(id: number, datos: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
        return this.apiService.patch<Usuario>(`${this.endpoint}/${id}`, datos);
    }

    eliminarUsuario(id: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`${this.endpoint}/${id}`);
    }

    exportarExcel(): Observable<Blob> {
        return this.apiService.downloadFile(`${this.endpoint}/export`, 'usuarios.xlsx');
    }
}
