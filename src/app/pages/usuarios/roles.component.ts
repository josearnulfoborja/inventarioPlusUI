import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolService } from '@/core/services/rol.service';
import { Rol } from '@/core/models/inventario.model';
import { ApiError } from '@/core/models/api.model';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

/**
 * Componente para listar y gestionar roles del sistema
 */
@Component({
    selector: 'app-roles',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        TooltipModule
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        
        <div class="card">
            <div class="card-header flex justify-between items-center">
                <h2 class="text-2xl font-bold">Gestión de Roles</h2>
                <p-button 
                    (click)="mostrarDialogoNuevo()" 
                    icon="pi pi-plus"
                    label="Nuevo Rol"
                    styleClass="p-button-primary">
                </p-button>
            </div>

            <!-- Loading -->
            <div *ngIf="isLoading" class="p-4 text-center">
                <i class="pi pi-spin pi-spinner text-4xl"></i>
                <p class="mt-2">Cargando roles...</p>
            </div>

            <!-- Error -->
            <div *ngIf="error" class="p-4">
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {{ error }}
                </div>
            </div>

            <!-- Tabla de roles -->
            <div *ngIf="!isLoading && !error" class="p-4">
                <!-- Estadísticas -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded border border-blue-200">
                        <div class="text-sm text-blue-600">Total Roles</div>
                        <div class="text-2xl font-bold">{{ roles.length }}</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded border border-green-200">
                        <div class="text-sm text-green-600">Último Registro</div>
                        <div class="text-2xl font-bold">{{ roles.length > 0 ? roles[roles.length - 1].nombreRol : 'N/A' }}</div>
                    </div>
                </div>

                <!-- Lista de roles -->
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-left">ID</th>
                                <th class="px-4 py-3 text-left">Nombre del Rol</th>
                                <th class="px-4 py-3 text-left">Descripción</th>
                                <th class="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let rol of roles" class="border-b hover:bg-gray-50">
                                <td class="px-4 py-3">
                                    <span class="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                        {{ obtenerIdRol(rol) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 font-semibold">{{ rol.nombreRol }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">
                                    {{ rol.descripcion || 'Sin descripción' }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <div class="flex gap-2 justify-center">
                                        <p-button 
                                            (onClick)="mostrarDialogoEditar(rol)" 
                                            icon="pi pi-pencil"
                                            [rounded]="true"
                                            [text]="true"
                                            severity="warn"
                                            pTooltip="Editar">
                                        </p-button>
                                        <p-button 
                                            (onClick)="confirmarEliminar(obtenerIdRol(rol))" 
                                            icon="pi pi-trash"
                                            [rounded]="true"
                                            [text]="true"
                                            severity="danger"
                                            pTooltip="Eliminar">
                                        </p-button>
                                    </div>
                                </td>
                            </tr>
                            <tr *ngIf="roles.length === 0">
                                <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                                    No se encontraron roles
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Total -->
                <div class="mt-4">
                    <span class="text-sm text-gray-600">
                        Total de roles: {{ roles.length }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Diálogo para crear/editar rol -->
        <p-dialog 
            [(visible)]="mostrarDialogo" 
            [header]="modoEdicion ? 'Editar Rol' : 'Nuevo Rol'"
            [modal]="true"
            [style]="{width: '450px'}"
            [draggable]="false"
            [resizable]="false">
            
            <div class="flex flex-col gap-4 p-4">
                <div class="flex flex-col gap-2">
                    <label for="nombreRol" class="font-semibold">
                        Nombre del rol <span class="text-red-500">*</span>
                    </label>
                    <input 
                        id="nombreRol"
                        type="text" 
                        pInputText 
                        [(ngModel)]="rolFormulario.nombreRol"
                        placeholder="Ej: ADMINISTRADOR"
                        class="w-full"
                        [class.ng-invalid]="nombreRolInvalido"
                        maxlength="50" />
                    <small *ngIf="nombreRolInvalido" class="text-red-500">
                        El nombre del rol es obligatorio
                    </small>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="descripcion" class="font-semibold">
                        Descripción
                    </label>
                    <textarea 
                        id="descripcion"
                        pTextarea 
                        [(ngModel)]="rolFormulario.descripcion"
                        placeholder="Descripción opcional del rol"
                        rows="3"
                        class="w-full"
                        maxlength="200">
                    </textarea>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex gap-2 justify-end">
                    <p-button 
                        label="Cancelar" 
                        icon="pi pi-times"
                        (onClick)="cerrarDialogo()"
                        styleClass="p-button-text">
                    </p-button>
                    <p-button 
                        [label]="modoEdicion ? 'Actualizar' : 'Crear'" 
                        icon="pi pi-check"
                        (onClick)="guardarRol()"
                        [disabled]="!rolFormulario.nombreRol?.trim()"
                        [loading]="guardando">
                    </p-button>
                </div>
            </ng-template>
        </p-dialog>

        <!-- Diálogo de confirmación para eliminar -->
        <p-dialog 
            [(visible)]="mostrarDialogoEliminar" 
            header="Confirmar eliminación"
            [modal]="true"
            [style]="{width: '400px'}"
            [draggable]="false"
            [resizable]="false">
            
            <div class="flex items-start gap-3 p-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                <div>
                    <p class="font-semibold mb-2">¿Está seguro de eliminar este rol?</p>
                    <p class="text-sm text-gray-600">Esta acción no se puede deshacer.</p>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex gap-2 justify-end">
                    <p-button 
                        label="Cancelar" 
                        icon="pi pi-times"
                        (onClick)="mostrarDialogoEliminar = false"
                        styleClass="p-button-text">
                    </p-button>
                    <p-button 
                        label="Eliminar" 
                        icon="pi pi-trash"
                        (onClick)="eliminarRol()"
                        severity="danger"
                        [loading]="eliminando">
                    </p-button>
                </div>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .card-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }
    `]
})
export class RolesComponent implements OnInit {
    roles: Rol[] = [];
    isLoading = false;
    error: string | null = null;
    
    // Diálogo de crear/editar
    mostrarDialogo = false;
    modoEdicion = false;
    guardando = false;
    rolFormulario: Partial<Rol> = {};
    nombreRolInvalido = false;
    
    // Diálogo de eliminar
    mostrarDialogoEliminar = false;
    eliminando = false;
    idRolEliminar: number | null = null;

    constructor(
        private readonly rolService: RolService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.cargarRoles();
    }

    cargarRoles(): void {
        this.isLoading = true;
        this.error = null;

        this.rolService.listarRoles().subscribe({
            next: (roles) => {
                this.roles = roles;
                this.isLoading = false;
            },
            error: (err: ApiError) => {
                this.error = err.message;
                this.isLoading = false;
            }
        });
    }

    obtenerIdRol(rol: Rol): number {
        return rol.id || rol.idRol || 0;
    }

    verDetalles(rol: Rol): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Detalles del Rol',
            detail: `ID: ${this.obtenerIdRol(rol)} - ${rol.nombreRol}`,
            life: 3000
        });
    }

    mostrarDialogoNuevo(): void {
        this.modoEdicion = false;
        this.rolFormulario = {
            nombreRol: '',
            descripcion: ''
        };
        this.nombreRolInvalido = false;
        this.mostrarDialogo = true;
    }

    mostrarDialogoEditar(rol: Rol): void {
        this.modoEdicion = true;
        const rolId = rol.id || (rol as any).idRol;
        console.log('Editando rol:', rol, 'ID extraído:', rolId);
        this.rolFormulario = {
            id: rolId,
            nombreRol: rol.nombreRol,
            descripcion: rol.descripcion || ''
        };
        this.nombreRolInvalido = false;
        this.mostrarDialogo = true;
    }

    cerrarDialogo(): void {
        this.mostrarDialogo = false;
        this.rolFormulario = {};
        this.nombreRolInvalido = false;
        this.guardando = false;
    }

    guardarRol(): void {
        if (!this.rolFormulario.nombreRol?.trim()) {
            this.nombreRolInvalido = true;
            return;
        }

        this.guardando = true;
        this.nombreRolInvalido = false;

        const rol: Rol = {
            nombreRol: this.rolFormulario.nombreRol.trim(),
            descripcion: this.rolFormulario.descripcion?.trim() || undefined
        };

        if (this.modoEdicion && this.rolFormulario.id) {
            rol.id = this.rolFormulario.id;
        }

        const operacion = this.modoEdicion && rol.id
            ? this.rolService.actualizarRol(rol.id, rol)
            : this.rolService.crearRol(rol);

        operacion.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `Rol ${this.modoEdicion ? 'actualizado' : 'creado'} exitosamente`,
                    life: 3000
                });
                this.cerrarDialogo();
                this.cargarRoles();
            },
            error: (err: ApiError) => {
                this.guardando = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.message,
                    life: 5000
                });
            }
        });
    }

    confirmarEliminar(id: number): void {
        this.idRolEliminar = id;
        this.mostrarDialogoEliminar = true;
    }

    eliminarRol(): void {
        if (!this.idRolEliminar) {
            return;
        }

        this.eliminando = true;
        this.rolService.eliminarRol(this.idRolEliminar).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Rol eliminado exitosamente',
                    life: 3000
                });
                this.mostrarDialogoEliminar = false;
                this.eliminando = false;
                this.idRolEliminar = null;
                this.cargarRoles();
            },
            error: (err: ApiError) => {
                // Si el error es de parseo JSON pero el status es 200, considerarlo éxito
                if (err.statusCode === 200 || (err as any).original?.name === 'SyntaxError') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Rol eliminado exitosamente',
                        life: 3000
                    });
                    this.mostrarDialogoEliminar = false;
                    this.eliminando = false;
                    this.idRolEliminar = null;
                    this.cargarRoles();
                } else {
                    this.mostrarDialogoEliminar = false;
                    this.eliminando = false;
                    this.idRolEliminar = null;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al eliminar',
                        detail: err.message || 'No se pudo eliminar el rol',
                        life: 5000
                    });
                }
            }
        });
    }
}
