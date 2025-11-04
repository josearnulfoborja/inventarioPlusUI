import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Ubicacion } from '@/core/models/inventario.model';

@Injectable({ providedIn: 'root' })
export class UbicacionService {
    private readonly base = '/ubicaciones';

    constructor(private readonly api: ApiService) {}

    listar(): Observable<Ubicacion[]> {
        return this.api.get<Ubicacion[]>(this.base).pipe(
            map((r: any) => {
                const d = r?.data ?? r;
                if (Array.isArray(d)) return d as Ubicacion[];
                if (d?.items && Array.isArray(d.items)) return d.items as Ubicacion[];
                if (d?.content && Array.isArray(d.content)) return d.content as Ubicacion[];
                if (r?.items && Array.isArray(r.items)) return r.items as Ubicacion[];
                if (r?.content && Array.isArray(r.content)) return r.content as Ubicacion[];
                return [] as Ubicacion[];
            })
        );
    }

    obtener(id: number) {
        return this.api.get<Ubicacion>(`${this.base}/${id}`);
    }

    crear(u: Ubicacion) {
        return this.api.post<Ubicacion>(this.base, u);
    }

    actualizar(id: number, u: Ubicacion) {
        return this.api.put<Ubicacion>(`${this.base}/${id}`, u);
    }

    eliminar(id: number) {
        return this.api.delete(`${this.base}/${id}`);
    }
}
