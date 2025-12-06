import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/core/models/api.model';
import { Equipo, EquipoFiltro } from '@/core/models/inventario.model';

/**
 * Servicio para gestión de Equipos
 * Maneja todas las operaciones CRUD de equipos
 */
@Injectable({
    providedIn: 'root'
})
export class EquipoService {
    private readonly endpoint = '/equipos';

    constructor(private readonly apiService: ApiService) {}

    /**
     * Obtener todos los equipos (paginado)
     * @param page Número de página
     * @param pageSize Tamaño de página
     * @param filtros Filtros de búsqueda
     */
    getEquipos(
        page: number = 1,
        pageSize: number = 10,
        filtros?: EquipoFiltro
    ): Observable<PaginatedResponse<Equipo>> {
        return this.apiService.getPaginated<Equipo>(
            this.endpoint,
            page,
            pageSize,
            { params: filtros as any }
        ).pipe(
            map(response => {
                // Extraer IDs de las relaciones @ManyToOne que vienen como objetos
                if (response.data) {
                    const equipos = Array.isArray(response.data) ? response.data : 
                                  (response.data as any).items || (response.data as any).content || [];
                    
                    equipos.forEach((equipo: any) => {
                        // Extraer marca_id si viene como objeto
                        if (equipo.marca && typeof equipo.marca === 'object' && equipo.marca.id) {
                            equipo.marca_id = equipo.marca.id;
                            equipo.marcaId = equipo.marca.id;
                        }
                        // Extraer modelo_id si viene como objeto
                        if (equipo.modelo && typeof equipo.modelo === 'object' && equipo.modelo.id) {
                            equipo.modelo_id = equipo.modelo.id;
                            equipo.modeloId = equipo.modelo.id;
                        }
                        // Extraer tipo_id si viene como objeto
                        if (equipo.tipo && typeof equipo.tipo === 'object' && equipo.tipo.id) {
                            equipo.tipo_id = equipo.tipo.id;
                            equipo.tipoId = equipo.tipo.id;
                        }
                        // Extraer ubicacion_id si viene como objeto
                        if (equipo.ubicacion && typeof equipo.ubicacion === 'object' && equipo.ubicacion.id) {
                            equipo.ubicacion_id = equipo.ubicacion.id;
                            equipo.ubicacionId = equipo.ubicacion.id;
                        }
                        // Extraer estado_id si viene como objeto
                        if (equipo.estadoEquipo && typeof equipo.estadoEquipo === 'object' && equipo.estadoEquipo.id) {
                            equipo.estado_id = equipo.estadoEquipo.id;
                            equipo.estadoId = equipo.estadoEquipo.id;
                        }
                    });
                }
                return response;
            })
        );
    }

    /**
     * Obtener un equipo por ID
     * @param id ID del equipo
     */
    getEquipoById(id: number): Observable<ApiResponse<Equipo>> {
        return this.apiService.get<Equipo>(`${this.endpoint}/${id}`);
    }

    /**
     * Buscar equipos por criterio
     * @param criterio Texto de búsqueda
     */
    buscarEquipos(criterio: string): Observable<ApiResponse<Equipo[]>> {
        return this.apiService.get<Equipo[]>(`${this.endpoint}/buscar`, {
            params: { q: criterio }
        });
    }

    /**
     * Buscar equipo por código
     * @param codigo Código del equipo
     */
    buscarPorCodigo(codigo: string): Observable<ApiResponse<Equipo>> {
        return this.apiService.get<Equipo>(`${this.endpoint}/codigo/${codigo}`);
    }

    /**
     * Obtener equipos disponibles
     */
    getEquiposDisponibles(): Observable<ApiResponse<Equipo[]>> {
        return this.apiService.get<Equipo[]>(`${this.endpoint}/disponibles`);
    }

    /**
     * Obtener equipos por categoría
     * @param categoria Categoría del equipo
     */
    getPorCategoria(categoria: string): Observable<ApiResponse<Equipo[]>> {
        return this.apiService.get<Equipo[]>(`${this.endpoint}/categoria/${categoria}`);
    }

    /**
     * Obtener categorías de equipos
     */
    getCategorias(): Observable<ApiResponse<string[]>> {
        return this.apiService.get<string[]>(`${this.endpoint}/categorias`);
    }

