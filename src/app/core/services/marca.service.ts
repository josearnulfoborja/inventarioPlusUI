import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Marca } from '@/core/models/inventario.model';

@Injectable({ providedIn: 'root' })
export class MarcaService {
    private readonly base = '/marcas';

    constructor(private readonly api: ApiService) {}

    listar(): Observable<Marca[]> {
        return this.api.get<Marca[]>(this.base).pipe(
            map((r: any) => {
                const d = r?.data ?? r;
                if (Array.isArray(d)) return d as Marca[];
                if (d?.items && Array.isArray(d.items)) return d.items as Marca[];
                if (d?.content && Array.isArray(d.content)) return d.content as Marca[];
                if (r?.items && Array.isArray(r.items)) return r.items as Marca[];
                if (r?.content && Array.isArray(r.content)) return r.content as Marca[];
                return [] as Marca[];
            })
        );
    }

    obtener(id: number) {
        return this.api.get<Marca>(`${this.base}/${id}`);
    }

    crear(m: Marca) {
        return this.api.post<Marca>(this.base, m);
    }

    actualizar(id: number, m: Marca) {
        return this.api.put<Marca>(`${this.base}/${id}`, m);
    }

    eliminar(id: number) {
        return this.api.delete(`${this.base}/${id}`);
    }
}
