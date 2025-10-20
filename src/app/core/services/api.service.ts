import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError, map } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse, RequestOptions } from '@/core/models/api.model';

/**
 * Servicio centralizado para todas las peticiones HTTP al servidor
 * Proporciona métodos GET, POST, PUT, DELETE con manejo de errores
 */
@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly apiUrl = environment.apiUrl;
    private readonly timeout = environment.apiTimeout;

    constructor(private readonly http: HttpClient) {}

    /**
     * Petición GET
     * @param endpoint Ruta del endpoint (ej: '/clientes', '/usuarios/1')
     * @param options Opciones adicionales (params, headers)
     * @returns Observable con la respuesta del servidor
     */
    get<T>(endpoint: string, options?: RequestOptions): Observable<ApiResponse<T>> {
        const url = this.buildUrl(endpoint);
        const httpOptions = this.buildHttpOptions(options);

        return this.http.get<ApiResponse<T>>(url, httpOptions).pipe(
            timeout(this.timeout),
            catchError(this.handleError)
        );
    }

    /**
     * Petición GET para listas paginadas
     * @param endpoint Ruta del endpoint
     * @param page Número de página
     * @param pageSize Tamaño de página
     * @param options Opciones adicionales
     */
    getPaginated<T>(
        endpoint: string,
        page: number = 1,
        pageSize: number = 10,
        options?: RequestOptions
    ): Observable<PaginatedResponse<T>> {
        const params = {
            ...options?.params,
            page: page.toString(),
            pageSize: pageSize.toString()
        };

        const url = this.buildUrl(endpoint);
        const httpOptions = this.buildHttpOptions({ ...options, params });

        return this.http.get<PaginatedResponse<T>>(url, httpOptions).pipe(
            timeout(this.timeout),
            catchError(this.handleError)
        );
    }

    /**
     * Petición POST
     * @param endpoint Ruta del endpoint
     * @param body Datos a enviar
     * @param options Opciones adicionales
     */
    post<T>(endpoint: string, body: any, options?: RequestOptions): Observable<ApiResponse<T>> {
        const url = this.buildUrl(endpoint);
        const httpOptions = this.buildHttpOptions(options);

        return this.http.post<ApiResponse<T>>(url, body, httpOptions).pipe(
            timeout(this.timeout),
            catchError(this.handleError)
        );
    }

    /**
     * Petición PUT
     * @param endpoint Ruta del endpoint
     * @param body Datos a actualizar
     * @param options Opciones adicionales
     */
    put<T>(endpoint: string, body: any, options?: RequestOptions): Observable<ApiResponse<T>> {
        const url = this.buildUrl(endpoint);
        const httpOptions = this.buildHttpOptions(options);

        return this.http.put<ApiResponse<T>>(url, body, httpOptions).pipe(
            timeout(this.timeout),
            catchError(this.handleError)
        );
    }

    /**
     * Petición PATCH
     * @param endpoint Ruta del endpoint
     * @param body Datos a actualizar parcialmente
     * @param options Opciones adicionales
     */
    patch<T>(endpoint: string, body: any, options?: RequestOptions): Observable<ApiResponse<T>> {
        const url = this.buildUrl(endpoint);
        const httpOptions = this.buildHttpOptions(options);

        return this.http.patch<ApiResponse<T>>(url, body, httpOptions).pipe(
            timeout(this.timeout),
            catchError(this.handleError)
        );
    }

    /**
     * Petición DELETE
     * @param endpoint Ruta del endpoint
     * @param options Opciones adicionales
     */
    delete<T>(endpoint: string, options?: RequestOptions): Observable<ApiResponse<T>> {
        const url = this.buildUrl(endpoint);
        const httpOptions = this.buildHttpOptions(options);

        return this.http.delete<ApiResponse<T>>(url, httpOptions).pipe(
            timeout(this.timeout),
            catchError(this.handleError)
        );
    }

    /**
     * Descarga de archivos
     * @param endpoint Ruta del endpoint
     * @param filename Nombre del archivo a descargar
     */
    downloadFile(endpoint: string, filename: string): Observable<Blob> {
        const url = this.buildUrl(endpoint);
        
        return this.http.get(url, {
            responseType: 'blob'
        }).pipe(
            timeout(this.timeout),
            map(blob => {
                // Trigger download
                const downloadUrl = globalThis.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = filename;
                link.click();
                globalThis.URL.revokeObjectURL(downloadUrl);
                return blob;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Upload de archivos
     * @param endpoint Ruta del endpoint
     * @param file Archivo a subir
     * @param additionalData Datos adicionales del formulario
     */
    uploadFile<T>(endpoint: string, file: File, additionalData?: { [key: string]: any }): Observable<ApiResponse<T>> {
        const url = this.buildUrl(endpoint);
        const formData = new FormData();
        
        formData.append('file', file, file.name);
        
        // Agregar datos adicionales al FormData
        if (additionalData) {
            for (const key of Object.keys(additionalData)) {
                formData.append(key, additionalData[key]);
            }
        }

        return this.http.post<ApiResponse<T>>(url, formData).pipe(
            timeout(this.timeout),
            catchError(this.handleError)
        );
    }

    /**
     * Construye la URL completa del endpoint
     */
    private buildUrl(endpoint: string): string {
        // Asegurarse de que el endpoint comience con /
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${this.apiUrl}${normalizedEndpoint}`;
    }

    /**
     * Construye las opciones HTTP (headers, params)
     */
    private buildHttpOptions(options?: RequestOptions): { headers: HttpHeaders; params: HttpParams } {
        let httpParams = new HttpParams();
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        // Agregar parámetros de query
        if (options?.params) {
            for (const key of Object.keys(options.params)) {
                const value = options.params[key];
                if (value !== null && value !== undefined) {
                    httpParams = httpParams.append(key, value.toString());
                }
            }
        }

        // Agregar headers personalizados
        if (options?.headers) {
            for (const key of Object.keys(options.headers)) {
                httpHeaders = httpHeaders.set(key, options.headers[key]);
            }
        }

        return {
            headers: httpHeaders,
            params: httpParams
        };
    }

    /**
     * Maneja los errores de las peticiones HTTP
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ocurrió un error desconocido';
        
        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del lado del servidor
            switch (error.status) {
                case 0:
                    errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
                    break;
                case 400:
                    errorMessage = error.error?.message || 'Solicitud incorrecta';
                    break;
                case 401:
                    errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.';
                    break;
                case 403:
                    errorMessage = 'No tienes permisos para realizar esta acción.';
                    break;
                case 404:
                    errorMessage = 'Recurso no encontrado.';
                    break;
                case 500:
                    errorMessage = 'Error interno del servidor.';
                    break;
                case 503:
                    errorMessage = 'Servicio no disponible. Intenta más tarde.';
                    break;
                default:
                    errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
            }
        }

        console.error('API Error:', {
            status: error.status,
            message: errorMessage,
            error: error.error
        });

        return throwError(() => ({
            statusCode: error.status,
            message: errorMessage,
            errors: error.error?.errors || [],
            timestamp: new Date().toISOString()
        }));
    }
}
