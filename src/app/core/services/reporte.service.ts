import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/core/models/api.model';
import { Reporte, DashboardStats } from '@/core/models/inventario.model';

/**
 * Servicio para gestión de Reportes
 * Maneja generación y descarga de reportes del sistema
 */
@Injectable({
    providedIn: 'root'
})
export class ReporteService {
    private readonly endpoint = '/reportes';

    constructor(private readonly apiService: ApiService) {}

    /**
     * Obtener todos los reportes generados (paginado)
     * @param page Número de página
     * @param pageSize Tamaño de página
     */
    getReportes(
        page: number = 1,
        pageSize: number = 10
    ): Observable<PaginatedResponse<Reporte>> {
        return this.apiService.getPaginated<Reporte>(this.endpoint, page, pageSize);
    }

    /**
     * Obtener un reporte por ID
     * @param id ID del reporte
     */
    getReporteById(id: number): Observable<ApiResponse<Reporte>> {
        return this.apiService.get<Reporte>(`${this.endpoint}/${id}`);
    }

    /**
     * Obtener estadísticas del dashboard
     */
    getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
        return this.apiService.get<DashboardStats>(`${this.endpoint}/dashboard/stats`);
    }

    /**
     * Generar reporte de préstamos
     * @param fechaInicio Fecha inicio del periodo
     * @param fechaFin Fecha fin del periodo
     * @param formato Formato del reporte (PDF o EXCEL)
     */
    generarReportePrestamos(
        fechaInicio: Date,
        fechaFin: Date,
        formato: 'PDF' | 'EXCEL' = 'PDF'
    ): Observable<Blob> {
        const params = new URLSearchParams({
            fechaInicio: fechaInicio.toISOString(),
            fechaFin: fechaFin.toISOString(),
            formato
        });
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(
            `${this.endpoint}/prestamos?${params.toString()}`,
            `reporte-prestamos.${extension}`
        );
    }

    /**
     * Generar reporte de equipos
     * @param categoria Categoría de equipos (opcional)
     * @param estado Estado de equipos (opcional)
     * @param formato Formato del reporte
     */
    generarReporteEquipos(
        categoria?: string,
        estado?: string,
        formato: 'PDF' | 'EXCEL' = 'PDF'
    ): Observable<Blob> {
        const params = new URLSearchParams({ formato });
        if (categoria) params.append('categoria', categoria);
        if (estado) params.append('estado', estado);
        
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(
            `${this.endpoint}/equipos?${params.toString()}`,
            `reporte-equipos.${extension}`
        );
    }

    /**
     * Generar reporte de clientes
     * @param activo Filtro por estado activo
     * @param formato Formato del reporte
     */
    generarReporteClientes(
        activo?: boolean,
        formato: 'PDF' | 'EXCEL' = 'PDF'
    ): Observable<Blob> {
        const params = new URLSearchParams({ formato });
        if (activo !== undefined) params.append('activo', activo.toString());
        
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(
            `${this.endpoint}/clientes?${params.toString()}`,
            `reporte-clientes.${extension}`
        );
    }

    /**
     * Generar reporte de evaluaciones
     * @param fechaInicio Fecha inicio del periodo
     * @param fechaFin Fecha fin del periodo
     * @param formato Formato del reporte
     */
    generarReporteEvaluaciones(
        fechaInicio: Date,
        fechaFin: Date,
        formato: 'PDF' | 'EXCEL' = 'PDF'
    ): Observable<Blob> {
        const params = new URLSearchParams({
            fechaInicio: fechaInicio.toISOString(),
            fechaFin: fechaFin.toISOString(),
            formato
        });
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(
            `${this.endpoint}/evaluaciones?${params.toString()}`,
            `reporte-evaluaciones.${extension}`
        );
    }

    /**
     * Generar reporte general del sistema
     * @param fechaInicio Fecha inicio del periodo
     * @param fechaFin Fecha fin del periodo
     * @param formato Formato del reporte
     */
    generarReporteGeneral(
        fechaInicio: Date,
        fechaFin: Date,
        formato: 'PDF' | 'EXCEL' = 'PDF'
    ): Observable<Blob> {
        const params = new URLSearchParams({
            fechaInicio: fechaInicio.toISOString(),
            fechaFin: fechaFin.toISOString(),
            formato
        });
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(
            `${this.endpoint}/general?${params.toString()}`,
            `reporte-general.${extension}`
        );
    }

    /**
     * Generar reporte de equipos por estado
     */
    generarReporteEquiposPorEstado(formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(
            `${this.endpoint}/equipos-por-estado?formato=${formato}`,
            `reporte-equipos-estado.${extension}`
        );
    }

    /**
     * Generar reporte de préstamos vencidos
     */
    generarReportePrestamosVencidos(formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(
            `${this.endpoint}/prestamos-vencidos?formato=${formato}`,
            `reporte-prestamos-vencidos.${extension}`
        );
    }

    /**
     * Generar reporte de equipos que requieren mantenimiento
     */
    generarReporteMantenimiento(formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(
            `${this.endpoint}/mantenimiento?formato=${formato}`,
            `reporte-mantenimiento.${extension}`
        );
    }

    /**
     * Generar reporte de actividad por usuario
     * @param usuarioId ID del usuario
     * @param fechaInicio Fecha inicio del periodo
     * @param fechaFin Fecha fin del periodo
     */
    generarReporteActividadUsuario(
        usuarioId: number,
        fechaInicio: Date,
        fechaFin: Date,
        formato: 'PDF' | 'EXCEL' = 'PDF'
    ): Observable<Blob> {
        const params = new URLSearchParams({
            usuarioId: usuarioId.toString(),
            fechaInicio: fechaInicio.toISOString(),
            fechaFin: fechaFin.toISOString(),
            formato
        });
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(
            `${this.endpoint}/actividad-usuario?${params.toString()}`,
            `reporte-actividad-usuario-${usuarioId}.${extension}`
        );
    }

    /**
     * Generar reporte personalizado
     * @param parametros Parámetros del reporte personalizado
     */
    generarReportePersonalizado(parametros: {
        tipo: string;
        fechaInicio?: Date;
        fechaFin?: Date;
        filtros?: Record<string, any>;
        formato: 'PDF' | 'EXCEL';
    }): Observable<ApiResponse<any>> {
        return this.apiService.post<any>(
            `${this.endpoint}/personalizado`,
            parametros
        );
    }

    /**
     * Programar reporte automático
     * @param reporte Configuración del reporte
     */
    programarReporte(reporte: {
        tipo: string;
        nombre: string;
        frecuencia: 'DIARIO' | 'SEMANAL' | 'MENSUAL';
        formato: 'PDF' | 'EXCEL';
        emails: string[];
        parametros?: Record<string, any>;
    }): Observable<ApiResponse<Reporte>> {
        return this.apiService.post<Reporte>(`${this.endpoint}/programar`, reporte);
    }

    /**
     * Obtener reportes programados
     */
    getReportesProgramados(): Observable<ApiResponse<Reporte[]>> {
        return this.apiService.get<Reporte[]>(`${this.endpoint}/programados`);
    }

    /**
     * Cancelar reporte programado
     * @param id ID del reporte programado
     */
    cancelarReporteProgramado(id: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`${this.endpoint}/programados/${id}`);
    }

    /**
     * Descargar reporte previamente generado
     * @param id ID del reporte
     */
    descargarReporte(id: number): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/${id}/download`,
            `reporte-${id}.pdf`
        );
    }

    /**
     * Obtener gráficos del dashboard
     * @param periodo Periodo de análisis (7, 30, 90 días)
     */
    getGraficosDashboard(periodo: 7 | 30 | 90 = 30): Observable<ApiResponse<{
        prestamosPorDia: Array<{ fecha: string; cantidad: number }>;
        equiposPorCategoria: Array<{ categoria: string; cantidad: number }>;
        estadoPrestamos: Array<{ estado: string; cantidad: number }>;
        topClientes: Array<{ nombre: string; prestamos: number }>;
    }>> {
        return this.apiService.get(`${this.endpoint}/dashboard/graficos`, {
            params: { periodo: periodo.toString() }
        });
    }
}
