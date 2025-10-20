/**
 * Interfaz genérica para respuestas del API
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

/**
 * Interfaz para respuestas paginadas
 */
export interface PaginatedResponse<T = any> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
    };
    message?: string;
}

/**
 * Interfaz para errores del API
 */
export interface ApiError {
    statusCode: number;
    message: string;
    errors?: string[];
    timestamp?: string;
}

/**
 * Opciones para peticiones HTTP
 */
export interface RequestOptions {
    params?: { [key: string]: any };
    headers?: { [key: string]: string };
    responseType?: 'json' | 'blob' | 'text';
    reportProgress?: boolean;
}
