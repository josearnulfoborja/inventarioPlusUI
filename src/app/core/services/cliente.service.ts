import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/core/models/api.model';
import { Cliente, ClienteFiltro } from '@/core/models/inventario.model';

/**
 * Servicio para gestión de Clientes
 * Maneja todas las operaciones CRUD de clientes
 */
@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private readonly endpoint = '/clientes';

    constructor(private readonly apiService: ApiService) {}

    /**
     * Obtener todos los clientes (paginado)
     * @param page Número de página
     * @param pageSize Tamaño de página
     * @param filtros Filtros de búsqueda
     */
    getClientes(
        page: number = 1,
        pageSize: number = 10,
        filtros?: ClienteFiltro
    ): Observable<PaginatedResponse<Cliente>> {
        return this.apiService.getPaginated<Cliente>(
            this.endpoint,
            page,
            pageSize,
            { params: filtros as any }
        );
    }

    /**
     * Obtener un cliente por ID
     * @param id ID del cliente
     */
    getClienteById(id: number): Observable<ApiResponse<Cliente>> {
        return this.apiService.get<Cliente>(`${this.endpoint}/${id}`);
    }

    /**
     * Buscar clientes por criterio
     * @param criterio Texto de búsqueda
     */
    buscarClientes(criterio: string): Observable<ApiResponse<Cliente[]>> {
        return this.apiService.get<Cliente[]>(`${this.endpoint}/buscar`, {
            params: { q: criterio }
        });
    }

    /**
     * Buscar cliente por documento
     * @param tipoDocumento Tipo de documento
     * @param numeroDocumento Número de documento
     */
    buscarPorDocumento(
        tipoDocumento: string,
        numeroDocumento: string
    ): Observable<ApiResponse<Cliente>> {
        return this.apiService.get<Cliente>(`${this.endpoint}/documento`, {
            params: { tipo: tipoDocumento, numero: numeroDocumento }
        });
    }

    /**
     * Crear un nuevo cliente
     * @param cliente Datos del cliente
     */
    crearCliente(cliente: Cliente): Observable<ApiResponse<Cliente>> {
        return this.apiService.post<Cliente>(this.endpoint, cliente);
    }

    /**
     * Actualizar un cliente existente
     * @param id ID del cliente
     * @param cliente Datos actualizados del cliente
     */
    actualizarCliente(id: number, cliente: Cliente): Observable<ApiResponse<Cliente>> {
        return this.apiService.put<Cliente>(`${this.endpoint}/${id}`, cliente);
    }

    /**
     * Actualizar parcialmente un cliente
     * @param id ID del cliente
     * @param datos Datos parciales a actualizar
     */
    actualizarParcial(id: number, datos: Partial<Cliente>): Observable<ApiResponse<Cliente>> {
        return this.apiService.patch<Cliente>(`${this.endpoint}/${id}`, datos);
    }

    /**
     * Activar/desactivar un cliente
     * @param id ID del cliente
     * @param activo Estado activo
     */
    cambiarEstado(id: number, activo: boolean): Observable<ApiResponse<Cliente>> {
        return this.apiService.patch<Cliente>(`${this.endpoint}/${id}/estado`, { activo });
    }

    /**
     * Eliminar un cliente
     * @param id ID del cliente
     */
    eliminarCliente(id: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(`${this.endpoint}/${id}`);
    }

    /**
     * Obtener historial de préstamos de un cliente
     * @param id ID del cliente
     */
    getHistorialPrestamos(id: number): Observable<ApiResponse<any[]>> {
        return this.apiService.get<any[]>(`${this.endpoint}/${id}/prestamos`);
    }

    /**
     * Exportar clientes a Excel
     * @param filtros Filtros aplicados
     */
    exportarExcel(filtros?: ClienteFiltro): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/export/excel?${this.buildQueryString(filtros)}`,
            'clientes.xlsx'
        );
    }

    /**
     * Exportar clientes a PDF
     * @param filtros Filtros aplicados
     */
    exportarPDF(filtros?: ClienteFiltro): Observable<Blob> {
        return this.apiService.downloadFile(
            `${this.endpoint}/export/pdf?${this.buildQueryString(filtros)}`,
            'clientes.pdf'
        );
    }

    /**
     * Importar clientes desde archivo Excel
     * @param file Archivo Excel
     */
    importarExcel(file: File): Observable<ApiResponse<{ imported: number; errors: string[] }>> {
        return this.apiService.uploadFile<{ imported: number; errors: string[] }>(
            `${this.endpoint}/import`,
            file
        );
    }

    /**
     * Construir query string desde filtros
     */
    private buildQueryString(filtros?: ClienteFiltro): string {
        if (!filtros) return '';
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filtros)) {
            if (value !== null && value !== undefined) {
                params.append(key, value.toString());
            }
        }
        return params.toString();
    }
}
