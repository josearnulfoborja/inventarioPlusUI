import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/core/models/api.model';
import { Usuario } from '@/core/models/inventario.model';

/**
 * Servicio para gestión de Usuarios
 * Maneja todas las operaciones CRUD de usuarios y autenticación
 */
@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private readonly endpoint = '/usuarios';

    constructor(private readonly apiService: ApiService) {}

    /**
     * Obtener todos los usuarios (paginado)
     * @param page Número de página
     * @param pageSize Tamaño de página
     * @param activo Filtro por estado activo
     */
    getUsuarios(
        page: number = 1,
        pageSize: number = 10,
        activo?: boolean
    ): Observable<PaginatedResponse<Usuario>> {
        const params = activo === undefined ? undefined : { activo };
        return this.apiService.getPaginated<Usuario>(
            this.endpoint,
            page,
            pageSize,
            { params: params as any }
        );
    }

    /**
     * Obtener un usuario por ID
     * @param id ID del usuario
     */
    getUsuarioById(id: number): Observable<ApiResponse<Usuario>> {
        return this.apiService.get<Usuario>(`${this.endpoint}/${id}`);
    }

    /**
     * Obtener usuario actual (perfil)
     */
    getPerfil(): Observable<ApiResponse<Usuario>> {
        return this.apiService.get<Usuario>(`${this.endpoint}/perfil`);
    }

    /**
     * Buscar usuarios por criterio
     * @param criterio Texto de búsqueda
     */
    buscarUsuarios(criterio: string): Observable<ApiResponse<Usuario[]>> {
        return this.apiService.get<Usuario[]>(`${this.endpoint}/buscar`, {
            params: { q: criterio }
        });
    }

    /**
     * Verificar disponibilidad de username
     * @param username Username a verificar
     */
    verificarUsername(username: string): Observable<ApiResponse<{ disponible: boolean }>> {
        return this.apiService.get<{ disponible: boolean }>(
            `${this.endpoint}/verificar-username/${username}`
        );
    }

    /**
     * Verificar disponibilidad de email
     * @param email Email a verificar
     */
    verificarEmail(email: string): Observable<ApiResponse<{ disponible: boolean }>> {
        return this.apiService.get<{ disponible: boolean }>(
            `${this.endpoint}/verificar-email`,
            { params: { email } }
        );
    }

    /**
     * Obtener usuarios por rol
     * @param rol Rol del usuario
     */
    getUsuariosPorRol(rol: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR'): Observable<ApiResponse<Usuario[]>> {
        return this.apiService.get<Usuario[]>(`${this.endpoint}/rol/${rol}`);
    }

    /**
     * Crear un nuevo usuario
     * @param usuario Datos del usuario
     */
    crearUsuario(usuario: Usuario): Observable<ApiResponse<Usuario>> {
        return this.apiService.post<Usuario>(this.endpoint, usuario);
    }

    /**
     * Actualizar un usuario existente
     * @param id ID del usuario
     * @param usuario Datos actualizados del usuario
     */
    actualizarUsuario(id: number, usuario: Usuario): Observable<ApiResponse<Usuario>> {
        // Remover password si está vacío
        const usuarioData = { ...usuario };
        if (!usuarioData.password) {
            delete usuarioData.password;
        }
        return this.apiService.put<Usuario>(`${this.endpoint}/${id}`, usuarioData);
    }

    /**
     * Actualizar perfil del usuario actual
     * @param usuario Datos actualizados del perfil
     */
    actualizarPerfil(usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
        return this.apiService.put<Usuario>(`${this.endpoint}/perfil`, usuario);
    }

    /**
     * Actualizar parcialmente un usuario
     * @param id ID del usuario
     * @param datos Datos parciales a actualizar
     */
    actualizarParcial(id: number, datos: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
        return this.apiService.patch<Usuario>(`${this.endpoint}/${id}`, datos);
    }

    /**
     * Cambiar contraseña del usuario
     * @param id ID del usuario
     * @param passwordActual Contraseña actual
     * @param passwordNueva Nueva contraseña
     */
    cambiarPassword(
        id: number,
        passwordActual: string,
        passwordNueva: string
    ): Observable<ApiResponse<void>> {
        return this.apiService.post<void>(`${this.endpoint}/${id}/cambiar-password`, {
            passwordActual,
            passwordNueva
        });
    }

    /**
     * Resetear contraseña de un usuario (solo admin)
     * @param id ID del usuario
     * @param nuevaPassword Nueva contraseña
     */
    resetearPassword(id: number, nuevaPassword: string): Observable<ApiResponse<void>> {
        return this.apiService.post<void>(`${this.endpoint}/${id}/resetear-password`, {
            nuevaPassword
        });
    }

    /**
     * Activar/desactivar un usuario
     * @param id ID del usuario
     * @param activo Estado activo
     */
    cambiarEstado(id: number, activo: boolean): Observable<ApiResponse<Usuario>> {
        return this.apiService.patch<Usuario>(`${this.endpoint}/${id}/estado`, { activo });
    }

    /**
     * Cambiar rol de un usuario
     * @param id ID del usuario
     * @param rol Nuevo rol
     */
    cambiarRol(
        id: number,
        rol: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR'
    ): Observable<ApiResponse<Usuario>> {
        return this.apiService.patch<Usuario>(`${this.endpoint}/${id}/rol`, { rol });
    }

    /**
     * Eliminar un usuario
     * @param id ID del usuario
     */
    eliminarUsuario(id: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`${this.endpoint}/${id}`);
    }

    /**
     * Obtener historial de actividades del usuario
     * @param id ID del usuario
     */
    getHistorialActividades(id: number): Observable<ApiResponse<any[]>> {
        return this.apiService.get<any[]>(`${this.endpoint}/${id}/actividades`);
    }

    /**
     * Exportar usuarios a Excel
     */
    exportarExcel(): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/export/excel`,
            'usuarios.xlsx'
        );
    }

    /**
     * Exportar usuarios a PDF
     */
    exportarPDF(): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/export/pdf`,
            'usuarios.pdf'
        );
    }

    /**
     * Obtener estadísticas de usuarios
     */
    getEstadisticas(): Observable<ApiResponse<{
        totalUsuarios: number;
        usuariosActivos: number;
        porRol: Record<string, number>;
        ultimosAccesos: Array<{ usuario: string; fecha: Date }>;
    }>> {
        return this.apiService.get(`${this.endpoint}/estadisticas`);
    }
}
