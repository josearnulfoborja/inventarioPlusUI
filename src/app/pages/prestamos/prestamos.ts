
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
        <div class="card">
            <div class="card-header flex justify-between items-center">
                <h2 class="text-2xl font-bold">Gestión de Préstamos</h2>
                <button (click)="abrirModalNuevo()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    <i class="pi pi-plus"></i> Nuevo Préstamo
                </button>
            </div>

            <!-- Tabla de préstamos -->
            <div class="p-4">
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-left">ID</th>
                                <th class="px-4 py-3 text-left">Fecha Préstamo</th>
                                <th class="px-4 py-3 text-left">Fecha Devolución Estimada</th>
                                <th class="px-4 py-3 text-left">Usuario</th>
                                <th class="px-4 py-3 text-left">Equipo</th>
                                <th class="px-4 py-3 text-left">Estado</th>
                                <th class="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let prestamo of prestamos" class="border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-mono text-sm bg-gray-100 rounded">{{ prestamo.id }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaPrestamo | date:'short' }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaDevolucionEstimada | date:'short' }}</td>
                                <td class="px-4 py-3">{{ prestamo.usuarioRegistroId }}</td>
                                <td class="px-4 py-3">{{ prestamo.equipoId }}</td>
                                <td class="px-4 py-3">
                                    <span [ngClass]="{
                                        'badge badge-success': prestamo.estado === 'ACTIVO',
                                        'badge badge-warning': prestamo.estado === 'VENCIDO',
                                        'badge badge-info': prestamo.estado === 'DEVUELTO',
                                        'badge badge-error': prestamo.estado === 'CANCELADO'
                                    }">{{ prestamo.estado }}</span>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <div class="flex gap-2 justify-center">
                                        <button (click)="verDetalle(prestamo)" class="text-blue-500 hover:text-blue-700" title="Ver detalles">
                                            <i class="pi pi-eye"></i>
                                        </button>
                                        <button (click)="editarPrestamo(prestamo)" class="text-yellow-500 hover:text-yellow-700" title="Editar">
                                            <i class="pi pi-pencil"></i>
                                        </button>
                                        <button (click)="eliminarPrestamo(prestamo.id!)" class="text-red-500 hover:text-red-700" title="Eliminar">
                                            <i class="pi pi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr *ngIf="prestamos.length === 0">
                                <td colspan="7" class="px-4 py-8 text-center text-gray-500">No se encontraron préstamos</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt-4 text-sm text-gray-600">Total de préstamos: {{ prestamos.length }}</div>
            </div>

            <!-- Modal de detalles -->
            <div *ngIf="modalDetalle" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
                    <h3 class="text-lg font-bold mb-4">Detalles del Préstamo</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>ID:</strong> {{ prestamoSeleccionado?.id }}</div>
                        <div><strong>Fecha Préstamo:</strong> {{ prestamoSeleccionado?.fechaPrestamo | date:'short' }}</div>
                        <div><strong>Fecha Devolución Estimada:</strong> {{ prestamoSeleccionado?.fechaDevolucionEstimada | date:'short' }}</div>
                        <div><strong>Fecha Devolución Real:</strong> {{ prestamoSeleccionado?.fechaDevolucionReal | date:'short' }}</div>
                        <div><strong>Usuario:</strong> {{ prestamoSeleccionado?.usuarioRegistroId }}</div>
                        <div><strong>Equipo:</strong> {{ prestamoSeleccionado?.equipoId }}</div>
                        <div><strong>Estado:</strong> {{ prestamoSeleccionado?.estado }}</div>
                        <div><strong>Condición al Prestar:</strong> {{ prestamoSeleccionado?.condicion_al_prestar }}</div>
                        <div><strong>Condición al Devolver:</strong> {{ prestamoSeleccionado?.condicion_al_devolver }}</div>
                        <div><strong>Observaciones:</strong> {{ prestamoSeleccionado?.observaciones }}</div>
                        <div><strong>Inspección Requerida:</strong> {{ prestamoSeleccionado?.inspeccion_requerida }}</div>
                        <div><strong>Inspección Realizada:</strong> {{ prestamoSeleccionado?.inspeccion_realizada }}</div>
                        <div><strong>Especialista Asignado:</strong> {{ prestamoSeleccionado?.especialista_asignado_id }}</div>
                        <div><strong>Fecha Inspección Programada:</strong> {{ prestamoSeleccionado?.fecha_inspeccion_programada | date:'short' }}</div>
                        <div><strong>Estado Inspección:</strong> {{ prestamoSeleccionado?.estado_inspeccion }}</div>
                        <div><strong>Observaciones Inspección:</strong> {{ prestamoSeleccionado?.observaciones_inspeccion }}</div>
                        <div><strong>Fecha Creación:</strong> {{ prestamoSeleccionado?.fecha_creacion | date:'short' }}</div>
                        <div><strong>Fecha Actualización:</strong> {{ prestamoSeleccionado?.fecha_actualizacion | date:'short' }}</div>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <button type="button" class="btn btn-outline" (click)="cerrarModalDetalle()">Cerrar</button>
                    </div>
                </div>
            </div>

            <!-- Modal para nuevo préstamo (funcional) -->
            <div *ngIf="modalNuevo" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
                    <h3 class="text-lg font-bold mb-4">Nuevo Préstamo</h3>
                    <form (ngSubmit)="guardarPrestamo()">
                        <div class="mb-4">
                            <label class="block mb-1">Usuario</label>
                            <input type="number" class="input input-bordered w-full" placeholder="ID Usuario" [(ngModel)]="nuevoPrestamo.usuarioRegistroId" name="usuarioRegistroId" required>
                        </div>
                        <div class="mb-4">
                            <label class="block mb-1">Equipo</label>
                            <input type="number" class="input input-bordered w-full" placeholder="ID Equipo" [(ngModel)]="nuevoPrestamo.equipoId" name="equipoId" required>
                        </div>
                        <div class="mb-4 flex gap-2">
                            <div class="flex-1">
                                <label class="block mb-1">Fecha Préstamo</label>
                                <input type="date" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.fechaPrestamo" name="fechaPrestamo" required>
                            </div>
                            <div class="flex-1">
                                <label class="block mb-1">Fecha Devolución Estimada</label>
                                <input type="date" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.fechaDevolucionEstimada" name="fechaDevolucionEstimada" required>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="block mb-1">Estado</label>
                            <select class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.estado" name="estado" required>
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="VENCIDO">VENCIDO</option>
                                <option value="DEVUELTO">DEVUELTO</option>
                                <option value="CANCELADO">CANCELADO</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block mb-1">Observaciones</label>
                            <textarea class="input input-bordered w-full" rows="2" [(ngModel)]="nuevoPrestamo.observaciones" name="observaciones"></textarea>
                        </div>
                        <div class="flex justify-end gap-2 mt-6">
                            <button type="button" class="btn btn-outline" (click)="cerrarModalNuevo()">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar</button>
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
    modalNuevo: boolean = false;
    modalDetalle: boolean = false;
    prestamoSeleccionado: Prestamo | null = null;
    nuevoPrestamo: Partial<Prestamo> = {};

    constructor(private prestamoService: PrestamoService) {}

    ngOnInit(): void {
        this.cargarPrestamos();
    }

    cargarPrestamos(): void {
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
        this.nuevoPrestamo = {};
    }
    cerrarModalNuevo() {
        this.modalNuevo = false;
        this.nuevoPrestamo = {};
    }

    guardarPrestamo() {
        // Convertir fechas a tipo Date si vienen como string
        if (typeof this.nuevoPrestamo.fechaPrestamo === 'string') {
            this.nuevoPrestamo.fechaPrestamo = new Date(this.nuevoPrestamo.fechaPrestamo);
        }
        if (typeof this.nuevoPrestamo.fechaDevolucionEstimada === 'string') {
            this.nuevoPrestamo.fechaDevolucionEstimada = new Date(this.nuevoPrestamo.fechaDevolucionEstimada);
        }
        this.prestamoService.crearPrestamo(this.nuevoPrestamo as Prestamo).subscribe({
            next: () => {
                this.cargarPrestamos();
                this.cerrarModalNuevo();
            },
            error: () => {
                // Manejo de error simple
                alert('Error al crear el préstamo');
            }
        });
    }

    verDetalle(prestamo: Prestamo) {
        this.prestamoSeleccionado = prestamo;
        this.modalDetalle = true;
    }
    cerrarModalDetalle() {
        this.modalDetalle = false;
        this.prestamoSeleccionado = null;
    }

    editarPrestamo(prestamo: Prestamo) {
        // Lógica para editar préstamo (por implementar)
    }
    eliminarPrestamo(id: number) {
        // Lógica para eliminar préstamo (por implementar)
    }
}
