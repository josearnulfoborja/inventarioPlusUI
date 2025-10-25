import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolService } from '@/core/services/rol.service';
import { Rol } from '@/core/models/inventario.model';
import { ApiError } from '@/core/models/api.model';

/**
 * Componente para listar y gestionar roles del sistema
 */
@Component({
    selector: 'app-roles',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <div class="card-header flex justify-between items-center">
                <h2 class="text-2xl font-bold">Gestión de Roles</h2>
                <button 
                    (click)="nuevoRol()" 
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    <i class="pi pi-plus"></i> Nuevo Rol
                </button>
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
                                        {{ rol.id }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 font-semibold">{{ rol.nombreRol }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">
                                    {{ rol.descripcion || 'Sin descripción' }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <div class="flex gap-2 justify-center">
                                        <button 
                                            (click)="verDetalles(rol)" 
                                            class="text-blue-500 hover:text-blue-700"
                                            title="Ver detalles">
                                            <i class="pi pi-eye"></i>
                                        </button>
                                        <button 
                                            (click)="editarRol(rol)" 
                                            class="text-yellow-500 hover:text-yellow-700"
                                            title="Editar">
                                            <i class="pi pi-pencil"></i>
                                        </button>
                                        <button 
                                            (click)="eliminarRol(rol.id!)" 
                                            class="text-red-500 hover:text-red-700"
                                            title="Eliminar">
                                            <i class="pi pi-trash"></i>
                                        </button>
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

    constructor(private readonly rolService: RolService) {}

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

    verDetalles(rol: Rol): void {
        const detalles = `
ID: ${rol.id}
Nombre: ${rol.nombreRol}
Descripción: ${rol.descripcion || 'Sin descripción'}
        `.trim();
        alert(detalles);
    }

    nuevoRol(): void {
        const nombreRol = prompt('Nombre del rol:');
        if (nombreRol) {
            const descripcion = prompt('Descripción (opcional):');
            const nuevoRol: Rol = {
                nombreRol,
                descripcion: descripcion || undefined
            };

            this.rolService.crearRol(nuevoRol).subscribe({
                next: () => {
                    alert('Rol creado exitosamente');
                    this.cargarRoles();
                },
                error: (err: ApiError) => alert(`Error: ${err.message}`)
            });
        }
    }

    editarRol(rol: Rol): void {
        const nuevoNombre = prompt('Nuevo nombre del rol:', rol.nombreRol);
        if (nuevoNombre && nuevoNombre !== rol.nombreRol) {
            const nuevaDescripcion = prompt('Nueva descripción:', rol.descripcion || '');
            const rolActualizado: Rol = {
                id: rol.id,
                nombreRol: nuevoNombre,
                descripcion: nuevaDescripcion || undefined
            };

            this.rolService.actualizarRol(rol.id!, rolActualizado).subscribe({
                next: () => {
                    alert('Rol actualizado exitosamente');
                    this.cargarRoles();
                },
                error: (err: ApiError) => alert(`Error: ${err.message}`)
            });
        }
    }

    eliminarRol(id: number): void {
        if (confirm('¿Está seguro de eliminar este rol? Esta acción no se puede deshacer.')) {
            this.rolService.eliminarRol(id).subscribe({
                next: () => {
                    alert('Rol eliminado exitosamente');
                    this.cargarRoles();
                },
                error: (err: ApiError) => alert(`Error: ${err.message}`)
            });
        }
    }
}
