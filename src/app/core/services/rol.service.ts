import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '@/core/models/api.model';
import { Rol } from '@/core/models/inventario.model';

/**
 * Servicio para gestión de roles
 * Mapea con los endpoints del backend Spring Boot
 */
@Injectable({
    providedIn: 'root'
})
export class RolService {
    private readonly endpoint = '/roles';

    constructor(private readonly apiService: ApiService) {}

    /**
     * GET /roles - Listar todos los roles
     */
    listarRoles(): Observable<ApiResponse<Rol[]>> {
        return this.apiService.get<Rol[]>(this.endpoint);
    }

    /**
     * GET /roles/{id} - Obtener un rol por ID
     * @param id ID del rol
     */
    obtenerRol(id: number): Observable<ApiResponse<Rol>> {
        return this.apiService.get<Rol>(`${this.endpoint}/${id}`);
    }

    /**
     * POST /roles - Crear un nuevo rol
     * @param rol Datos del rol a crear
     */
    crearRol(rol: Rol): Observable<ApiResponse<Rol>> {
        return this.apiService.post<Rol>(this.endpoint, rol);
    }

    /**
     * PUT /roles/{id} - Actualizar un rol existente
     * @param id ID del rol
     * @param rol Datos actualizados del rol
     */
    actualizarRol(id: number, rol: Rol): Observable<ApiResponse<Rol>> {
        return this.apiService.put<Rol>(`${this.endpoint}/${id}`, rol);
    }

    /**
     * DELETE /roles/{id} - Eliminar un rol
     * @param id ID del rol a eliminar
     */
    eliminarRol(id: number): Observable<ApiResponse<string>> {
        return this.apiService.delete<string>(`${this.endpoint}/${id}`);
    }
}
