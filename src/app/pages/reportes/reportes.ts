import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { PdfViewerModule } from 'ng2-pdf-viewer';

// libs de exportación
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// pdfmake y fuentes
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// inicializar fuentes vfs
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

type Column = { field: string; header: string };

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DropdownModule,
        MultiSelectModule,
        TableModule,
        ToolbarModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        PdfViewerModule
    ],
    template: `
        <div class="card">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col md:flex-row gap-4 items-start md:items-end">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Fuente de datos</label>
                        <p-dropdown
                            [options]="sources"
                            optionLabel="label"
                            optionValue="value"
                            [(ngModel)]="selectedSource"
                            (onChange)="onSourceChange()"
                            placeholder="Selecciona la fuente"
                            styleClass="w-72"
                        ></p-dropdown>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Columnas</label>
                        <p-multiSelect
                            [options]="availableColumns"
                            optionLabel="header"
                            optionValue="field"
                            [(ngModel)]="selectedColumnFields"
                            (onChange)="onColumnsChange()"
                            defaultLabel="Selecciona columnas"
                            display="chip"
                            styleClass="w-96"
                        ></p-multiSelect>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium">Filtro rápido</label>
                        <input pInputText type="text" class="w-72" [(ngModel)]="quickFilter" placeholder="Buscar en cualquier campo" />
                    </div>

                    <button pButton type="button" label="Aplicar" icon="pi pi-refresh" (click)="apply()"></button>
                </div>

                <p-toolbar styleClass="!border !border-surface-200 !bg-surface-0 rounded-md">
                    <ng-template pTemplate="left">
                        <span class="font-semibold">Acciones</span>
                    </ng-template>
                    <ng-template pTemplate="right">
                        <div class="flex gap-2">
                            <button pButton type="button" label="XLSX" icon="pi pi-file-excel" (click)="exportXLSX()" class="p-button-success"></button>
                            <button pButton type="button" label="CSV" icon="pi pi-download" (click)="exportCSV()" class="p-button-secondary"></button>
                            <button pButton type="button" label="JSON" icon="pi pi-code" (click)="exportJSON()" class="p-button-secondary"></button>
                            <button pButton type="button" label="Ver PDF" icon="pi pi-file-pdf" (click)="viewPDF()" class="p-button-help"></button>
                        </div>
                    </ng-template>
                </p-toolbar>

                <p-table [value]="rows" [paginator]="true" [rows]="10" [responsiveLayout]="'scroll'" [tableStyle]="{ 'min-width': '60rem' }">
                    <ng-template pTemplate="header">
                        <tr>
                            <th *ngFor="let col of displayedColumns">{{ col.header }}</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-row>
                        <tr>
                            <td *ngFor="let col of displayedColumns">{{ row[col.field] }}</td>
                        </tr>
                    </ng-template>
                </p-table>

                <p-dialog [(visible)]="showPdf" [modal]="true" [style]="{ width: '80vw' }" [breakpoints]="{ '960px': '95vw', '640px': '100vw' }" header="Vista previa PDF" (onHide)="pdfSrc = null">
                    <div class="h-[70vh]">
                        <pdf-viewer *ngIf="pdfSrc" [src]="pdfSrc" [render-text]="true" [original-size]="false" style="display: block; height: 100%"></pdf-viewer>
                        <div *ngIf="!pdfSrc" class="text-center p-4 text-color-secondary">Generando PDF...</div>
                    </div>
                </p-dialog>

                <small class="text-color-secondary">Exporta tu reporte en XLSX, CSV, JSON o visualízalo en PDF sin necesidad de descargarlo.</small>
            </div>
        </div>
    `
})
export class Reportes implements OnInit {
    sources = [
        { label: 'Clientes', value: 'clientes' },
        { label: 'Equipos', value: 'equipos' },
        { label: 'Especialistas', value: 'especialistas' },
        { label: 'Usuarios', value: 'usuarios' },
        { label: 'Préstamos', value: 'prestamos' }
    ];

    selectedSource: string = 'prestamos';
    availableColumns: Column[] = [];
    selectedColumnFields: string[] = [];
    displayedColumns: Column[] = [];

    quickFilter = '';

