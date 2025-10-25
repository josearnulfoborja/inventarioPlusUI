import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
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
     * Mapea tanto ApiResponse como arreglo directo
     */
    listarRoles(): Observable<Rol[]> {
        return this.apiService.get<Rol[]>(this.endpoint).pipe(
            map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Rol[])
        );
    }

    /**
     * GET /roles/{id} - Obtener un rol por ID
     * @param id ID del rol
     */
    obtenerRol(id: number): Observable<Rol> {
        return this.apiService.get<Rol>(`${this.endpoint}/${id}`).pipe(
            map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Rol)
        );
    }

    /**
     * POST /roles - Crear un nuevo rol
     * @param rol Datos del rol a crear
     */
    crearRol(rol: Rol): Observable<Rol> {
        return this.apiService.post<Rol>(this.endpoint, rol).pipe(
            map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Rol)
        );
    }

    /**
     * PUT /roles/{id} - Actualizar un rol existente
     * @param id ID del rol
     * @param rol Datos actualizados del rol
     */
    actualizarRol(id: number, rol: Rol): Observable<Rol> {
        return this.apiService.put<Rol>(`${this.endpoint}/${id}`, rol).pipe(
            map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as Rol)
        );
    }

    /**
     * DELETE /roles/{id} - Eliminar un rol
     * @param id ID del rol a eliminar
     */
    eliminarRol(id: number): Observable<string> {
        return this.apiService.delete<string>(`${this.endpoint}/${id}`).pipe(
            map((resp: any) => (resp && typeof resp === 'object' && 'success' in resp ? resp.data : resp) as string)
        );
    }
}
