
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamoService } from '@/core/services/prestamo.service';
import { Prestamo } from '@/core/models/inventario.model';

@Component({
    selector: 'app-prestamos',
    standalone: true,
        imports: [CommonModule, FormsModule],
    template: `
        <div class="container mx-auto py-8">
            <h2 class="text-2xl font-bold mb-6 text-primary">Gestión de Préstamos</h2>
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                    <div>
                        <input type="text" class="input input-bordered w-full md:w-64" placeholder="Buscar por cliente o equipo" [(ngModel)]="filtroBusqueda">
                    </div>
                    <button class="btn btn-primary" (click)="abrirModalNuevo()">Nuevo Préstamo</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Equipo</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Fin</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let prestamo of prestamos">
                                <td>{{ prestamo.id }}</td>
                                <td>{{ prestamo.cliente?.nombre }}</td>
                                <td>{{ prestamo.equipo?.nombre }}</td>
                                <td>{{ prestamo.fechaPrestamo | date:'shortDate' }}</td>
                                <td>{{ prestamo.fechaDevolucionEstimada | date:'shortDate' }}</td>
                                <td>
                                                        <span [ngClass]="{
                                                            'badge badge-success': prestamo.estado === 'ACTIVO',
                                                            'badge badge-warning': prestamo.estado === 'VENCIDO',
                                                            'badge badge-info': prestamo.estado === 'DEVUELTO',
                                                            'badge badge-error': prestamo.estado === 'CANCELADO'
                                                        }">{{ prestamo.estado }}</span>
                                </td>
                                <td>
                                    <button class="btn btn-xs btn-outline" (click)="verDetalle(prestamo)">Ver</button>
                                    <button class="btn btn-xs btn-outline btn-success" (click)="registrarDevolucion(prestamo)">Devolver</button>
                                    <button class="btn btn-xs btn-outline btn-warning" (click)="renovarPrestamo(prestamo)">Renovar</button>
                                    <button class="btn btn-xs btn-outline btn-error" (click)="cancelarPrestamo(prestamo)">Cancelar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="flex justify-end mt-4">
                    <button class="btn btn-outline btn-sm mr-2" (click)="exportar('excel')">Exportar Excel</button>
                    <button class="btn btn-outline btn-sm" (click)="exportar('pdf')">Exportar PDF</button>
                </div>
            </div>
            <!-- Modal para nuevo préstamo (base, no funcional aún) -->
            <div *ngIf="modalNuevo" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
                    <h3 class="text-lg font-bold mb-4">Nuevo Préstamo</h3>
                    <form>
                        <!-- Campos base, para completar -->
                        <div class="mb-4">
                            <label class="block mb-1">Cliente</label>
                            <input type="text" class="input input-bordered w-full" placeholder="Nombre del cliente">
                        </div>
                        <div class="mb-4">
                            <label class="block mb-1">Equipo</label>
                            <input type="text" class="input input-bordered w-full" placeholder="Nombre del equipo">
                        </div>
                        <div class="mb-4 flex gap-2">
                            <div class="flex-1">
                                <label class="block mb-1">Fecha Inicio</label>
                                <input type="date" class="input input-bordered w-full">
                            </div>
                            <div class="flex-1">
                                <label class="block mb-1">Fecha Fin</label>
                                <input type="date" class="input input-bordered w-full">
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 mt-6">
                            <button type="button" class="btn btn-outline" (click)="cerrarModalNuevo()">Cancelar</button>
                            <button type="submit" class="btn btn-primary" disabled>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    styleUrls: []
})
export class Prestamos implements OnInit {
    prestamos: Prestamo[] = [];
    filtroBusqueda: string = '';
    modalNuevo: boolean = false;

    constructor(private prestamoService: PrestamoService) {}

    ngOnInit(): void {
        this.cargarPrestamos();
    }

    cargarPrestamos(): void {
        // Lógica base para cargar préstamos (mock, para integración futura)
        this.prestamoService.getPrestamos().subscribe({
            next: (resp) => {
                this.prestamos = resp.data || [];
            },
            error: () => {
                this.prestamos = [];
            }
        });
    }

    abrirModalNuevo() {
        this.modalNuevo = true;
    }
    cerrarModalNuevo() {
        this.modalNuevo = false;
    }

    verDetalle(prestamo: Prestamo) {
        // Navegación o modal de detalle (por implementar)
    }
    registrarDevolucion(prestamo: Prestamo) {
        // Acción de devolución (por implementar)
    }
    renovarPrestamo(prestamo: Prestamo) {
        // Acción de renovación (por implementar)
    }
    cancelarPrestamo(prestamo: Prestamo) {
        // Acción de cancelación (por implementar)
    }
    exportar(tipo: 'excel' | 'pdf') {
        // Exportar préstamos (por implementar)
    }
}
