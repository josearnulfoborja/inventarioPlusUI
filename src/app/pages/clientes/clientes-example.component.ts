import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService, Cliente } from '@/core/services/cliente.service.example';
import { ApiError } from '@/core/models/api.model';

/**
 * Componente de ejemplo que usa ClienteService
 * Muestra cómo consumir el ApiService a través de servicios específicos
 */
@Component({
    selector: 'app-clientes-example',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="p-4">
            <h2 class="text-2xl font-bold mb-4">Ejemplo de uso de ApiService</h2>
            
            <!-- Loading -->
            <div *ngIf="isLoading" class="mb-4">
                <p>Cargando...</p>
            </div>

            <!-- Error -->
            <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{{ error }}</p>
            </div>

            <!-- Lista de clientes -->
            <div *ngIf="!isLoading && clientes.length > 0">
                <h3 class="text-xl font-semibold mb-2">Lista de Clientes</h3>
                <div class="grid gap-4">
                    <div *ngFor="let cliente of clientes" class="border p-4 rounded">
                        <h4 class="font-bold">{{ cliente.nombre }}</h4>
                        <p>Email: {{ cliente.email }}</p>
                        <p>Teléfono: {{ cliente.telefono }}</p>
                        <div class="mt-2 space-x-2">
                            <button 
                                (click)="editarCliente(cliente)" 
                                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                                Editar
                            </button>
                            <button 
                                (click)="eliminarCliente(cliente.id!)" 
                                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Paginación -->
                <div class="mt-4 flex justify-between items-center">
                    <button 
                        (click)="previousPage()" 
                        [disabled]="currentPage === 1"
                        class="bg-gray-300 px-4 py-2 rounded disabled:opacity-50">
                        Anterior
                    </button>
                    <span>Página {{ currentPage }} de {{ totalPages }}</span>
                    <button 
                        (click)="nextPage()" 
                        [disabled]="currentPage === totalPages"
                        class="bg-gray-300 px-4 py-2 rounded disabled:opacity-50">
                        Siguiente
                    </button>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="mt-4 space-x-2">
                <button 
                    (click)="crearNuevoCliente()" 
                    class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Nuevo Cliente
                </button>
                <button 
                    (click)="exportarExcel()" 
                    class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                    Exportar a Excel
                </button>
            </div>
        </div>
    `
})
export class ClientesExampleComponent implements OnInit {
    clientes: Cliente[] = [];
    isLoading = false;
    error: string | null = null;
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;

    constructor(private readonly clienteService: ClienteService) {}

    ngOnInit(): void {
        this.cargarClientes();
    }

    /**
     * Cargar lista de clientes
     */
    cargarClientes(): void {
        this.isLoading = true;
        this.error = null;

        this.clienteService.getClientes(this.currentPage, this.pageSize).subscribe({
            next: (response) => {
                if (response.success) {
                    this.clientes = response.data;
                    this.totalPages = response.pagination.totalPages;
                }
            },
            error: (err: ApiError) => {
                this.error = err.message;
                this.isLoading = false;
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }

    /**
     * Crear un nuevo cliente
     */
    crearNuevoCliente(): void {
        const nuevoCliente: Cliente = {
            nombre: 'Juan Pérez',
            email: 'juan.perez@example.com',
            telefono: '555-1234',
            direccion: 'Calle Principal 123',
            activo: true
        };

        this.clienteService.crearCliente(nuevoCliente).subscribe({
            next: (response) => {
                if (response.success) {
                    alert('Cliente creado exitosamente');
                    this.cargarClientes(); // Recargar la lista
                }
            },
            error: (err: ApiError) => {
                this.error = err.message;
            }
        });
    }

    /**
     * Editar un cliente
     */
    editarCliente(cliente: Cliente): void {
        if (!cliente.id) return;

        const clienteActualizado = { ...cliente, nombre: cliente.nombre + ' (Editado)' };

        this.clienteService.actualizarCliente(cliente.id, clienteActualizado).subscribe({
            next: (response) => {
                if (response.success) {
                    alert('Cliente actualizado exitosamente');
                    this.cargarClientes();
                }
            },
            error: (err: ApiError) => {
                this.error = err.message;
            }
        });
    }

    /**
     * Eliminar un cliente
     */
    eliminarCliente(id: number): void {
        if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

        this.clienteService.eliminarCliente(id).subscribe({
            next: (response) => {
                if (response.success) {
                    alert('Cliente eliminado exitosamente');
                    this.cargarClientes();
                }
            },
            error: (err: ApiError) => {
                this.error = err.message;
            }
        });
    }

    /**
     * Exportar clientes a Excel
     */
    exportarExcel(): void {
        this.clienteService.exportarExcel().subscribe({
            next: () => {
                alert('Archivo descargado exitosamente');
            },
            error: (err: ApiError) => {
                this.error = err.message;
            }
        });
    }

    /**
     * Navegación de páginas
     */
    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.cargarClientes();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.cargarClientes();
        }
    }
}
