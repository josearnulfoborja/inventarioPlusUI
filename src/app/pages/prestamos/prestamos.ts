
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamoService } from '@/core/services/prestamo.service';
import { ClienteService } from '@/core/services/cliente.service';
import { EquipoService } from '@/core/services/equipo.service';
import { EspecialistasService } from '@/pages/especialistas/especialistas.service';
import { Prestamo, Mcodigo } from '@/core/models/inventario.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { McodigosService } from '@/core/services/mcodigos.service';

@Component({
    selector: 'app-prestamos',
    standalone: true,
        imports: [CommonModule, FormsModule],
        template: `
            <div>
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Gestión de Préstamos</h2>
                    <div class="flex items-center gap-2">
                        <button class="btn btn-primary" (click)="abrirModalNuevo()">+ Nuevo Préstamo</button>
                        <button class="btn btn-outline" (click)="forceReloadNames()">Forzar cargar nombres</button>
                    </div>
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
                                <td class="px-4 py-3">{{ getClienteNombreFromPrestamo(prestamo) }}</td>
                                <td class="px-4 py-3">{{ getEquipoNombreFromPrestamo(prestamo) }}</td>
                                <td class="px-4 py-3">{{ getEspecialistaNombreFromPrestamo(prestamo) }} <span class="text-xs text-gray-400">({{ getEspecialistaIdFromPrestamo(prestamo) }})</span></td>
                                <td class="px-4 py-3">{{ prestamo.fechaPrestamo | date:'shortDate' }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaEntrega | date:'shortDate' }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaPrevista | date:'shortDate' }}</td>
                                <td class="px-4 py-3">{{ prestamo.fechaDevolucion | date:'shortDate' }}</td>
                                <td class="px-4 py-3">{{ prestamo.costoTotal | currency:'USD' }}</td>
                                <td class="px-4 py-3">{{ getEstadoPrestamoNombre(prestamo) }}</td>
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
                                <td colspan="11" class="px-4 py-8 text-center text-gray-500">No se encontraron préstamos</td>
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
                        <div><strong>Cliente:</strong> {{ getClienteNombreFromPrestamo(prestamoSeleccionado) }}</div>
                        <div><strong>Equipo:</strong> {{ getEquipoNombreFromPrestamo(prestamoSeleccionado) }}</div>
                        <div><strong>Especialista:</strong> {{ getEspecialistaNombreFromPrestamo(prestamoSeleccionado) }}</div>
                        	<div><strong>Fecha Préstamo:</strong> {{ prestamoSeleccionado?.fechaPrestamo | date:'shortDate' }}</div>
                        <div><strong>Fecha Entrega:</strong> {{ prestamoSeleccionado?.fechaEntrega | date:'shortDate' }}</div>
                        <div><strong>Fecha Prevista:</strong> {{ prestamoSeleccionado?.fechaPrevista | date:'shortDate' }}</div>
                        <div><strong>Fecha Devolución:</strong> {{ prestamoSeleccionado?.fechaDevolucion | date:'shortDate' }}</div>
                        <div><strong>Costo Total:</strong> {{ prestamoSeleccionado?.costoTotal | currency:'USD' }}</div>
                        <div><strong>Estado:</strong> {{ prestamoSeleccionado?.estadoPrestamo }}</div>
                    </div>
                    <div class="mt-4">
                        <h4 class="text-sm font-semibold mb-2">Raw JSON</h4>
                        <pre class="text-xs bg-gray-100 p-2 rounded max-h-64 overflow-auto">{{ prestamoSeleccionado | json }}</pre>
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
                            <div class="md:col-span-2">
                                <label class="block mb-1">Fecha Préstamo</label>
                                <input type="datetime-local" class="input input-bordered w-full" [(ngModel)]="nuevoPrestamo.fechaPrestamo" name="fechaPrestamo" required>
                            </div>
                            <div>
                                <label class="block mb-1">Cliente</label>
                                <select class="select select-bordered w-full" [(ngModel)]="nuevoPrestamo.cliente!.idCliente" name="clienteId" required>
                                    <option [ngValue]="0" disabled>Seleccione cliente</option>
                                    <option *ngFor="let c of clientesLista" [ngValue]="c.idCliente ?? c.id ?? c.id_client">
                                        {{ (c.nombre ?? c.name ?? '') + (c.apellido ? ' ' + c.apellido : '') }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block mb-1">Equipo</label>
                                <select class="select select-bordered w-full" [(ngModel)]="nuevoPrestamo.equipo!.idEquipo" name="equipoId" required>
                                    <option [ngValue]="0" disabled>Seleccione equipo</option>
                                    <option *ngFor="let e of equiposLista" [ngValue]="e.idEquipo ?? e.id ?? e.id_equipo">
                                        {{ e.nombre ?? e.name ?? e.codigo ?? ('#' + (e.idEquipo ?? e.id ?? e.id_equipo)) }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block mb-1">Especialista</label>
                                <select class="select select-bordered w-full" [(ngModel)]="nuevoPrestamo.especialista!.idEspecialista" name="especialistaId" required>
                                    <option [ngValue]="0" disabled>Seleccione especialista</option>
                                    <option *ngFor="let s of especialistasLista" [ngValue]="s.idEspecialista ?? s.id ?? s.id_especialista">
                                        {{ s.nombre ?? s.name ?? ('#' + (s.idEspecialista ?? s.id ?? s.id_especialista)) }}
                                    </option>
                                </select>
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
                                <select class="select select-bordered w-full" [(ngModel)]="nuevoPrestamo.estadoPrestamoId" name="estadoPrestamoId" required>
                                    <option [ngValue]="null" disabled>Seleccione estado</option>
                                    <option *ngFor="let e of estadosPrestamo" [ngValue]="e.id">{{ e.nombre }}</option>
                                </select>
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

            <!-- Modal para editar préstamo -->
            <div *ngIf="modalEditar" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
                    <h3 class="text-lg font-bold mb-4">Editar Préstamo</h3>
                    <form (ngSubmit)="guardarEdicionPrestamo()">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <label class="block mb-1">Fecha Préstamo</label>
                                <input type="datetime-local" class="input input-bordered w-full" [(ngModel)]="editarPrestamoData.fechaPrestamo" name="editFechaPrestamo" required>
                            </div>
                            <div>
                                <label class="block mb-1">Cliente</label>
                                <select class="select select-bordered w-full" [(ngModel)]="editarPrestamoData.cliente!.idCliente" name="editClienteId" required>
                                    <option [ngValue]="0" disabled>Seleccione cliente</option>
                                    <option *ngFor="let c of clientesLista" [ngValue]="c.idCliente ?? c.id ?? c.id_client">
                                        {{ (c.nombre ?? c.name ?? '') + (c.apellido ? ' ' + c.apellido : '') }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block mb-1">Equipo</label>
                                <select class="select select-bordered w-full" [(ngModel)]="editarPrestamoData.equipo!.idEquipo" name="editEquipoId" required>
                                    <option [ngValue]="0" disabled>Seleccione equipo</option>
                                    <option *ngFor="let e of equiposLista" [ngValue]="e.idEquipo ?? e.id ?? e.id_equipo">
                                        {{ e.nombre ?? e.name ?? e.codigo ?? ('#' + (e.idEquipo ?? e.id ?? e.id_equipo)) }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block mb-1">Especialista</label>
                                <select class="select select-bordered w-full" [(ngModel)]="editarPrestamoData.especialista!.idEspecialista" name="editEspecialistaId" required>
                                    <option [ngValue]="0" disabled>Seleccione especialista</option>
                                    <option *ngFor="let s of especialistasLista" [ngValue]="s.idEspecialista ?? s.id ?? s.id_especialista">
                                        {{ s.nombre ?? s.name ?? ('#' + (s.idEspecialista ?? s.id ?? s.id_especialista)) }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block mb-1">Fecha Entrega</label>
                                <input type="datetime-local" class="input input-bordered w-full" [(ngModel)]="editarPrestamoData.fechaEntrega" name="editFechaEntrega">
                            </div>
                            <div>
                                <label class="block mb-1">Fecha Prevista</label>
                                <input type="datetime-local" class="input input-bordered w-full" [(ngModel)]="editarPrestamoData.fechaPrevista" name="editFechaPrevista">
                            </div>
                            <div>
                                <label class="block mb-1">Fecha Devolución</label>
                                <input type="datetime-local" class="input input-bordered w-full" [(ngModel)]="editarPrestamoData.fechaDevolucion" name="editFechaDevolucion">
                            </div>
                            <div>
                                <label class="block mb-1">Costo Total</label>
                                <input type="number" class="input input-bordered w-full" [(ngModel)]="editarPrestamoData.costoTotal" name="editCostoTotal" required>
                            </div>
                            <div>
                                <label class="block mb-1">Estado Préstamo</label>
                                <select class="select select-bordered w-full" [(ngModel)]="editarPrestamoData.estadoPrestamoId" name="editEstadoPrestamoId" required>
                                    <option [ngValue]="null" disabled>Seleccione estado</option>
                                    <option *ngFor="let e of estadosPrestamo" [ngValue]="e.id">{{ e.nombre }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 mt-6">
                            <button type="button" class="btn btn-outline" (click)="cerrarModalEditar()">Cancelar</button>
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
    // Estados (mcodigos grupo PRESTAMO)
    estadosPrestamo: Mcodigo[] = [];
    estadoPrestamoNombreById: Record<number, string> = {};
    estadoPrestamoCodigoById: Record<number, string> = {};
    estadoPrestamoNombreByCodigo: Record<string, string> = {};
    clienteMap: Record<number, string> = {};
    equipoMap: Record<number, string> = {};
    especialistaMap: Record<number, string> = {};
    // Listas para selects en formularios
    clientesLista: any[] = [];
    equiposLista: any[] = [];
    especialistasLista: any[] = [];
    // Evita solicitudes duplicadas para especialistas
    private inFlightEspecialistas: Set<number> = new Set();
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
        fechaPrestamo: '',
        fechaEntrega: '',
        fechaDevolucion: '',
        fechaPrevista: '',
        costoTotal: 0,
        estadoPrestamo: 'ACTIVO'
    };
    editarPrestamoData: Partial<Prestamo> = {};

    constructor(
        private readonly prestamoService: PrestamoService,
        private readonly clienteService: ClienteService,
        private readonly equipoService: EquipoService,
        private readonly especialistasService: EspecialistasService,
        private readonly mcodigosService: McodigosService
    ) {}

    ngOnInit(): void {
        this.loadLookupsAndData();
    }

    /**
     * Método para forzar la recarga de nombres faltantes desde la UI (uso temporal para debugging)
     */
    forceReloadNames() {
        // eslint-disable-next-line no-console
        console.debug('[DEBUG] forceReloadNames invoked');
        this.fillMissingLookupIds(this.prestamos);
    }

    private loadLookupsAndData(): void {
        // Cargar estados de préstamo desde mcodigos (grupo PRESTAMO)
        this.mcodigosService.listar('PRESTAMO').subscribe({
            next: (list) => {
                this.estadosPrestamo = list || [];
                this.estadoPrestamoNombreById = {};
                this.estadoPrestamoCodigoById = {};
                this.estadoPrestamoNombreByCodigo = {};
                (this.estadosPrestamo || []).forEach((e) => {
                    if (e.id != null) {
                        this.estadoPrestamoNombreById[Number(e.id)] = e.nombre;
                        this.estadoPrestamoCodigoById[Number(e.id)] = e.codigo;
                    }
                    if (e.codigo) this.estadoPrestamoNombreByCodigo[String(e.codigo)] = e.nombre;
                });
            },
            error: () => {
                this.estadosPrestamo = [];
            }
        });

        // Cargar lookups básicos (clientes, equipos, especialistas) para mapear ids a nombres
        // Cargamos de forma paralela pero tolerante: si algún servicio falla, seguimos con lo demás
        this.clienteService.getClientes(1, 1000).subscribe({
            next: (resp) => {
                const list = this.extractArray(resp);
                // eslint-disable-next-line no-console
                console.debug('[DEBUG] clientes lookup length:', list.length, list[0]);
                this.clientesLista = list;
                list.forEach((c: any) => {
                    const id = c?.idCliente ?? c?.id ?? c?.id_client ?? c?.idCliente ?? null;
                    const name = ((c?.nombre ?? c?.name ?? c?.firstName ?? '') + (c?.apellido ? ' ' + c.apellido : '')).trim();
                    if (id != null) this.clienteMap[Number(id)] = name || `#${id}`;
                });
            },
            error: () => {
                // ignore
            }
        });

        this.equipoService.getEquipos(1, 1000).subscribe({
            next: (resp) => {
                const list = this.extractArray(resp);
                // eslint-disable-next-line no-console
                console.debug('[DEBUG] equipos lookup length:', list.length, list[0]);
                this.equiposLista = list;
                list.forEach((e: any) => {
                    const id = e?.idEquipo ?? e?.id ?? e?.id_equipo ?? null;
                    const name = e?.nombre ?? e?.name ?? e?.codigo ?? '';
                    if (id != null) this.equipoMap[Number(id)] = name || `#${id}`;
                });
            },
            error: () => {}
        });

        this.especialistasService.getEspecialistas().subscribe({
            next: (list: any[]) => {
                this.especialistasLista = list || [];
                (list || []).forEach((s: any) => {
                    const id = s.idEspecialista ?? s.id ?? s.id_especialista ?? 0;
                    const name = s.nombre ?? s.name ?? '';
                    if (id) this.especialistaMap[Number(id)] = name || `#${id}`;
                });
            },
            error: () => {}
        });

        // Finalmente cargar prestamos
        this.cargarPrestamos();
    }

    /** Extrae un array de elementos desde varias formas de respuesta comunes */
    private extractArray(resp: any): any[] {
        if (!resp) return [];
        if (Array.isArray(resp)) return resp as any[];
        if (Array.isArray(resp.data)) return resp.data;
        if (Array.isArray(resp.content)) return resp.content;
        if (Array.isArray(resp.items)) return resp.items;
        if (Array.isArray(resp.result)) return resp.result;
        if (resp.data && Array.isArray(resp.data.content)) return resp.data.content;
        if (resp.data && Array.isArray(resp.data.results)) return resp.data.results;
        // Try to find any array property
        const maybe = Object.values(resp).find((v: any) => Array.isArray(v));
        return maybe ?? [];
    }

    getClienteNombre(id?: number): string {
        if (!id) return '-';
        return this.clienteMap[id] ?? `#${id}`;
    }

    getEquipoNombre(id?: number): string {
        if (!id) return '-';
        return this.equipoMap[id] ?? `#${id}`;
    }

    getEspecialistaNombre(id?: number): string {
        if (!id) return '-';
        return this.especialistaMap[id] ?? '-';
    }

    // Helpers to extract id from the prestamo's nested fields which may be either an object or a numeric id
    private resolveId(entity: any, keys: string[] = ['id', 'idCliente', 'idEquipo', 'idEspecialista']): number | null {
        if (entity == null) return null;
        if (typeof entity === 'number') return entity;
        if (typeof entity === 'string' && entity.trim() !== '') {
            const n = Number(entity);
            return Number.isFinite(n) ? n : null;
        }
        for (const k of keys) {
            if (entity[k] !== undefined && entity[k] !== null) return Number(entity[k]);
        }
        return null;
    }

    getClienteNombreFromPrestamo(p: any): string {
        const id = this.resolveId(p?.cliente, ['idCliente', 'id']);
        // Primero intenta el mapa
        const fromMap = this.getClienteNombre(id ?? undefined);
        if (fromMap && fromMap !== `#${id}` && fromMap !== '-') return fromMap;

        // Si no está en el mapa, intenta extraer el nombre directamente del objeto cliente que venga en el prestamo
        const c = p?.cliente;
        if (c) {
            const nombre = (c?.nombre ?? c?.name ?? c?.firstName ?? c?.nombreCompleto ?? '').toString().trim();
            const apellido = (c?.apellido ?? c?.lastName ?? '').toString().trim();
            const full = (nombre + (apellido ? ' ' + apellido : '')).trim();
            if (full) return full;
        }

        return id ? `#${id}` : '-';
    }

    getEquipoNombreFromPrestamo(p: any): string {
        const id = this.resolveId(p?.equipo, ['idEquipo', 'id']);
        const fromMap = this.getEquipoNombre(id ?? undefined);
        if (fromMap && fromMap !== `#${id}` && fromMap !== '-') return fromMap;
        const e = p?.equipo;
        if (e) {
            const name = (e?.nombre ?? e?.name ?? e?.codigo ?? '').toString().trim();
            if (name) return name;
        }
        return id ? `#${id}` : '-';
    }

    getEspecialistaNombreFromPrestamo(p: any): string {
        const id = this.resolveId(p?.especialista, ['idEspecialista', 'id']);
        const fromMap = this.getEspecialistaNombre(id ?? undefined);
        // Si el mapa tiene un placeholder '#{id}', intentamos obtener el nombre real
        if (fromMap && fromMap !== '-' ) {
            if (id && typeof fromMap === 'string' && fromMap === `#${id}`) {
                // solicitar actualización si no está en vuelo
                if (!this.inFlightEspecialistas.has(id)) this.fetchEspecialistaById(id);
            }
            return fromMap;
        }

        // Intentar extraer nombre directamente del objeto especialista dentro del prestamo
        const s = p?.especialista;
        if (s) {
            const name = (s?.nombre ?? s?.name ?? s?.fullName ?? '').toString().trim();
            if (name) return name;
        }

        // Si no hay nombre, intentar resolver id desde otras propiedades del prestamo
        const altId = this.getEspecialistaIdFromPrestamo(p);
        if (altId && !this.especialistaMap[altId] && !this.inFlightEspecialistas.has(altId)) {
            // eslint-disable-next-line no-console
            console.debug('[DEBUG] requesting especialista for alt id:', altId);
            this.fetchEspecialistaById(altId);
        }

        return (id ?? altId) ? `#${id ?? altId}` : '-';
    }

    // Método público para plantillas: devuelve el id de especialista resuelto (o null)
    getEspecialistaIdFromPrestamo(p: any): number | null {
        // Primero intenta resolver sobre el objeto especialista
        let id = this.resolveId(p?.especialista, ['idEspecialista', 'id']);
        if (id) return id;
        // Luego revisar variantes en la raíz del objeto prestamo
        const candidates = [
            p?.especialistaId,
            p?.idEspecialista,
            p?.especialista_id,
            p?.specialistId,
            p?.asignadoId,
            p?.responsableId,
            p?.asignado?.idEspecialista,
            p?.responsable?.idEspecialista
        ];
        for (const c of candidates) {
            const n = this.resolveId(c);
            if (n) return n;
        }
        return null;
    }

    private fetchEspecialistaById(id: number) {
        // Evitar llamadas duplicadas si ya existe o ya se está solicitando
        if (!id) return;
        if (this.especialistaMap[id]) return;
        if (this.inFlightEspecialistas.has(id)) return;
        this.inFlightEspecialistas.add(id);
        this.especialistasService.getEspecialista(id).subscribe({
            next: (data: any) => {
                const name = data?.nombre ?? data?.name ?? `#${id}`;
                this.especialistaMap[Number(id)] = name;
                // eslint-disable-next-line no-console
                console.debug('[DEBUG] especialista fetched:', id, name);
                this.inFlightEspecialistas.delete(id);
            },
            error: () => {
                this.especialistaMap[Number(id)] = `#${id}`;
                this.inFlightEspecialistas.delete(id);
            }
        });
    }

    cargarPrestamos(): void {
        this.prestamoService.getPrestamos().subscribe({
            next: (resp) => {
                // DEBUG: mostrar la respuesta para verificar la forma de los datos
                // eslint-disable-next-line no-console
                console.debug('[DEBUG] GET prestamos response:', resp);

                // Extraer array de registros de forma tolerante
                let raw: any = [];
                if (resp == null) {
                    raw = [];
                } else if (Array.isArray((resp as any))) {
                    raw = resp as unknown as any[];
                } else if (Array.isArray((resp as any).data)) {
                    raw = (resp as any).data;
                } else if (Array.isArray((resp as any).content)) {
                    raw = (resp as any).content;
                } else if (Array.isArray((resp as any).items)) {
                    raw = (resp as any).items;
                } else if (Array.isArray((resp as any).data?.content)) {
                    raw = (resp as any).data.content;
                } else if (Array.isArray((resp as any).result)) {
                    raw = (resp as any).result;
                } else if (Array.isArray((resp as any).data?.results)) {
                    raw = (resp as any).data.results;
                } else {
                    // Fallback: intenta leer cualquier propiedad que sea array
                    const maybeArray = Object.values(resp).find((v: any) => Array.isArray(v));
                    raw = maybeArray ?? [];
                }

                // DEBUG: mostrar el array extraído
                // eslint-disable-next-line no-console
                console.debug('[DEBUG] GET prestamos raw array (length):', Array.isArray(raw) ? raw.length : typeof raw, raw && raw[0]);

                // Normalizar posibles variantes de nombres devueltos por el backend
                this.prestamos = Array.isArray(raw) ? raw.map((r: any) => this.normalizePrestamo(r)) : [];

                // Después de cargar préstamos, intentar completar los nombres faltantes
                this.fillMissingLookupIds(this.prestamos);
            },
            error: () => {
                this.prestamos = [];
            }
        });
    }

    /** Normaliza un objeto de préstamo del backend a la forma esperada por la UI */
    normalizePrestamo(r: any): Prestamo {
        if (!r) return r;
        // Map id variants
        const idPrestamo = r.idPrestamo ?? r.id ?? r.prestamoId ?? r.id_prestamo ?? null;

        // Cliente
        const clienteRaw = r.cliente ?? r.client ?? r.clienteDto ?? null;
        let cliente: any = { idCliente: 0, nombre: '', apellido: '' };
        if (clienteRaw !== null && clienteRaw !== undefined) {
            if (typeof clienteRaw === 'number' || typeof clienteRaw === 'string') {
                const idVal = Number(clienteRaw);
                cliente = { idCliente: Number.isFinite(idVal) ? idVal : 0, nombre: '', apellido: '' };
            } else {
                cliente = {
                    idCliente: clienteRaw.idCliente ?? clienteRaw.id ?? clienteRaw.id_client ?? 0,
                    nombre: clienteRaw.nombre ?? clienteRaw.firstName ?? clienteRaw.name ?? '',
                    apellido: clienteRaw.apellido ?? clienteRaw.lastName ?? ''
                };
            }
        }

        // Si el backend devuelve sólo el id en la raíz (clienteId, idCliente, cliente_id, clientId), úsalo
        const clienteIdRoot = r.clienteId ?? r.idCliente ?? r.cliente_id ?? r.clientId ?? null;
        if ((clienteIdRoot !== null && clienteIdRoot !== undefined) && (!cliente || !cliente.idCliente)) {
            const idVal = Number(clienteIdRoot);
            cliente = { idCliente: Number.isFinite(idVal) ? idVal : 0, nombre: '', apellido: '' };
        }

        // Equipo
        const equipoRaw = r.equipo ?? r.equipment ?? r.equipoDto ?? null;
        let equipo: any = { idEquipo: 0, nombre: '' };
        if (equipoRaw !== null && equipoRaw !== undefined) {
            if (typeof equipoRaw === 'number' || typeof equipoRaw === 'string') {
                const idVal = Number(equipoRaw);
                equipo = { idEquipo: Number.isFinite(idVal) ? idVal : 0, nombre: '' };
            } else {
                equipo = {
                    idEquipo: equipoRaw.idEquipo ?? equipoRaw.id ?? equipoRaw.id_equipo ?? 0,
                    nombre: equipoRaw.nombre ?? equipoRaw.name ?? ''
                };
            }
        }

        // Soporta también id en la raíz: equipoId, idEquipo, equipo_id
        const equipoIdRoot = r.equipoId ?? r.idEquipo ?? r.equipo_id ?? r.equipmentId ?? null;
        if ((equipoIdRoot !== null && equipoIdRoot !== undefined) && (!equipo || !equipo.idEquipo)) {
            const idVal = Number(equipoIdRoot);
            equipo = { idEquipo: Number.isFinite(idVal) ? idVal : 0, nombre: '' };
        }

        // Especialista
        const espRaw = r.especialista ?? r.specialist ?? r.especialistaDto ?? null;
        let especialista: any = { idEspecialista: 0, nombre: '' };
        if (espRaw !== null && espRaw !== undefined) {
            if (typeof espRaw === 'number' || typeof espRaw === 'string') {
                const idVal = Number(espRaw);
                especialista = { idEspecialista: Number.isFinite(idVal) ? idVal : 0, nombre: '' };
            } else {
                especialista = {
                    idEspecialista: espRaw.idEspecialista ?? espRaw.id ?? espRaw.id_especialista ?? 0,
                    nombre: espRaw.nombre ?? espRaw.name ?? ''
                };
            }
        }

        // También soporta id de especialista en la raíz
        const espIdRoot = r.especialistaId ?? r.idEspecialista ?? r.especialista_id ?? r.specialistId ?? null;
        if ((espIdRoot !== null && espIdRoot !== undefined) && (!especialista || !especialista.idEspecialista)) {
            const idVal = Number(espIdRoot);
            especialista = { idEspecialista: Number.isFinite(idVal) ? idVal : 0, nombre: '' };
        }

        const normalized: Prestamo = {
            idPrestamo: idPrestamo,
            fechaPrestamo: r.fechaPrestamo ?? r.fecha_prestamo ?? r.fecha ?? r.fechaPrestamo ?? null,
            fechaEntrega: r.fechaEntrega ?? r.fecha_entrega ?? r.fechaEntrega ?? null,
            fechaDevolucion: r.fechaDevolucion ?? r.fecha_devolucion ?? null,
            fechaPrevista: r.fechaPrevista ?? r.fecha_prevista ?? null,
            costoTotal: r.costoTotal ?? r.costo_total ?? 0,
            estadoPrestamo: r.estadoPrestamo ?? r.estado ?? r.status ?? null,
            estadoPrestamoId: r.estadoPrestamoId ?? r.estadoId ?? r.idEstadoPrestamo ?? r.estado_prestamo_id ?? r.estado_id ?? null,
            cliente: cliente as any,
            equipo: equipo as any,
            especialista: especialista as any
        } as Prestamo;

        // Si viene sólo el código string y podemos mapear a id, hacerlo
        if (!normalized.estadoPrestamoId && normalized.estadoPrestamo) {
            const code = this.normalizeToCodigo(normalized.estadoPrestamo);
            // buscar por codigo en estadosPrestamo si ya cargó, o por nombre
            const byCodigo = (this.estadosPrestamo || []).find((e) => e.codigo === code);
            if (byCodigo?.id != null) normalized.estadoPrestamoId = Number(byCodigo.id);
        }

        return normalized;
    }

    /**
     * Revisa los préstamos cargados y solicita al backend los recursos (cliente/equipo/especialista)
     * que no estuvieron presentes en los lookups iniciales, para completar los nombres en la UI.
     */
    private fillMissingLookupIds(prestamos: Prestamo[]) {
        const missingClientes = new Set<number>();
        const missingEquipos = new Set<number>();
        const missingEspecialistas = new Set<number>();

        (prestamos || []).forEach((p: any) => {
            const cid = this.resolveId(p?.cliente, ['idCliente', 'id']);
            const eid = this.resolveId(p?.equipo, ['idEquipo', 'id']);
            const sid = this.resolveId(p?.especialista, ['idEspecialista', 'id']);
            if (cid && !this.clienteMap[cid]) missingClientes.add(cid);
            if (eid && !this.equipoMap[eid]) missingEquipos.add(eid);
            if (sid && !this.especialistaMap[sid]) missingEspecialistas.add(sid);
        });

    // DEBUG: mostrar ids faltantes
    // eslint-disable-next-line no-console
    console.debug('[DEBUG] Missing lookups - clientes:', Array.from(missingClientes), 'equipos:', Array.from(missingEquipos), 'especialistas:', Array.from(missingEspecialistas));

    // Pedir individualmente los que faltan (rápido y simple)
        missingClientes.forEach((id) => {
            this.clienteService.getClienteById(id).subscribe({
                next: (resp: any) => {
                    const data = resp?.data ?? resp;
                    const name = ((data?.nombre ?? data?.name ?? '') + (data?.apellido ? ' ' + data.apellido : '')).trim() || `#${id}`;
                    this.clienteMap[Number(id)] = name;
                },
                error: () => {
                    this.clienteMap[Number(id)] = `#${id}`;
                }
            });
        });

        missingEquipos.forEach((id) => {
            this.equipoService.getEquipoById(id).subscribe({
                next: (resp: any) => {
                    const data = resp?.data ?? resp;
                    const name = data?.nombre ?? data?.name ?? data?.codigo ?? `#${id}`;
                    this.equipoMap[Number(id)] = name;
                },
                error: () => {
                    this.equipoMap[Number(id)] = `#${id}`;
                }
            });
        });

        missingEspecialistas.forEach((id) => {
            // EspecialistasService already unwraps resp.data in getEspecialista
            this.especialistasService.getEspecialista(id).subscribe({
                next: (data: any) => {
                    const name = data?.nombre ?? data?.name ?? `#${id}`;
                    this.especialistaMap[Number(id)] = name;
                },
                error: () => {
                    this.especialistaMap[Number(id)] = `#${id}`;
                }
            });
        });
    }

    abrirModalNuevo() {
        this.modalNuevo = true;
        this.nuevoPrestamo = {
            // Por defecto la fecha de préstamo es ahora, en formato compatible con input datetime-local (YYYY-MM-DDTHH:mm)
            fechaPrestamo: this.nowForDatetimeLocal(),
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
            estadoPrestamo: 'ACTIVO',
            estadoPrestamoId: (this.estadosPrestamo.find(e => e.codigo === 'ACTIVO')?.id) ?? null
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
            estadoPrestamo: 'ACTIVO',
            estadoPrestamoId: (this.estadosPrestamo.find(e => e.codigo === 'ACTIVO')?.id) ?? null
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
        // Validar existencia previa de las relaciones para evitar errores de FK
        const cId = Number(this.nuevoPrestamo.cliente!.idCliente);
        const eId = Number(this.nuevoPrestamo.equipo!.idEquipo);
        const sId = Number(this.nuevoPrestamo.especialista!.idEspecialista);
        forkJoin({
            cliente: this.clienteService.getClienteById(cId).pipe(
                catchError(() => of(null)),
                map((resp: any) => !!(resp?.data ?? resp))
            ),
            equipo: this.equipoService.getEquipoById(eId).pipe(
                catchError(() => of(null)),
                map((resp: any) => !!(resp?.data ?? resp))
            ),
            especialista: this.especialistasService.getEspecialista(sId).pipe(
                catchError(() => of(null)),
                map((resp: any) => !!resp)
            )
        }).subscribe(({ cliente, equipo, especialista }) => {
            const missing: string[] = [];
            if (!cliente) missing.push(`cliente #${cId}`);
            if (!equipo) missing.push(`equipo #${eId}`);
            if (!especialista) missing.push(`especialista #${sId}`);
            if (missing.length) {
                alert(`No existe(n): ${missing.join(', ')}. Verifique los IDs antes de guardar.`);
                return;
            }
        // Construir un payload estricto y convertir tipos (evita enviar labels como "Disponible")
        const estadoId = this.nuevoPrestamo.estadoPrestamoId != null ? Number(this.nuevoPrestamo.estadoPrestamoId) : null;
        const estadoCodigo = estadoId != null ? this.estadoPrestamoCodigoById[estadoId] : this.normalizeToCodigo(this.nuevoPrestamo.estadoPrestamo as any);
        const payload: any = {
            // Si no se especifica, usar hoy como fecha de préstamo
            fechaPrestamo: this.nuevoPrestamo.fechaPrestamo ? new Date(this.nuevoPrestamo.fechaPrestamo).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            fechaEntrega: this.nuevoPrestamo.fechaEntrega ? new Date(this.nuevoPrestamo.fechaEntrega).toISOString().split('T')[0] : null,
            fechaDevolucion: this.nuevoPrestamo.fechaDevolucion ? new Date(this.nuevoPrestamo.fechaDevolucion).toISOString().split('T')[0] : null,
            fechaPrevista: this.nuevoPrestamo.fechaPrevista ? new Date(this.nuevoPrestamo.fechaPrevista).toISOString().split('T')[0] : null,
            costoTotal: this.nuevoPrestamo.costoTotal != null ? Number(this.nuevoPrestamo.costoTotal) : 0,
            // Enviar id preferentemente y el código como respaldo
            estadoPrestamoId: estadoId,
            estadoPrestamo: estadoCodigo ?? null,
            cliente: { idCliente: Number(this.nuevoPrestamo.cliente!.idCliente) },
            equipo: { idEquipo: Number(this.nuevoPrestamo.equipo!.idEquipo) },
            especialista: { idEspecialista: Number(this.nuevoPrestamo.especialista!.idEspecialista) },
            // Campos alternativos por si el backend espera ids planos
            clienteId: Number(this.nuevoPrestamo.cliente!.idCliente),
            equipoId: Number(this.nuevoPrestamo.equipo!.idEquipo),
            especialistaId: Number(this.nuevoPrestamo.especialista!.idEspecialista),
            // Variantes camelCase comunes en entidades JPA/DTO
            idCliente: Number(this.nuevoPrestamo.cliente!.idCliente),
            idEquipo: Number(this.nuevoPrestamo.equipo!.idEquipo),
            idEspecialista: Number(this.nuevoPrestamo.especialista!.idEspecialista),
            // backups de estado
            estado: estadoCodigo ?? null,
            idEstadoPrestamo: estadoId,
            estado_prestamo_id: estadoId
        };
    const payloadLimpio = this.limpiarPayloadPrestamo(payload);
    // DEBUG: mostrar payload enviado para diagnóstico (remover después de verificar)
    // eslint-disable-next-line no-console
    console.debug('[DEBUG] Payload crearPrestamo:', JSON.stringify(payloadLimpio, null, 2));
    this.prestamoService.crearPrestamo(payloadLimpio as Prestamo).subscribe({
            next: () => {
                this.cargarPrestamos();
                this.cerrarModalNuevo();
            },
            error: (err: any) => {
                // Mostrar el mensaje real del ApiService para facilitar el diagnóstico
                console.error('[ERROR crearPrestamo]', err);
                const backendMsg = err?.message || err?.original?.message || err?.original?.error;
                alert(backendMsg || 'Error al crear el préstamo');
            }
        });
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
        // Preformatear fechas para inputs datetime-local
        this.editarPrestamoData = {
            ...prestamo,
            fechaPrestamo: this.toDatetimeLocal(prestamo.fechaPrestamo),
            fechaEntrega: this.toDatetimeLocal(prestamo.fechaEntrega),
            fechaDevolucion: this.toDatetimeLocal(prestamo.fechaDevolucion),
            fechaPrevista: this.toDatetimeLocal(prestamo.fechaPrevista)
        } as any;
        // Preseleccionar estadoPrestamoId si sólo vino el código
        if (!this.editarPrestamoData.estadoPrestamoId && this.editarPrestamoData.estadoPrestamo) {
            const code = this.normalizeToCodigo(this.editarPrestamoData.estadoPrestamo);
            const found = (this.estadosPrestamo || []).find(e => e.codigo === code);
            if (found?.id != null) this.editarPrestamoData.estadoPrestamoId = Number(found.id);
        }
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
        const cId = Number(this.editarPrestamoData.cliente!.idCliente);
        const eId = Number(this.editarPrestamoData.equipo!.idEquipo);
        const sId = Number(this.editarPrestamoData.especialista!.idEspecialista);
        const estadoId = this.editarPrestamoData.estadoPrestamoId != null ? Number(this.editarPrestamoData.estadoPrestamoId) : null;
        const estadoCodigo = estadoId != null ? this.estadoPrestamoCodigoById[estadoId] : this.normalizeToCodigo(this.editarPrestamoData.estadoPrestamo as any);
        const payload: any = {
            fechaPrestamo: this.editarPrestamoData.fechaPrestamo ? new Date(this.editarPrestamoData.fechaPrestamo).toISOString().split('T')[0] : null,
            fechaEntrega: this.editarPrestamoData.fechaEntrega ? new Date(this.editarPrestamoData.fechaEntrega).toISOString().split('T')[0] : null,
            fechaDevolucion: this.editarPrestamoData.fechaDevolucion ? new Date(this.editarPrestamoData.fechaDevolucion).toISOString().split('T')[0] : null,
            fechaPrevista: this.editarPrestamoData.fechaPrevista ? new Date(this.editarPrestamoData.fechaPrevista).toISOString().split('T')[0] : null,
            costoTotal: (this.editarPrestamoData.costoTotal !== undefined && this.editarPrestamoData.costoTotal !== null) ? Number(this.editarPrestamoData.costoTotal) : 0,
            estadoPrestamoId: estadoId,
            estadoPrestamo: estadoCodigo ?? null,
            cliente: { idCliente: Number(this.editarPrestamoData.cliente?.idCliente ?? 0) },
            equipo: { idEquipo: Number(this.editarPrestamoData.equipo?.idEquipo ?? 0) },
            especialista: { idEspecialista: Number(this.editarPrestamoData.especialista?.idEspecialista ?? 0) },
            // Alternativos
            clienteId: Number(this.editarPrestamoData.cliente?.idCliente ?? 0),
            equipoId: Number(this.editarPrestamoData.equipo?.idEquipo ?? 0),
            especialistaId: Number(this.editarPrestamoData.especialista?.idEspecialista ?? 0),
            idCliente: Number(this.editarPrestamoData.cliente?.idCliente ?? 0),
            idEquipo: Number(this.editarPrestamoData.equipo?.idEquipo ?? 0),
            idEspecialista: Number(this.editarPrestamoData.especialista?.idEspecialista ?? 0),
            estado: estadoCodigo ?? null,
            idEstadoPrestamo: estadoId,
            estado_prestamo_id: estadoId
        };
    const payloadLimpio = this.limpiarPayloadPrestamo(payload);
    // DEBUG: mostrar payload de edición para diagnóstico (remover después de verificar)
    // eslint-disable-next-line no-console
    console.debug('[DEBUG] Payload actualizarPrestamo:', JSON.stringify(payloadLimpio, null, 2));
    // Validar existencia previa antes de enviar PUT
    forkJoin({
        cliente: this.clienteService.getClienteById(cId).pipe(catchError(() => of(null)), map((resp: any) => !!(resp?.data ?? resp))),
        equipo: this.equipoService.getEquipoById(eId).pipe(catchError(() => of(null)), map((resp: any) => !!(resp?.data ?? resp))),
        especialista: this.especialistasService.getEspecialista(sId).pipe(catchError(() => of(null)), map((resp: any) => !!resp))
    }).subscribe(({ cliente, equipo, especialista }) => {
        const missing: string[] = [];
        if (!cliente) missing.push(`cliente #${cId}`);
        if (!equipo) missing.push(`equipo #${eId}`);
        if (!especialista) missing.push(`especialista #${sId}`);
        if (missing.length) {
            alert(`No existe(n): ${missing.join(', ')}. Verifique los IDs antes de guardar.`);
            return;
        }
        this.prestamoService.actualizarPrestamo(this.editarPrestamoData.idPrestamo!, payloadLimpio as Prestamo).subscribe({
            next: () => {
                this.cargarPrestamos();
                this.cerrarModalEditar();
            },
            error: (err: any) => {
                console.error('[ERROR actualizarPrestamo]', err);
                const backendMsg = err?.message || err?.original?.message || err?.original?.error;
                alert(backendMsg || 'Error al editar el préstamo');
            }
        });
    });
    }

    /** Devuelve la fecha/hora actual en formato válido para input type="datetime-local" (YYYY-MM-DDTHH:mm) */
    private nowForDatetimeLocal(): string {
        const d = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mi = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    }

    /**
     * Convierte una fecha (Date o string) a formato 'YYYY-MM-DDTHH:mm' para inputs datetime-local.
     * Si el valor es 'YYYY-MM-DD', agrega 'T00:00'. Si es null/undefined, devuelve ''.
     */
    private toDatetimeLocal(value?: string | Date | null): string {
        if (!value) return '';
        let d: Date;
        if (typeof value === 'string') {
            // Si ya viene con 'T', úsala directamente
            if (/T\d{2}:\d{2}/.test(value)) {
                const v = value.slice(0,16);
                return v;
            }
            // Si viene 'YYYY-MM-DD', crear Date a medianoche local
            d = new Date(value);
        } else {
            d = value;
        }
        if (Number.isNaN(d.getTime())) return '';
        const pad = (n: number) => n.toString().padStart(2, '0');
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mi = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    }

    /**
     * Normaliza etiquetas humanas a códigos en mayúsculas (simple heurística)
     * - Si ya viene en mayúsculas y sin espacios, la devuelve tal cual
     * - Si es una etiqueta de presentación ('Disponible'), la convierte a 'DISPONIBLE'
     */
    normalizeToCodigo(value: any): string | null {
        if (value === null || value === undefined) return null;
        const s = String(value).trim();
        if (s === '') return null;
    // Si parece ya un código (todo mayúsculas y con guión/underscore/numbers), devolver
    if (/^[A-Z0-9_-]+$/.test(s)) return s;
    // Reemplaza espacios por guion bajo y pasa a mayúsculas
    return s.split(/\s+/).join('_').toUpperCase();
    }

    eliminarPrestamo(id: number) {
        if (confirm('¿Está seguro de eliminar este préstamo?')) {
            console.log('[DEBUG] Eliminando préstamo con ID:', id);
            this.prestamoService.eliminarPrestamo(id).subscribe({
                next: (response) => {
                    console.log('[DEBUG] Préstamo eliminado exitosamente:', response);
                    alert('Préstamo eliminado exitosamente');
                    this.cargarPrestamos();
                },
                error: (err: any) => {
                    console.error('[ERROR] Error al eliminar préstamo:', err);
                    const errorMsg = err?.message || err?.error?.message || err?.original?.message || 'Error desconocido al eliminar el préstamo';
                    alert(`Error al eliminar el préstamo: ${errorMsg}`);
                }
            });
        }
    }

    // Presentación: nombre de estado desde id o código
    getEstadoPrestamoNombre(p: Prestamo): string {
        if (p?.estadoPrestamoId != null && this.estadoPrestamoNombreById[p.estadoPrestamoId]) {
            return this.estadoPrestamoNombreById[p.estadoPrestamoId];
        }
        if (p?.estadoPrestamo) {
            const code = this.normalizeToCodigo(p.estadoPrestamo as any) || '';
            return (code && this.estadoPrestamoNombreByCodigo[code]) ? this.estadoPrestamoNombreByCodigo[code] : p.estadoPrestamo;
        }
        return '-';
    }
}
