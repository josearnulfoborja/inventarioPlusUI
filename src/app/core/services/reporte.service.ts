import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/core/models/api.model';
import { Reporte, DashboardStats } from '@/core/models/inventario.model';

/**
 * Servicio para gestión de reportes.
 * Implementa una estrategia de fallback: primero intenta las rutas en inglés
 * (por ejemplo /reports/prestamos) y si fallan, intenta las rutas en español
 * (/reportes/prestamos).
 */
@Injectable({
    providedIn: 'root'
})
export class ReporteService {
    private readonly endpoint = '/reportes';

    constructor(private readonly apiService: ApiService) {}

    getReportes(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Reporte>> {
        return this.apiService.getPaginated<Reporte>(this.endpoint, page, pageSize);
    }

    getReporteById(id: number): Observable<ApiResponse<Reporte>> {
        return this.apiService.get<Reporte>(`${this.endpoint}/${id}`);
    }

    getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
        return this.apiService.get<DashboardStats>(`${this.endpoint}/dashboard/stats`);
    }

    /** Genera el reporte de préstamos (intenta /reports/... y cae a /reportes/...) */
    generarReportePrestamos(fechaInicio: Date, fechaFin: Date, formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const fmt = formato === 'PDF' ? 'pdf' : 'excel';
        const from = fechaInicio ? fechaInicio.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const to = fechaFin ? fechaFin.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const englishEndpoint = `/reports/prestamos?format=${fmt}&from=${from}&to=${to}`;
    const spanishEndpoint = `${this.endpoint}/prestamos?fechaInicio=${from}&fechaFin=${to}&formato=${fmt}`;
        const extension = fmt === 'pdf' ? 'pdf' : 'xlsx';

        return this.apiService.downloadFile(englishEndpoint, `reporte-prestamos.${extension}`).pipe(
            // Si falla (404 u otro), intentamos la ruta en español
            catchError(() => this.apiService.downloadFile(spanishEndpoint, `reporte-prestamos.${extension}`))
        );
    }

    generarReporteEquipos(categoria?: string, estado?: string, formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const fmt = formato === 'PDF' ? 'pdf' : 'excel';
        const engParams = new URLSearchParams({ format: fmt });
        if (categoria) engParams.append('categoria', categoria);
        if (estado) engParams.append('estado', estado);
        const englishEndpoint = `/reports/equipos?${engParams.toString()}`;

    const spaParams = new URLSearchParams({ formato: fmt });
        if (categoria) spaParams.append('categoria', categoria);
        if (estado) spaParams.append('estado', estado);
        const spanishEndpoint = `${this.endpoint}/equipos?${spaParams.toString()}`;

        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(englishEndpoint, `reporte-equipos.${extension}`).pipe(
            catchError(() => this.apiService.downloadFile(spanishEndpoint, `reporte-equipos.${extension}`))
        );
    }

    generarReporteClientes(activo?: boolean, formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const fmt = formato === 'PDF' ? 'pdf' : 'excel';
        const englishEndpoint = `/reports/clients?format=${fmt}`;
        const spaParams = new URLSearchParams({ formato });
        if (activo !== undefined) spaParams.append('activo', String(activo));
        const spanishEndpoint = `${this.endpoint}/clientes?${spaParams.toString()}`;
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';

        return this.apiService.downloadFile(englishEndpoint, `reporte-clientes.${extension}`).pipe(
            catchError(() => this.apiService.downloadFile(spanishEndpoint, `reporte-clientes.${extension}`))
        );
    }

    generarReporteEvaluaciones(fechaInicio: Date, fechaFin: Date, formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const fmt = formato === 'PDF' ? 'pdf' : 'excel';
        const from = fechaInicio.toISOString().split('T')[0];
        const to = fechaFin.toISOString().split('T')[0];
        const englishEndpoint = `/reports/evaluations?format=${fmt}&from=${from}&to=${to}`;
    const spanishEndpoint = `${this.endpoint}/evaluaciones?fechaInicio=${from}&fechaFin=${to}&formato=${fmt}`;
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';

        return this.apiService.downloadFile(englishEndpoint, `reporte-evaluaciones.${extension}`).pipe(
            catchError(() => this.apiService.downloadFile(spanishEndpoint, `reporte-evaluaciones.${extension}`))
        );
    }

