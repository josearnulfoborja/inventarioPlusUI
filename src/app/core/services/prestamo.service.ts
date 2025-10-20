import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/core/models/api.model';
import { Prestamo, PrestamoFiltro } from '@/core/models/inventario.model';

/**
 * Servicio para gestión de Préstamos
 * Maneja todas las operaciones de préstamos de equipos
 */
@Injectable({
    providedIn: 'root'
})
export class PrestamoService {
    private readonly endpoint = '/prestamos';

    constructor(private readonly apiService: ApiService) {}

    /**
     * Obtener todos los préstamos (paginado)
     * @param page Número de página
     * @param pageSize Tamaño de página
     * @param filtros Filtros de búsqueda
     */
    getPrestamos(
        page: number = 1,
        pageSize: number = 10,
        filtros?: PrestamoFiltro
    ): Observable<PaginatedResponse<Prestamo>> {
        return this.apiService.getPaginated<Prestamo>(
            this.endpoint,
            page,
            pageSize,
            { params: filtros as any }
        );
    }

    /**
     * Obtener un préstamo por ID
     * @param id ID del préstamo
     */
    getPrestamoById(id: number): Observable<ApiResponse<Prestamo>> {
        return this.apiService.get<Prestamo>(`${this.endpoint}/${id}`);
    }

    /**
     * Obtener préstamos activos
     */
    getPrestamosActivos(): Observable<ApiResponse<Prestamo[]>> {
        return this.apiService.get<Prestamo[]>(`${this.endpoint}/activos`);
    }

    /**
     * Obtener préstamos vencidos
     */
    getPrestamosVencidos(): Observable<ApiResponse<Prestamo[]>> {
        return this.apiService.get<Prestamo[]>(`${this.endpoint}/vencidos`);
    }

    /**
     * Obtener préstamos por cliente
     * @param clienteId ID del cliente
     */
    getPrestamosPorCliente(clienteId: number): Observable<ApiResponse<Prestamo[]>> {
        return this.apiService.get<Prestamo[]>(`${this.endpoint}/cliente/${clienteId}`);
    }

    /**
     * Obtener préstamos por equipo
     * @param equipoId ID del equipo
     */
    getPrestamosPorEquipo(equipoId: number): Observable<ApiResponse<Prestamo[]>> {
        return this.apiService.get<Prestamo[]>(`${this.endpoint}/equipo/${equipoId}`);
    }

    /**
     * Verificar disponibilidad de equipo
     * @param equipoId ID del equipo
     * @param fechaInicio Fecha inicio del préstamo
     * @param fechaFin Fecha fin del préstamo
     */
    verificarDisponibilidad(
        equipoId: number,
        fechaInicio: Date,
        fechaFin: Date
    ): Observable<ApiResponse<{ disponible: boolean; mensaje?: string }>> {
        return this.apiService.post<{ disponible: boolean; mensaje?: string }>(
            `${this.endpoint}/verificar-disponibilidad`,
            { equipoId, fechaInicio, fechaFin }
        );
    }

    /**
     * Crear un nuevo préstamo
     * @param prestamo Datos del préstamo
     */
    crearPrestamo(prestamo: Prestamo): Observable<ApiResponse<Prestamo>> {
        return this.apiService.post<Prestamo>(this.endpoint, prestamo);
    }

    /**
     * Actualizar un préstamo existente
     * @param id ID del préstamo
     * @param prestamo Datos actualizados del préstamo
     */
    actualizarPrestamo(id: number, prestamo: Prestamo): Observable<ApiResponse<Prestamo>> {
        return this.apiService.put<Prestamo>(`${this.endpoint}/${id}`, prestamo);
    }

    /**
     * Registrar devolución de préstamo
     * @param id ID del préstamo
     * @param fechaDevolucion Fecha de devolución
     * @param observaciones Observaciones de la devolución
     */
    registrarDevolucion(
        id: number,
        fechaDevolucion: Date,
        observaciones?: string
    ): Observable<ApiResponse<Prestamo>> {
        return this.apiService.post<Prestamo>(`${this.endpoint}/${id}/devolucion`, {
            fechaDevolucion,
            observaciones
        });
    }

    /**
     * Renovar préstamo
     * @param id ID del préstamo
     * @param nuevaFechaDevolucion Nueva fecha de devolución
     */
    renovarPrestamo(
        id: number,
        nuevaFechaDevolucion: Date
    ): Observable<ApiResponse<Prestamo>> {
        return this.apiService.post<Prestamo>(`${this.endpoint}/${id}/renovar`, {
            nuevaFechaDevolucion
        });
    }

    /**
     * Cancelar préstamo
     * @param id ID del préstamo
     * @param motivo Motivo de la cancelación
     */
    cancelarPrestamo(id: number, motivo: string): Observable<ApiResponse<Prestamo>> {
        return this.apiService.post<Prestamo>(`${this.endpoint}/${id}/cancelar`, { motivo });
    }

    /**
     * Actualizar parcialmente un préstamo
     * @param id ID del préstamo
     * @param datos Datos parciales a actualizar
     */
    actualizarParcial(id: number, datos: Partial<Prestamo>): Observable<ApiResponse<Prestamo>> {
        return this.apiService.patch<Prestamo>(`${this.endpoint}/${id}`, datos);
    }

    /**
     * Eliminar un préstamo
     * @param id ID del préstamo
     */
    eliminarPrestamo(id: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`${this.endpoint}/${id}`);
    }

    /**
     * Generar contrato de préstamo
     * @param id ID del préstamo
     */
    generarContrato(id: number): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/${id}/contrato`,
            `contrato-prestamo-${id}.pdf`
        );
    }

    /**
     * Generar recibo de devolución
     * @param id ID del préstamo
     */
    generarRecibo(id: number): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/${id}/recibo`,
            `recibo-devolucion-${id}.pdf`
        );
    }

    /**
     * Exportar préstamos a Excel
     * @param filtros Filtros aplicados
     */
    exportarExcel(filtros?: PrestamoFiltro): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/export/excel?${this.buildQueryString(filtros)}`,
            'prestamos.xlsx'
        );
    }

    /**
     * Exportar préstamos a PDF
     * @param filtros Filtros aplicados
     */
    exportarPDF(filtros?: PrestamoFiltro): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/export/pdf?${this.buildQueryString(filtros)}`,
            'prestamos.pdf'
        );
    }

    /**
     * Obtener estadísticas de préstamos
     */
    getEstadisticas(): Observable<ApiResponse<{
        totalActivos: number;
        totalVencidos: number;
        totalDevueltos: number;
        promedioTiempoPrestamo: number;
    }>> {
        return this.apiService.get(`${this.endpoint}/estadisticas`);
    }

    /**
     * Construir query string desde filtros
     */
    private buildQueryString(filtros?: PrestamoFiltro): string {
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