    // Datos mock por fuente
    private dataMap: Record<string, any[]> = {
        clientes: [
            { id: 1, nombre: 'ACME S.A.', contacto: 'Juan Pérez', telefono: '555-1234', ciudad: 'CDMX' },
            { id: 2, nombre: 'Globex', contacto: 'María López', telefono: '555-5678', ciudad: 'GDL' }
        ],
        equipos: [
            { id: 101, nombre: 'Laptop Dell', serie: 'DL-001', estado: 'Disponible', ubicacion: 'Almacén' },
            { id: 102, nombre: 'Impresora HP', serie: 'HP-009', estado: 'En uso', ubicacion: 'Oficina 2' }
        ],
        especialistas: [
            { id: 11, nombre: 'Ana Ruiz', especialidad: 'Redes', telefono: '555-9988', activo: true },
            { id: 12, nombre: 'Luis García', especialidad: 'Soporte', telefono: '555-4455', activo: false }
        ],
        usuarios: [
            { id: 21, usuario: 'dmejia', rol: 'admin', correo: 'dmejia@example.com', activo: true },
            { id: 22, usuario: 'jperez', rol: 'user', correo: 'jperez@example.com', activo: true }
        ],
        prestamos: [
            {
                id: 1001,
                equipo: 'Laptop Dell',
                cliente: 'ACME S.A.',
                especialista: 'Ana Ruiz',
                fechaSalida: '2025-10-01',
                fechaDevolucion: '2025-10-10',
                estado: 'Devuelto'
            },
            {
                id: 1002,
                equipo: 'Impresora HP',
                cliente: 'Globex',
                especialista: 'Luis García',
                fechaSalida: '2025-11-01',
                fechaDevolucion: null,
                estado: 'Prestado'
            }
        ]
    };

    rows: any[] = [];

    // Estado del visor PDF
    showPdf = false;
    pdfSrc: SafeResourceUrl | null = null;

    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit(): void {
        this.loadSource(this.selectedSource);
    }

    onSourceChange() {
        this.loadSource(this.selectedSource);
    }

    onColumnsChange() {
        // Si el usuario selecciona columnas, respétalas; si no, mostrar todas
        if (this.selectedColumnFields?.length) {
            this.displayedColumns = this.availableColumns.filter((c) => this.selectedColumnFields.includes(c.field));
        } else {
            this.displayedColumns = [...this.availableColumns];
        }
    }

    apply() {
        const data = this.dataMap[this.selectedSource] || [];
        const q = this.quickFilter?.toLowerCase().trim();
        if (!q) {
            this.rows = [...data];
            return;
        }

        const cols = this.availableColumns.map((c) => c.field);
        this.rows = data.filter((r) => cols.some((f) => String(r[f] ?? '').toLowerCase().includes(q)));
    }

    private loadSource(source: string) {
        const data = this.dataMap[source] || [];
        this.rows = [...data];
        this.availableColumns = this.deriveColumns(data);
        // Reiniciar selección de columnas al cambiar la fuente
        this.selectedColumnFields = [];
        this.displayedColumns = [...this.availableColumns];
        this.quickFilter = '';
    }

    private deriveColumns(data: any[]): Column[] {
        const first = data[0];
        if (!first) return [];
        return Object.keys(first).map((k) => ({ field: k, header: this.toHeader(k) }));
    }

    private toHeader(key: string): string {
        // Convierte camelCase / snake_case a Título Amigable
        const spaced = key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .trim();
        return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    }

    // Stubs de exportación
    exportXLSX() {
        const data = this.currentExportData();
        const sheet = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, this.toHeader(this.selectedSource));
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `reporte_${this.selectedSource}.xlsx`);
    }

    exportCSV() {
        const data = this.currentExportData();
        const sheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(sheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `reporte_${this.selectedSource}.csv`);
    }

    exportJSON() {
        const data = this.currentExportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, `reporte_${this.selectedSource}.json`);
    }

    viewPDF() {
        const docDef = this.buildPdfDefinition();
        (pdfMake as any).createPdf(docDef).getBlob((blob: Blob) => {
            const url = URL.createObjectURL(blob);
            this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.showPdf = true;
        });
    }

    private currentExportData() {
        const fields = this.displayedColumns.map((c) => c.field);
        return this.rows.map((r) =>
            fields.reduce((acc, f) => {
                acc[f] = r[f];
                return acc;
            }, {} as any)
        );
    }

    private buildPdfDefinition() {
        const headers = this.displayedColumns.map((c) => ({ text: c.header, style: 'tableHeader' }));
        const body = this.rows.map((row) => this.displayedColumns.map((c) => String(row[c.field] ?? '')));
        return {
            info: {
                title: `Reporte ${this.toHeader(this.selectedSource)}`,
                author: 'InventarioPlusUI'
            },
            content: [
                { text: `Reporte ${this.toHeader(this.selectedSource)}`, style: 'title', margin: [0, 0, 0, 10] },
                {
                    table: {
                        headerRows: 1,
                        widths: this.displayedColumns.map(() => 'auto'),
                        body: [headers, ...body]
                    },
                    layout: 'lightHorizontalLines'
                }
            ],
            styles: {
                title: { fontSize: 14, bold: true },
                tableHeader: { bold: true }
            },
            pageMargins: [40, 40, 40, 40]
        };
    }
}
 
