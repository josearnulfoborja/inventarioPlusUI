
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
            <div>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border rounded">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-left">ID</th>
                                <th class="px-4 py-3 text-left">Cliente</th>
                                <th class="px-4 py-3 text-left">Equipo</th>
                                <th class="px-4 py-3 text-left">Especialista</th>
                                <th class="px-4 py-3 text-left">Fecha Entrega</th>
                                <th class="px-4 py-3 text-left">Fecha Prevista</th>
                                <th class="px-4 py-3 text-left">Fecha Devolución</th>
                                <th class="px-4 py-3 text-left">Costo Total</th>
                                <th class="px-4 py-3 text-left">Estado</th>
                                <th class="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let prestamo of prestamos" class="border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-mono text-sm bg-gray-100 rounded">{{ prestamo.idPrestamo }}</td>
                                <td class="px-4 py-3">{{ prestamo.cliente.nombre }} {{ prestamo.cliente.apellido }}</td>
                                <td class="px-4 py-3">{{ prestamo.equipo.nombre }}</td>
                                <td class="px-4 py-3">{{ prestamo.especialista.nombre }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaEntrega | date:'shortDate' }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaPrevista | date:'shortDate' }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaDevolucion | date:'shortDate' }}</td>
                                <td class="px-4 py-3">{{ prestamo.costoTotal | currency:'USD' }}</td>
                                <td class="px-4 py-3">
                                    <span class="badge" [ngClass]="{
                                        'badge-success': prestamo.estadoPrestamo === 'ACTIVO',
                                        'badge-warning': prestamo.estadoPrestamo === 'VENCIDO',
                                        'badge-info': prestamo.estadoPrestamo === 'DEVUELTO',
                                        'badge-error': prestamo.estadoPrestamo === 'CANCELADO'
                                    }">{{ prestamo.estadoPrestamo }}</span>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <div class="flex gap-2 justify-center">
                                        <button (click)="verDetalle(prestamo)" class="text-blue-500 hover:text-blue-700" title="Ver detalles">
                                            <i class="pi pi-eye"></i>
                                        </button>
                                        <button (click)="editarPrestamo(prestamo)" class="text-yellow-500 hover:text-yellow-700" title="Editar">
                                            <i class="pi pi-pencil"></i>
                                        </button>
                                        <button (click)="eliminarPrestamo(prestamo.idPrestamo)" class="text-red-500 hover:text-red-700" title="Eliminar">
                                            <i class="pi pi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr *ngIf="prestamos.length === 0">
                                <td colspan="10" class="px-4 py-8 text-center text-gray-500">No se encontraron préstamos</td>
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
                        <div><strong>ID:</strong> {{ prestamoSeleccionado?.idPrestamo }}</div>
                        <div><strong>ID:</strong> {{ prestamoSeleccionado?.idPrestamo }}</div>
                        <div><strong>Cliente:</strong> {{ prestamoSeleccionado?.cliente?.nombre }} {{ prestamoSeleccionado?.cliente?.apellido }}</div>
                        <div><strong>Equipo:</strong> {{ prestamoSeleccionado?.equipo?.nombre }}</div>
                        <div><strong>Especialista:</strong> {{ prestamoSeleccionado?.especialista?.nombre }}</div>
                        <div><strong>Fecha Entrega:</strong> {{ prestamoSeleccionado?.fechaEntrega | date:'shortDate' }}</div>
                        <div><strong>Fecha Prevista:</strong> {{ prestamoSeleccionado?.fechaPrevista | date:'shortDate' }}</div>
                        <div><strong>Fecha Devolución:</strong> {{ prestamoSeleccionado?.fechaDevolucion | date:'shortDate' }}</div>
                        <div><strong>Costo Total:</strong> {{ prestamoSeleccionado?.costoTotal | currency:'USD' }}</div>
                        <div><strong>Estado:</strong> {{ prestamoSeleccionado?.estadoPrestamo }}</div>
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
                            <label class="block mb-1">Cliente (ID)</label>
                            <input type="number" class="input input-bordered w-full" placeholder="ID Cliente" [(ngModel)]="nuevoPrestamo.cliente!.idCliente" name="clienteId" required>
                        </div>
                        <div class="mb-4">
                            <label class="block mb-1">Equipo (ID)</label>
                            <input type="number" class="input input-bordered w-full" placeholder="ID Equipo" [(ngModel)]="nuevoPrestamo.equipo!.idEquipo" name="equipoId" required>
                        </div>
                        <div class="mb-4">
                            <label class="block mb-1">Especialista (ID)</label>
                            <input type="number" class="input input-bordered w-full" placeholder="ID Especialista" [(ngModel)]="nuevoPrestamo.especialista!.idEspecialista" name="especialistaId" required>
                        </div>
                        <div class="mb-4 flex gap-2">
                            <div class="flex-1">
                                <label class="block mb-1">Fecha Entrega</label>
                                <input type="date" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.fechaEntrega" name="fechaEntrega" required>
                            </div>
                            <div class="flex-1">
                                <label class="block mb-1">Fecha Prevista</label>
                                <input type="date" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.fechaPrevista" name="fechaPrevista" required>
                            </div>
                            <div class="flex-1">
                                <label class="block mb-1">Fecha Devolución</label>
                                <input type="date" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.fechaDevolucion" name="fechaDevolucion">
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="block mb-1">Costo Total</label>
                            <input type="number" class="input input-bordered w-full" placeholder="Costo Total" [(ngModel)]="nuevoPrestamo.costoTotal" name="costoTotal" required>
                        </div>
                        <div class="mb-4">
                            <label class="block mb-1">Estado</label>
                            <select class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.estadoPrestamo" name="estadoPrestamo" required>
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="VENCIDO">VENCIDO</option>
                                <option value="DEVUELTO">DEVUELTO</option>
                                <option value="CANCELADO">CANCELADO</option>
                            </select>
                        </div>
                        <div class="flex justify-end gap-2 mt-6">
                            <button type="button" class="btn btn-outline" (click)="cerrarModalNuevo()">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        `,
    styleUrls: []
})
export class Prestamos implements OnInit {
    prestamos: Prestamo[] = [];
    modalNuevo: boolean = false;
    modalDetalle: boolean = false;
    modalEditar: boolean = false;
    prestamoSeleccionado: Prestamo | null = null;
    nuevoPrestamo: Partial<Prestamo> = {
        cliente: {
            idCliente: 0,
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            direccion: '',
            tipoDocumento: 'DUI',
            numeroDocumento: '',
            activo: true
        },
        equipo: {
            idEquipo: 0,
            nombre: '',
            codigo: '',
            marca: '',
            modelo: '',
            categoria: '',
            estado: 'DISPONIBLE',
            activo: true
        },
    especialista: { idEspecialista: 0, nombre: '' },
        fechaEntrega: '',
        fechaDevolucion: '',
        fechaPrevista: '',
        costoTotal: 0,
        estadoPrestamo: 'ACTIVO'
    };
    editarPrestamoData: Partial<Prestamo> = {};

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
        this.nuevoPrestamo = {
            cliente: {
                idCliente: 0,
                nombre: '',
                apellido: '',
                email: '',
                telefono: '',
                direccion: '',
                tipoDocumento: 'DUI',
                numeroDocumento: '',
                activo: true
            },
            equipo: {
                idEquipo: 0,
                nombre: '',
                codigo: '',
                marca: '',
                modelo: '',
                categoria: '',
                estado: 'DISPONIBLE',
                activo: true
            },
            especialista: { idEspecialista: 0, nombre: '' },
            fechaEntrega: '',
            fechaDevolucion: '',
            fechaPrevista: '',
            costoTotal: 0,
            estadoPrestamo: 'ACTIVO'
        };
    }
    cerrarModalNuevo() {
        this.modalNuevo = false;
        this.nuevoPrestamo = {
            cliente: {
                idCliente: 0,
                nombre: '',
                apellido: '',
                email: '',
                telefono: '',
                direccion: '',
                tipoDocumento: 'DUI',
                numeroDocumento: '',
                activo: true
            },
            equipo: {
                idEquipo: 0,
                nombre: '',
                codigo: '',
                marca: '',
                modelo: '',
                categoria: '',
                estado: 'DISPONIBLE',
                activo: true
            },
            especialista: { idEspecialista: 0, nombre: '' },
            fechaEntrega: '',
            fechaDevolucion: '',
            fechaPrevista: '',
            costoTotal: 0,
            estadoPrestamo: 'ACTIVO'
        };
    }

    guardarPrestamo() {
        this.prestamoService.crearPrestamo(this.nuevoPrestamo as Prestamo).subscribe({
            next: () => {
                this.cargarPrestamos();
                this.cerrarModalNuevo();
            },
            error: () => {
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
        this.editarPrestamoData = { ...prestamo };
        this.modalEditar = true;
    }
    cerrarModalEditar() {
        this.modalEditar = false;
        this.editarPrestamoData = {};
    }
    guardarEdicionPrestamo() {
        if (!this.editarPrestamoData.idPrestamo) return;
        this.prestamoService.actualizarPrestamo(this.editarPrestamoData.idPrestamo, this.editarPrestamoData as Prestamo).subscribe({
            next: () => {
                this.cargarPrestamos();
                this.cerrarModalEditar();
            },
            error: () => {
                alert('Error al editar el préstamo');
            }
        });
    }

    eliminarPrestamo(id: number) {
        if (confirm('¿Está seguro de eliminar este préstamo?')) {
            this.prestamoService.eliminarPrestamo(id).subscribe({
                next: () => {
                    this.cargarPrestamos();
                },
                error: () => {
                    alert('Error al eliminar el préstamo');
                }
            });
        }
    }
}
