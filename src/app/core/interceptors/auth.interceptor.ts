import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';

/**
 * Interceptor HTTP para agregar token de autenticación y manejar errores globales
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const auth = inject(AuthService);

    // Obtener token del localStorage usando nuestra clave
    const token = localStorage.getItem('inventarioplus_token');
    // DEBUG: log token presence to help diagnose 403/CORS issues
    try {
        console.debug('[authInterceptor] token present:', !!token);
    } catch (e) {
        // ignore in environments without console
    }
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
                // clear our token and navigate to canonical login
                auth.clearLocalToken(false, true);
                router.navigate(['/auth/login2']);
            }
            
            return throwError(() => error);
        })
    );
};
