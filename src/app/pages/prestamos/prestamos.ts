
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
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Gestión de Préstamos</h2>
                    <button class="btn btn-primary" (click)="abrirModalNuevo()">+ Nuevo Préstamo</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border rounded">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-left">ID</th>
                                <th class="px-4 py-3 text-left">Cliente</th>
                                <th class="px-4 py-3 text-left">Equipo</th>
                                <th class="px-4 py-3 text-left">Especialista</th>
                                <th class="px-4 py-3 text-left">Fecha Préstamo</th>
                                <th class="px-4 py-3 text-left">Fecha Entrega</th>
                                <th class="px-4 py-3 text-left">Fecha Prevista</th>
                                <th class="px-4 py-3 text-left">Fecha Devolución</th>
                                <th class="px-4 py-3 text-left">Costo Total</th>
                                <th class="px-4 py-3 text-left">Estado Préstamo</th>
                                <th class="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let prestamo of prestamos" class="border-b hover:bg-gray-50">
                                <td class="px-4 py-3 font-mono text-sm bg-gray-100 rounded">{{ prestamo.idPrestamo }}</td>
                                <td class="px-4 py-3">{{ prestamo.cliente.idCliente }}</td>
                                <td class="px-4 py-3">{{ prestamo.equipo.idEquipo }}</td>
                                <td class="px-4 py-3">{{ prestamo.especialista.idEspecialista }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaEntrega | date:'shortDate' }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaPrevista | date:'shortDate' }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaDevolucion | date:'shortDate' }}</td>
                                <td class="px-4 py-3">{{ prestamo.costoTotal | currency:'USD' }}</td>
                                <td class="px-4 py-3">{{ prestamo.estadoPrestamo }}</td>
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
                <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
                    <h3 class="text-lg font-bold mb-4">Nuevo Préstamo</h3>
                    <form (ngSubmit)="guardarPrestamo()">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block mb-1">ID Cliente</label>
                                <input type="number" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.cliente!.idCliente" name="clienteId" required>
                            </div>
                            <div>
                                <label class="block mb-1">ID Equipo</label>
                                <input type="number" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.equipo!.idEquipo" name="equipoId" required>
                            </div>
                            <div>
                                <label class="block mb-1">ID Especialista</label>
                                <input type="number" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.especialista!.idEspecialista" name="especialistaId" required>
                            </div>
                            <div>
                                <label class="block mb-1">Fecha Entrega</label>
                                <input type="datetime-local" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.fechaEntrega" name="fechaEntrega">
                            </div>
                            <div>
                                <label class="block mb-1">Fecha Prevista</label>
                                <input type="datetime-local" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.fechaPrevista" name="fechaPrevista">
                            </div>
                            <div>
                                <label class="block mb-1">Fecha Devolución</label>
                                <input type="datetime-local" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.fechaDevolucion" name="fechaDevolucion">
                            </div>
                            <div>
                                <label class="block mb-1">Costo Total</label>
                                <input type="number" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.costoTotal" name="costoTotal" required>
                            </div>
                            <div>
                                <label class="block mb-1">Estado Préstamo</label>
                                <input type="text" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.estadoPrestamo" name="estadoPrestamo" required>
                            </div>
                            <!-- Puedes agregar aquí los campos extra si los agregas al modelo -->
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
        especialista: {
            idEspecialista: 0,
            nombre: ''
        },
        fechaEntrega: '',
        fechaDevolucion: '',
        fechaPrevista: '',
        costoTotal: 0,
        estadoPrestamo: 'ACTIVO'
    };
    editarPrestamoData: Partial<Prestamo> = {};

    constructor(private readonly prestamoService: PrestamoService) {}

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
            especialista: {
                idEspecialista: 0,
                nombre: ''
            },
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

    limpiarPayloadPrestamo(payload: any): any {
        // Limpia strings vacíos y los convierte a null, recursivo para objetos anidados
        if (Array.isArray(payload)) {
            return payload.map((v) => this.limpiarPayloadPrestamo(v));
        } else if (payload && typeof payload === 'object') {
            const obj: any = {};
            for (const key of Object.keys(payload)) {
                const value = payload[key];
                if (typeof value === 'string' && value.trim() === '') {
                    obj[key] = null;
                } else if (value && typeof value === 'object') {
                    obj[key] = this.limpiarPayloadPrestamo(value);
                } else {
                    obj[key] = value;
                }
            }
            return obj;
        }
        return payload;
    }

    guardarPrestamo() {
        // Validar campos obligatorios
        if (!this.nuevoPrestamo.cliente?.idCliente || !this.nuevoPrestamo.equipo?.idEquipo || !this.nuevoPrestamo.especialista?.idEspecialista) {
            alert('Todos los campos de relación son obligatorios');
            return;
        }
        // Convertir fechas a formato ISO si existen
        const payload: any = {
            ...this.nuevoPrestamo,
            fechaEntrega: this.nuevoPrestamo.fechaEntrega ? new Date(this.nuevoPrestamo.fechaEntrega).toISOString().split('T')[0] : null,
            fechaDevolucion: this.nuevoPrestamo.fechaDevolucion ? new Date(this.nuevoPrestamo.fechaDevolucion).toISOString().split('T')[0] : null,
            fechaPrevista: this.nuevoPrestamo.fechaPrevista ? new Date(this.nuevoPrestamo.fechaPrevista).toISOString().split('T')[0] : null,
            cliente: { idCliente: this.nuevoPrestamo.cliente.idCliente },
            equipo: { idEquipo: this.nuevoPrestamo.equipo.idEquipo },
            especialista: { idEspecialista: this.nuevoPrestamo.especialista.idEspecialista }
        };
        const payloadLimpio = this.limpiarPayloadPrestamo(payload);
        this.prestamoService.crearPrestamo(payloadLimpio as Prestamo).subscribe({
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
        // Validar campos obligatorios
        if (!this.editarPrestamoData.cliente?.idCliente || !this.editarPrestamoData.equipo?.idEquipo || !this.editarPrestamoData.especialista?.idEspecialista) {
            alert('Todos los campos de relación son obligatorios');
            return;
        }
        // Convertir fechas a formato ISO si existen
        const payload: any = {
            ...this.editarPrestamoData,
            fechaEntrega: this.editarPrestamoData.fechaEntrega ? new Date(this.editarPrestamoData.fechaEntrega).toISOString().split('T')[0] : null,
            fechaDevolucion: this.editarPrestamoData.fechaDevolucion ? new Date(this.editarPrestamoData.fechaDevolucion).toISOString().split('T')[0] : null,
            fechaPrevista: this.editarPrestamoData.fechaPrevista ? new Date(this.editarPrestamoData.fechaPrevista).toISOString().split('T')[0] : null,
            cliente: { idCliente: this.editarPrestamoData.cliente.idCliente },
            equipo: { idEquipo: this.editarPrestamoData.equipo.idEquipo },
            especialista: { idEspecialista: this.editarPrestamoData.especialista.idEspecialista }
        };
        const payloadLimpio = this.limpiarPayloadPrestamo(payload);
        this.prestamoService.actualizarPrestamo(this.editarPrestamoData.idPrestamo, payloadLimpio as Prestamo).subscribe({
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
