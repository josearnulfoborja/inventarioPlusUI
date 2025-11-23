import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { TipoEquipo } from '@/core/models/inventario.model';

@Injectable({ providedIn: 'root' })
export class TipoEquipoService {
    private readonly base = '/tipos_equipo';

    constructor(private readonly api: ApiService) {}

    listar(): Observable<TipoEquipo[]> {
        return this.api.get<TipoEquipo[]>(this.base).pipe(
            map((r: any) => {
                const d = r?.data ?? r;
                if (Array.isArray(d)) return d as TipoEquipo[];
                if (d?.items && Array.isArray(d.items)) return d.items as TipoEquipo[];
                if (d?.content && Array.isArray(d.content)) return d.content as TipoEquipo[];
                if (r?.items && Array.isArray(r.items)) return r.items as TipoEquipo[];
                if (r?.content && Array.isArray(r.content)) return r.content as TipoEquipo[];
                return [] as TipoEquipo[];
            })
        );
    }

    obtener(id: number) {
        return this.api.get<TipoEquipo>(`${this.base}/${id}`);
    }

    crear(t: TipoEquipo) {
        return this.api.post<TipoEquipo>(this.base, t);
    }

    actualizar(id: number, t: TipoEquipo) {
        return this.api.put<TipoEquipo>(`${this.base}/${id}`, t);
    }

    eliminar(id: number) {
        return this.api.delete(`${this.base}/${id}`).pipe(
            catchError((err) => {
                // Si el error es por parseo JSON pero el status es 200 o statusCode 200, considerarlo éxito
                console.log('Error capturado en eliminar():', err);
                if (err.status === 200 || err.statusCode === 200 || 
                    (err.message && err.message.includes('is not valid JSON') && err.status === 200)) {
                    return of({ success: true });
                }
                throw err;
            }),
            map(() => ({ success: true }))
        );
    }
}
