import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Interceptor HTTP para agregar token de autenticación y manejar errores globales
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    
    // Obtener token del localStorage (ajusta según tu implementación)
    const token = localStorage.getItem('auth_token');
    
    // Clonar la petición y agregar el token si existe
    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // Continuar con la petición y manejar errores
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Si el error es 401 (No autorizado), redirigir al login
            if (error.status === 401) {
                localStorage.removeItem('auth_token');
                router.navigate(['/auth/login2']);
            }
            
            return throwError(() => error);
        })
    );
};
