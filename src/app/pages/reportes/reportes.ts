import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '@/core/services/reporte.service';
import { EquipoService } from '@/core/services/equipo.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="p-4">
            <h2 class="text-xl font-bold mb-4">Reportes</h2>

            <div class="bg-white p-4 rounded shadow-sm mb-4">
                <label class="block text-sm font-semibold mb-2">Tipo de reporte</label>
                <div class="flex gap-2 items-center">
                    <select [(ngModel)]="selectedReportType" class="select select-bordered w-64">
                        <option *ngFor="let r of reportTypes" [value]="r.value">{{ r.label }}</option>
                    </select>
                    <div class="ml-auto text-sm text-gray-600">Generar en: <strong>{{ selectedFormat }}</strong></div>
                </div>
            </div>

            <!-- Filtros dinámicos según el tipo de reporte -->
            <div class="bg-white p-4 rounded shadow-sm mb-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label class="block text-sm">Fecha Inicio</label>
                        <input type="date" [(ngModel)]="fechaInicio" class="input input-bordered w-full" />
                    </div>
                    <div>
                        <label class="block text-sm">Fecha Fin</label>
                        <input type="date" [(ngModel)]="fechaFin" class="input input-bordered w-full" />
                    </div>
                    <div *ngIf="selectedReportType === 'INSPECCIONES' || selectedReportType === 'EVALUACIONES'">
                        <label class="block text-sm">Equipo (opcional)</label>
                        <select [(ngModel)]="selectedEquipoId" class="select select-bordered w-full">
                            <option [ngValue]="null">Todos</option>
                            <option *ngFor="let e of equipoOptions" [ngValue]="e.id">{{ e.name }}</option>
                        </select>
                    </div>
                    <div *ngIf="selectedReportType === 'ACTIVIDAD_USUARIO'">
                        <label class="block text-sm">Usuario ID</label>
                        <input type="number" [(ngModel)]="usuarioId" class="input input-bordered w-full" />
                    </div>
                </div>

                <div class="mt-4 flex gap-2">
                    <button class="btn btn-primary" (click)="generarReporte('PDF')">📄 Generar PDF</button>
                    <button class="btn btn-secondary" (click)="generarReporte('EXCEL')">📊 Generar Excel</button>
                    <button class="btn btn-outline" (click)="previewUrl()">🔗 Ver URL</button>
                </div>
            </div>

            <section class="mt-6 text-sm text-gray-600">
                <p>Los reportes se generan en el backend y la descarga se inicia automáticamente. Si tu backend requiere autenticación, asegúrate de que la sesión esté activa.</p>
            </section>
        </div>
    `
})
export class Reportes implements OnInit {
    prestamosDesde: string | null = null;
    prestamosHasta: string | null = null;

    // UI state
    reportTypes = [
        { value: 'PRESTAMOS', label: 'Préstamos' },
        { value: 'EQUIPOS', label: 'Equipos' },
        { value: 'INSPECCIONES', label: 'Inspecciones/Evaluaciones' },
        { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
        { value: 'ACTIVIDAD_USUARIO', label: 'Actividad por Usuario' }
    ];
    selectedReportType: string = 'PRESTAMOS';
    selectedFormat: string = 'PDF';
    fechaInicio: string | null = null;
    fechaFin: string | null = null;
    equipoOptions: Array<{ id: number; name: string }> = [];
    selectedEquipoId: number | null = null;
    usuarioId: number | null = null;

    constructor(private readonly reporteService: ReporteService, private readonly equipoService: EquipoService) {}

    generarPrestamos(formato: 'PDF' | 'EXCEL') {
        // Use the UI date fields (fechaInicio/fechaFin) instead of legacy prestamosDesde/prestamosHasta
        const desde = this.fechaInicio ? new Date(this.fechaInicio) : new Date();
        const hasta = this.fechaFin ? new Date(this.fechaFin) : new Date();
        this.reporteService.generarReportePrestamos(desde, hasta, formato).subscribe({
            next: () => {
                // descarga gestionada por ApiService
                // eslint-disable-next-line no-console
                console.debug('[REPORTES] descarga prestamos', formato);
            },
            error: (err) => {
                console.error('Error generando reporte de prestamos', err);
                alert('Error al generar el reporte de préstamos');
            }
        });
    }

    ngOnInit(): void {
        // cargar equipos para el selector (poco volumen esperado)
        this.equipoService.getEquipos(1, 1000).subscribe({
            next: (resp: any) => {
                const list = resp?.data ?? resp ?? [];
                this.equipoOptions = Array.isArray(list)
                    ? list.map((e: any) => ({ id: e.idEquipo ?? e.id ?? 0, name: e.nombre ?? e.name ?? e.codigo ?? `#${e.id}` }))
                    : [];
            },
            error: () => {
                this.equipoOptions = [];
            }
        });
    }

    /**
     * Generador general que enruta a la función concreta según tipo seleccionado
     */
    generarReporte(formato: 'PDF' | 'EXCEL') {
        this.selectedFormat = formato;
        const fInicio = this.fechaInicio ? new Date(this.fechaInicio) : undefined;
        const fFin = this.fechaFin ? new Date(this.fechaFin) : undefined;

        switch (this.selectedReportType) {
            case 'PRESTAMOS':
                this.generarPrestamos(formato);
                break;
            case 'EQUIPOS':
                this.generarEquipos(formato);
                break;
            case 'INSPECCIONES':
                this.reporteService.generarReporteInspecciones(this.selectedEquipoId ?? undefined, fInicio, fFin, formato).subscribe({
                    next: () => console.debug('[REPORTES] inspecciones descargadas', formato),
                    error: (err) => { console.error('Error generando reporte de inspecciones', err); alert('Error al generar el reporte de inspecciones'); }
                });
                break;
            case 'MANTENIMIENTO':
                this.reporteService.generarReporteMantenimiento(formato).subscribe({
                    next: () => console.debug('[REPORTES] mantenimiento descargado', formato),
                    error: (err) => { console.error('Error generando reporte de mantenimiento', err); alert('Error al generar el reporte de mantenimiento'); }
                });
                break;
            case 'ACTIVIDAD_USUARIO':
                if (!this.usuarioId) { alert('Ingresa un usuarioId'); return; }
                this.reporteService.generarReporteActividadUsuario(this.usuarioId, fInicio ?? new Date(), fFin ?? new Date(), formato).subscribe({
                    next: () => console.debug('[REPORTES] actividad usuario descargada', formato),
                    error: (err) => { console.error('Error generando reporte de actividad', err); alert('Error al generar el reporte de actividad'); }
                });
                break;
            default:
                alert('Tipo de reporte no soportado');
        }
    }

    /** Muestra/abre la URL que se va a invocar para depuración */
    previewUrl() {
        const base = environment.apiUrl.replace(/\/$/, '');
        let url = '';
        const fmt = this.selectedFormat === 'PDF' ? 'pdf' : 'xlsx';
        const from = this.fechaInicio ?? new Date().toISOString().slice(0, 10);
        const to = this.fechaFin ?? new Date().toISOString().slice(0, 10);

        switch (this.selectedReportType) {
            case 'PRESTAMOS':
                // user provided example uses /api/reports/prestamos?format=pdf&from=...&to=...
                url = `${base.replace(/\/api$/, '')}/api/reports/prestamos?format=${fmt}&from=${from}&to=${to}`;
                break;
            case 'INSPECCIONES':
                    // Many backends expose the mixed path: /api/reports/inspecciones?format=pdf
                    url = `${base}/reports/inspecciones?format=${fmt}&from=${from}&to=${to}`;
                    if (this.selectedEquipoId) url += `&equipmentId=${this.selectedEquipoId}`;
                break;
            case 'EQUIPOS':
                url = `${base}/reportes/equipos?formato=${fmt}`;
                break;
            default:
                url = `${base}/reportes?formato=${fmt}`;
        }

        // Mostrar la URL y ofrecer abrirla en nueva pestaña
        // eslint-disable-next-line no-console
        console.debug('[REPORTES] preview URL:', url);
        if (confirm(`Abrir en nueva pestaña?
${url}`)) {
            window.open(url, '_blank');
        }
    }

    generarPrestamosVencidos(formato: 'PDF' | 'EXCEL') {
        this.reporteService.generarReportePrestamosVencidos(formato).subscribe({
            next: () => {
                // eslint-disable-next-line no-console
                console.debug('[REPORTES] descarga prestamos vencidos', formato);
            },
            error: (err) => {
                console.error('Error generando reporte de prestamos vencidos', err);
                alert('Error al generar el reporte de préstamos vencidos');
            }
        });
    }

    generarEquipos(formato: 'PDF' | 'EXCEL') {
        this.reporteService.generarReporteEquipos(undefined, undefined, formato).subscribe({
            next: () => {
                // eslint-disable-next-line no-console
                console.debug('[REPORTES] descarga equipos', formato);
            },
            error: (err) => {
                console.error('Error generando reporte de equipos', err);
                alert('Error al generar el reporte de equipos');
            }
        });
    }
}
