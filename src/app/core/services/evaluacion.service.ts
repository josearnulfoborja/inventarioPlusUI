import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/core/models/api.model';
import { Evaluacion, EvaluacionFiltro } from '@/core/models/inventario.model';

/**
 * Servicio para gestión de Evaluaciones
 * Maneja todas las operaciones de evaluación de equipos
 */
@Injectable({
    providedIn: 'root'
})
export class EvaluacionService {
    private readonly endpoint = '/evaluaciones';

    constructor(private readonly apiService: ApiService) {}

    /**
     * Obtener todas las evaluaciones (paginado)
     * @param page Número de página
     * @param pageSize Tamaño de página
     * @param filtros Filtros de búsqueda
     */
    getEvaluaciones(
        page: number = 1,
        pageSize: number = 10,
        filtros?: EvaluacionFiltro
    ): Observable<PaginatedResponse<Evaluacion>> {
        return this.apiService.getPaginated<Evaluacion>(
            this.endpoint,
            page,
            pageSize,
            { params: filtros as any }
        );
    }

    /**
     * Obtener una evaluación por ID
     * @param id ID de la evaluación
     */
    getEvaluacionById(id: number): Observable<ApiResponse<Evaluacion>> {
        return this.apiService.get<Evaluacion>(`${this.endpoint}/${id}`);
    }

    /**
     * Obtener evaluaciones por préstamo
     * @param prestamoId ID del préstamo
     */
    getEvaluacionesPorPrestamo(prestamoId: number): Observable<ApiResponse<Evaluacion[]>> {
        return this.apiService.get<Evaluacion[]>(`${this.endpoint}/prestamo/${prestamoId}`);
    }

    /**
     * Obtener evaluaciones por equipo
     * @param equipoId ID del equipo
     */
    getEvaluacionesPorEquipo(equipoId: number): Observable<ApiResponse<Evaluacion[]>> {
        return this.apiService.get<Evaluacion[]>(`${this.endpoint}/equipo/${equipoId}`);
    }

    /**
     * Obtener evaluaciones pendientes
     */
    getEvaluacionesPendientes(): Observable<ApiResponse<Evaluacion[]>> {
        return this.apiService.get<Evaluacion[]>(`${this.endpoint}/pendientes`);
    }

    /**
     * Obtener evaluaciones que requieren mantenimiento
     */
    getRequierenMantenimiento(): Observable<ApiResponse<Evaluacion[]>> {
        return this.apiService.get<Evaluacion[]>(`${this.endpoint}/requieren-mantenimiento`);
    }

    /**
     * Crear una nueva evaluación
     * @param evaluacion Datos de la evaluación
     */
    crearEvaluacion(evaluacion: Evaluacion): Observable<ApiResponse<Evaluacion>> {
        return this.apiService.post<Evaluacion>(this.endpoint, evaluacion);
    }

    /**
     * Crear evaluación de salida (al prestar equipo)
     * @param prestamoId ID del préstamo
     * @param evaluacion Datos de la evaluación
     */
    crearEvaluacionSalida(
        prestamoId: number,
        evaluacion: Partial<Evaluacion>
    ): Observable<ApiResponse<Evaluacion>> {
        return this.apiService.post<Evaluacion>(
            `${this.endpoint}/salida/${prestamoId}`,
            evaluacion
        );
    }

    /**
     * Crear evaluación de devolución
     * @param prestamoId ID del préstamo
     * @param evaluacion Datos de la evaluación
     */
    crearEvaluacionDevolucion(
        prestamoId: number,
        evaluacion: Partial<Evaluacion>
    ): Observable<ApiResponse<Evaluacion>> {
        return this.apiService.post<Evaluacion>(
            `${this.endpoint}/devolucion/${prestamoId}`,
            evaluacion
        );
    }

    /**
     * Actualizar una evaluación existente
     * @param id ID de la evaluación
     * @param evaluacion Datos actualizados de la evaluación
     */
    actualizarEvaluacion(id: number, evaluacion: Evaluacion): Observable<ApiResponse<Evaluacion>> {
        return this.apiService.put<Evaluacion>(`${this.endpoint}/${id}`, evaluacion);
    }

    /**
     * Actualizar parcialmente una evaluación
     * @param id ID de la evaluación
     * @param datos Datos parciales a actualizar
     */
    actualizarParcial(id: number, datos: Partial<Evaluacion>): Observable<ApiResponse<Evaluacion>> {
        return this.apiService.patch<Evaluacion>(`${this.endpoint}/${id}`, datos);
    }

    /**
     * Eliminar una evaluación
     * @param id ID de la evaluación
     */
    eliminarEvaluacion(id: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`${this.endpoint}/${id}`);
    }

    /**
     * Subir imágenes de la evaluación
     * @param id ID de la evaluación
     * @param imagenes Array de archivos de imagen
     */
    subirImagenes(id: number, imagenes: File[]): Observable<ApiResponse<{ urls: string[] }>> {
        const formData = new FormData();
        for (const imagen of imagenes) {
            formData.append('imagenes', imagen);
        }
        // Nota: Este endpoint necesita manejo especial de FormData
        return this.apiService.post<{ urls: string[] }>(
            `${this.endpoint}/${id}/imagenes`,
            formData
        );
    }

    /**
     * Generar reporte de evaluación
     * @param id ID de la evaluación
     */
    generarReporte(id: number): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/${id}/reporte`,
            `evaluacion-${id}.pdf`
        );
    }

    /**
     * Comparar evaluación de salida vs devolución
     * @param prestamoId ID del préstamo
     */
    compararEvaluaciones(prestamoId: number): Observable<ApiResponse<{
        evaluacionSalida: Evaluacion;
        evaluacionDevolucion: Evaluacion;
        diferencias: string[];
    }>> {
        return this.apiService.get(`${this.endpoint}/comparar/${prestamoId}`);
    }

    /**
     * Exportar evaluaciones a Excel
     * @param filtros Filtros aplicados
     */
    exportarExcel(filtros?: EvaluacionFiltro): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/export/excel?${this.buildQueryString(filtros)}`,
            'evaluaciones.xlsx'
        );
    }

    /**
     * Exportar evaluaciones a PDF
     * @param filtros Filtros aplicados
     */
    exportarPDF(filtros?: EvaluacionFiltro): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/export/pdf?${this.buildQueryString(filtros)}`,
            'evaluaciones.pdf'
        );
    }

    /**
     * Obtener estadísticas de evaluaciones
     */
    getEstadisticas(): Observable<ApiResponse<{
        totalEvaluaciones: number;
        requierenMantenimiento: number;
        porEstado: Record<string, number>;
        porTipo: Record<string, number>;
    }>> {
        return this.apiService.get(`${this.endpoint}/estadisticas`);
    }

    /**
     * Construir query string desde filtros
     */
    private buildQueryString(filtros?: EvaluacionFiltro): string {
        if (!filtros) return '';
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filtros)) {
            if (value !== null && value !== undefined) {
                if (value instanceof Date) {
                    params.append(key, value.toISOString());
                } else {
                    params.append(key, value.toString());
                }
            }
        }
        return params.toString();
    }
}
