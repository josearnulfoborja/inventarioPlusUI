import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Modelo } from '@/core/models/inventario.model';

@Injectable({ providedIn: 'root' })
export class ModeloService {
    private readonly base = '/modelos';

    constructor(private readonly api: ApiService) {}

    listar(): Observable<Modelo[]> {
        return this.api.get<Modelo[]>(this.base).pipe(
            map((r: any) => {
                const d = r?.data ?? r;
                if (Array.isArray(d)) return d as Modelo[];
                if (d?.items && Array.isArray(d.items)) return d.items as Modelo[];
                if (d?.content && Array.isArray(d.content)) return d.content as Modelo[];
                if (r?.items && Array.isArray(r.items)) return r.items as Modelo[];
                if (r?.content && Array.isArray(r.content)) return r.content as Modelo[];
                return [] as Modelo[];
            })
        );
    }

    obtener(id: number) {
        return this.api.get<Modelo>(`${this.base}/${id}`);
    }

    crear(m: Modelo) {
        return this.api.post<Modelo>(this.base, m);
    }

    actualizar(id: number, m: Modelo) {
        return this.api.put<Modelo>(`${this.base}/${id}`, m);
    }

    eliminar(id: number) {
        return this.api.delete(`${this.base}/${id}`);
    }
}
