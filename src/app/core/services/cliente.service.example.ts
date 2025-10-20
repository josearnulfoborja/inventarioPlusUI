import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@/core/services/api.service';
import { ApiResponse, PaginatedResponse } from '@/core/models/api.model';

/**
 * Interfaz de ejemplo para Cliente
 */
export interface Cliente {
    id?: number;
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    activo: boolean;
}

/**
 * Servicio de ejemplo que usa ApiService
 * Este servicio maneja todas las operaciones CRUD para Clientes
 */
@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private readonly endpoint = '/clientes';

    constructor(private readonly apiService: ApiService) {}

    /**
     * Obtener todos los clientes (paginado)
     */
    getClientes(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Cliente>> {
        return this.apiService.getPaginated<Cliente>(this.endpoint, page, pageSize);
    }

    /**
     * Obtener un cliente por ID
     */
    getClienteById(id: number): Observable<ApiResponse<Cliente>> {
        return this.apiService.get<Cliente>(`${this.endpoint}/${id}`);
    }

    /**
     * Buscar clientes por criterio
     */
    buscarClientes(criterio: string): Observable<ApiResponse<Cliente[]>> {
        return this.apiService.get<Cliente[]>(this.endpoint, {
            params: { q: criterio }
        });
    }

    /**
     * Crear un nuevo cliente
     */
    crearCliente(cliente: Cliente): Observable<ApiResponse<Cliente>> {
        return this.apiService.post<Cliente>(this.endpoint, cliente);
    }

    /**
     * Actualizar un cliente existente
     */
    actualizarCliente(id: number, cliente: Cliente): Observable<ApiResponse<Cliente>> {
        return this.apiService.put<Cliente>(`${this.endpoint}/${id}`, cliente);
    }

    /**
     * Actualizar parcialmente un cliente
     */
    actualizarParcialCliente(id: number, datos: Partial<Cliente>): Observable<ApiResponse<Cliente>> {
        return this.apiService.patch<Cliente>(`${this.endpoint}/${id}`, datos);
    }

    /**
     * Eliminar un cliente
     */
    eliminarCliente(id: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`${this.endpoint}/${id}`);
    }

    /**
     * Exportar clientes a Excel
     */
    exportarExcel(): Observable<Blob> {
        return this.apiService.downloadFile(`${this.endpoint}/export`, 'clientes.xlsx');
    }

    /**
     * Importar clientes desde archivo
     */
    importarClientes(file: File): Observable<ApiResponse<{ imported: number; errors: string[] }>> {
        return this.apiService.uploadFile<{ imported: number; errors: string[] }>(
            `${this.endpoint}/import`,
            file
        );
    }
}
