import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor HTTP para mostrar/ocultar indicador de carga
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService);
    
    // Mostrar loading
    loadingService.show();
    
    // Continuar con la petición y ocultar loading al finalizar
    return next(req).pipe(
        finalize(() => {
            loadingService.hide();
        })
    );
};