    /**
     * Crear un nuevo equipo
     * @param equipo Datos del equipo
     */
    crearEquipo(equipo: Equipo): Observable<ApiResponse<Equipo>> {
        return this.apiService.post<Equipo>(this.endpoint, equipo);
    }

    /**
     * Actualizar un equipo existente
     * @param id ID del equipo
     * @param equipo Datos actualizados del equipo
     */
    actualizarEquipo(id: number, equipo: Equipo): Observable<ApiResponse<Equipo>> {
        return this.apiService.put<Equipo>(`${this.endpoint}/${id}`, equipo);
    }

    /**
     * Actualizar parcialmente un equipo
     * @param id ID del equipo
     * @param datos Datos parciales a actualizar
     */
    actualizarParcial(id: number, datos: Partial<Equipo>): Observable<ApiResponse<Equipo>> {
        return this.apiService.patch<Equipo>(`${this.endpoint}/${id}`, datos);
    }

    /**
     * Cambiar estado del equipo
     * @param id ID del equipo
     * @param estado Nuevo estado
     */
    cambiarEstado(
        id: number,
        estado: 'DISPONIBLE' | 'PRESTADO' | 'MANTENIMIENTO' | 'BAJA'
    ): Observable<ApiResponse<Equipo>> {
        return this.apiService.patch<Equipo>(`${this.endpoint}/${id}/estado`, { estado });
    }

    /**
     * Activar/desactivar un equipo
     * @param id ID del equipo
     * @param activo Estado activo
     */
    cambiarActivo(id: number, activo: boolean): Observable<ApiResponse<Equipo>> {
        return this.apiService.patch<Equipo>(`${this.endpoint}/${id}/activo`, { activo });
    }

    /**
     * Eliminar un equipo
     * @param id ID del equipo
     */
    eliminarEquipo(id: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`${this.endpoint}/${id}`);
    }

    /**
     * Obtener historial de préstamos de un equipo
     * @param id ID del equipo
     */
    getHistorialPrestamos(id: number): Observable<ApiResponse<any[]>> {
        return this.apiService.get<any[]>(`${this.endpoint}/${id}/prestamos`);
    }

    /**
     * Obtener evaluaciones de un equipo
     * @param id ID del equipo
     */
    getEvaluaciones(id: number): Observable<ApiResponse<any[]>> {
        return this.apiService.get<any[]>(`${this.endpoint}/${id}/evaluaciones`);
    }

    /**
     * Subir imagen del equipo
     * @param id ID del equipo
     * @param imagen Archivo de imagen
     */
    subirImagen(id: number, imagen: File): Observable<ApiResponse<{ url: string }>> {
        return this.apiService.uploadFile<{ url: string }>(
            `${this.endpoint}/${id}/imagen`,
            imagen
        );
    }

    /**
     * Exportar equipos a Excel
     * @param filtros Filtros aplicados
     */
    exportarExcel(filtros?: EquipoFiltro): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/export/excel?${this.buildQueryString(filtros)}`,
            'equipos.xlsx'
        );
    }

    /**
     * Exportar equipos a PDF
     * @param filtros Filtros aplicados
     */
    exportarPDF(filtros?: EquipoFiltro): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/export/pdf?${this.buildQueryString(filtros)}`,
            'equipos.pdf'
        );
    }

    /**
     * Importar equipos desde archivo Excel
     * @param file Archivo Excel
     */
    importarExcel(file: File): Observable<ApiResponse<{ imported: number; errors: string[] }>> {
        return this.apiService.uploadFile<{ imported: number; errors: string[] }>(
            `${this.endpoint}/import`,
            file
        );
    }

    /**
     * Generar código QR del equipo
     * @param id ID del equipo
     */
    generarQR(id: number): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/${id}/qr`,
            `equipo-${id}-qr.png`
        );
    }

    /**
     * Construir query string desde filtros
     */
    private buildQueryString(filtros?: EquipoFiltro): string {
        if (!filtros) return '';
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filtros)) {
            if (value !== null && value !== undefined) {
                params.append(key, value.toString());
            }
        }
        return params.toString();
    }
}