    generarReporteInspecciones(equipoId?: number, fechaInicio?: Date, fechaFin?: Date, formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const fmt = formato === 'PDF' ? 'pdf' : 'excel';
        // Some backends expose a mixed route: /reports/inspecciones with english-style 'format' param.
        const engParams = new URLSearchParams({ format: fmt });
        if (fechaInicio) engParams.append('from', fechaInicio.toISOString().split('T')[0]);
        if (fechaFin) engParams.append('to', fechaFin.toISOString().split('T')[0]);
        if (equipoId !== undefined && equipoId !== null) engParams.append('equipmentId', String(equipoId));
        const englishEndpoint = `/reports/inspecciones?${engParams.toString()}`; // matches your example

        // Spanish-style fallback
        const spaParams = new URLSearchParams({ formato: fmt });
        if (fechaInicio) spaParams.append('fechaInicio', fechaInicio.toISOString().split('T')[0]);
        if (fechaFin) spaParams.append('fechaFin', fechaFin.toISOString().split('T')[0]);
        if (equipoId !== undefined && equipoId !== null) spaParams.append('equipoId', String(equipoId));
        const spanishEndpoint = `${this.endpoint}/inspecciones?${spaParams.toString()}`;

        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(englishEndpoint, `reporte-inspecciones.${extension}`).pipe(
            catchError(() => this.apiService.downloadFile(spanishEndpoint, `reporte-inspecciones.${extension}`))
        );
    }

    generarReporteGeneral(fechaInicio: Date, fechaFin: Date, formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const params = new URLSearchParams({ fechaInicio: fechaInicio.toISOString(), fechaFin: fechaFin.toISOString(), formato });
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(`${this.endpoint}/general?${params.toString()}`, `reporte-general.${extension}`);
    }

    generarReporteEquiposPorEstado(formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(`${this.endpoint}/equipos-por-estado?formato=${formato}`, `reporte-equipos-estado.${extension}`);
    }

    generarReportePrestamosVencidos(formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(`${this.endpoint}/prestamos-vencidos?formato=${formato}`, `reporte-prestamos-vencidos.${extension}`);
    }

    generarReporteMantenimiento(formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const eng = `/reports/maintenance?format=${formato === 'PDF' ? 'pdf' : 'excel'}`;
        const spa = `${this.endpoint}/mantenimiento?formato=${formato}`;
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        return this.apiService.downloadFile(eng, `reporte-mantenimiento.${extension}`).pipe(
            catchError(() => this.apiService.downloadFile(spa, `reporte-mantenimiento.${extension}`))
        );
    }

    generarReporteActividadUsuario(usuarioId: number, fechaInicio: Date, fechaFin: Date, formato: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
        const fmt = formato === 'PDF' ? 'pdf' : 'excel';
        const from = fechaInicio.toISOString().split('T')[0];
        const to = fechaFin.toISOString().split('T')[0];
        const englishEndpoint = `/reports/activity-user?format=${fmt}&from=${from}&to=${to}&usuarioId=${usuarioId}`;
        const spanishEndpoint = `${this.endpoint}/actividad-usuario?usuarioId=${usuarioId}&fechaInicio=${from}&fechaFin=${to}&formato=${formato}`;
        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';

        return this.apiService.downloadFile(englishEndpoint, `reporte-actividad-usuario-${usuarioId}.${extension}`).pipe(
            catchError(() => this.apiService.downloadFile(spanishEndpoint, `reporte-actividad-usuario-${usuarioId}.${extension}`))
        );
    }

    generarReportePersonalizado(parametros: { tipo: string; fechaInicio?: Date; fechaFin?: Date; filtros?: Record<string, any>; formato: 'PDF' | 'EXCEL'; }): Observable<ApiResponse<any>> {
        return this.apiService.post<any>(`${this.endpoint}/personalizado`, parametros);
    }

    programarReporte(reporte: { tipo: string; nombre: string; frecuencia: 'DIARIO' | 'SEMANAL' | 'MENSUAL'; formato: 'PDF' | 'EXCEL'; emails: string[]; parametros?: Record<string, any>; }): Observable<ApiResponse<Reporte>> {
        return this.apiService.post<Reporte>(`${this.endpoint}/programar`, reporte);
    }

    getReportesProgramados(): Observable<ApiResponse<Reporte[]>> {
        return this.apiService.get<Reporte[]>(`${this.endpoint}/programados`);
    }

    cancelarReporteProgramado(id: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`${this.endpoint}/programados/${id}`);
    }

    descargarReporte(id: number): Observable<Blob> {
        return this.apiService.downloadFile(`${this.endpoint}/${id}/download`, `reporte-${id}.pdf`);
    }

    getGraficosDashboard(periodo: 7 | 30 | 90 = 30): Observable<ApiResponse<{
        prestamosPorDia: Array<{ fecha: string; cantidad: number }>;
        equiposPorCategoria: Array<{ categoria: string; cantidad: number }>;
        estadoPrestamos: Array<{ estado: string; cantidad: number }>;
        topClientes: Array<{ nombre: string; prestamos: number }>;
    }>> {
        return this.apiService.get(`${this.endpoint}/dashboard/graficos`, { params: { periodo: periodo.toString() } });
    }
}
