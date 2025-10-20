import { Injectable, signal } from '@angular/core';

/**
 * Servicio para controlar el estado de carga global
 */
@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingCount = 0;
    public isLoading = signal<boolean>(false);

    /**
     * Muestra el indicador de carga
     */
    show(): void {
        this.loadingCount++;
        this.isLoading.set(true);
    }

    /**
     * Oculta el indicador de carga
     */
    hide(): void {
        if (this.loadingCount > 0) {
            this.loadingCount--;
        }
        
        if (this.loadingCount === 0) {
            this.isLoading.set(false);
        }
    }

    /**
     * Fuerza el ocultamiento del indicador de carga
     */
    forceHide(): void {
        this.loadingCount = 0;
        this.isLoading.set(false);
    }
}
