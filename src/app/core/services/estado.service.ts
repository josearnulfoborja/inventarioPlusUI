import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { EstadoEquipo } from '@/core/models/inventario.model';

@Injectable({ providedIn: 'root' })
export class EstadoService {
    // Nota: el backend expone el endpoint como '/estados_equipo'
    private readonly base = '/estados_equipo';

    constructor(private readonly api: ApiService) {}

    listar(): Observable<EstadoEquipo[]> {
        return this.api.get<EstadoEquipo[]>(this.base).pipe(map((r: any) => (r?.data ? r.data : r)));
    }

    obtener(id: number) {
        return this.api.get<EstadoEquipo>(`${this.base}/${id}`);
    }

    crear(e: EstadoEquipo) {
        return this.api.post<EstadoEquipo>(this.base, e);
    }

    actualizar(id: number, e: EstadoEquipo) {
        return this.api.put<EstadoEquipo>(`${this.base}/${id}`, e);
    }

    eliminar(id: number) {
        return this.api.delete(`${this.base}/${id}`);
    }
}
