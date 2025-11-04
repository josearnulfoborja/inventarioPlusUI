import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipo } from '@/core/models/inventario.model';
import { EquipoService } from '@/core/services/equipo.service';
import { EquipoFormComponent } from '@/pages/equipos/equipo-form.component';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { TipoEquipoService } from '@/core/services/tipo-equipo.service';
import { ModeloService } from '@/core/services/modelo.service';
import { UbicacionService } from '@/core/services/ubicacion.service';
import { MarcaService } from '@/core/services/marca.service';

@Component({
    selector: 'app-equipos',
    standalone: true,
    imports: [CommonModule, EquipoFormComponent],
    template: `
    <div class="card">
      <div class="card-header flex justify-between items-center">
        <h2 class="text-xl font-semibold">Equipos</h2>
        <button class="btn btn-primary" (click)="nuevoEquipo()">+ Nuevo Equipo</button>
      </div>
      <div class="p-4">
        <div *ngIf="error" class="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-4">{{ error }}</div>

        <div *ngIf="cargando" class="text-center py-6">Cargando equipos...</div>

        <table *ngIf="!cargando && equipos.length" class="min-w-full bg-white border">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 text-left">Nombre</th>
              <th class="px-4 py-2 text-left">Tipo</th>
              <th class="px-4 py-2 text-left">Marca</th>
              <th class="px-4 py-2 text-left">Modelo</th>
              <th class="px-4 py-2 text-left">Nº Serie</th>
              <th class="px-4 py-2 text-left">Ubicación</th>
              <th class="px-4 py-2 text-center">Requiere inspección</th>
              <th class="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of equipos" class="border-b hover:bg-gray-50">
              <td class="px-4 py-2">{{ e.nombre }}</td>
              <td class="px-4 py-2">{{ getTipoName(e) }}</td>
              <td class="px-4 py-2">{{ getMarcaName(e) }}</td>
              <td class="px-4 py-2">{{ getModeloName(e) }}</td>
              <td class="px-4 py-2">{{ e.numeroSerie || '-' }}</td>
              <td class="px-4 py-2">{{ getUbicacionName(e) }}</td>
              <td class="px-4 py-2 text-center">{{ prop(e,'requiere_inspeccion') ? 'Sí' : 'No' }}</td>
                                            <td class="px-4 py-2 text-center">
                                                <button class="mr-2 text-yellow-600" (click)="editarEquipo(e)">Editar</button>
                                                <button class="text-red-600" (click)="eliminarEquipo(e.id)">Eliminar</button>
                                            </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!cargando && !equipos.length" class="text-center text-gray-500 py-8">No hay equipos registrados.</div>

        <div *ngIf="mostrarFormulario" class="mt-4">
          <app-equipo-form [equipo]="equipoSeleccionado" (guardar)="onGuardar($event)" (cancelar)="onCancelar()"></app-equipo-form>
        </div>
      </div>
    </div>
    `
})
export class Equipos implements OnInit {
    equipos: Equipo[] = [];
    tiposMap: Record<number, string> = {};
    modelosMap: Record<number, string> = {};
    // map modeloId -> marcaId or marcaName (if available in modelo)
    modeloMarcaMap: Record<number, number | string | undefined> = {};
    ubicacionesMap: Record<number, string> = {};
    marcasMap: Record<number, { nombre: string; descripcion?: string }> = {};
    cargando = false;
    error: string | null = null;
    mostrarFormulario = false;
    equipoSeleccionado?: any;
    esEdicion = false;

    constructor(
        private readonly equipoService: EquipoService,
        private readonly tipoService: TipoEquipoService,
        private readonly modeloService: ModeloService,
        private readonly ubicacionService: UbicacionService,
        private readonly marcaService: MarcaService
    ) {}

    // helper used in templates to safely access dynamic props without parser errors
    prop(obj: any, key: string) {
        return obj?.[key];
    }

    ngOnInit(): void {
        this.cargarEquipos();
    }

    cargarEquipos() {
        this.cargando = true;
        this.error = null;

        // Load equipos (paginated data -> .data) and lookup lists in parallel
        forkJoin({
            equiposResp: this.equipoService.getEquipos(1, 200),
            tipos: this.tipoService.listar(),
            modelos: this.modeloService.listar(),
            ubicaciones: this.ubicacionService.listar(),
            marcas: this.marcaService.listar()
        }).pipe(
            map((res: any) => {
                const equiposResp = res.equiposResp;
                // normalize paginated or wrapped responses into an array
                const equipos = equiposResp?.data ?? equiposResp?.data?.items ?? equiposResp?.data?.content ?? equiposResp?.items ?? equiposResp?.content ?? equiposResp ?? [];
                return {
                    equipos: Array.isArray(equipos) ? equipos : [],
                    tipos: res.tipos ?? [],
                    modelos: res.modelos ?? [],
                    ubicaciones: res.ubicaciones ?? [],
                    marcas: res.marcas ?? []
                };
            })
        ).subscribe({
            next: ({ equipos, tipos, modelos, ubicaciones, marcas }) => {
                // debug: log payload shapes so we can adapt to backend names
                console.log('Loaded equipos count:', (equipos || []).length);
                console.log('Sample equipo[0]:', (equipos || [])[0]);
                console.log('Loaded tipos count:', (tipos || []).length, 'sample:', (tipos || [])[0]);
                console.log('Loaded modelos count:', (modelos || []).length, 'sample:', (modelos || [])[0]);
                console.log('Loaded ubicaciones count:', (ubicaciones || []).length, 'sample:', (ubicaciones || [])[0]);
                if (equipos?.length) {
                    console.log('Equipo[0] keys:', Object.keys(equipos[0]));
                }

                // build maps
                this.tiposMap = {};
                for (const t of tipos || []) { if (t?.id) this.tiposMap[t.id] = this.getItemName(t); }
                this.modelosMap = {};
                this.modeloMarcaMap = {};
                for (const m of modelos || []) {
                    if (m?.id) {
                        this.modelosMap[m.id] = this.getItemName(m);
                        // try to extract marca info from modelo if present
                        if (m.marca != null) {
                            if (typeof m.marca === 'object' && m.marca.id != null) {
                                this.modeloMarcaMap[m.id] = Number(m.marca.id);
                            } else if (typeof m.marca === 'number') {
                                this.modeloMarcaMap[m.id] = Number(m.marca);
                            } else if (typeof m.marca === 'string') {
                                this.modeloMarcaMap[m.id] = String(m.marca);
                            }
                        } else if (m.marcaId != null) {
                            this.modeloMarcaMap[m.id] = Number(m.marcaId);
                        } else if (m.marca_id != null) {
                            this.modeloMarcaMap[m.id] = Number(m.marca_id);
                        }
                    }
                }
                this.ubicacionesMap = {};
                for (const u of ubicaciones || []) { if (u?.id) this.ubicacionesMap[u.id] = this.getItemName(u); }
                this.marcasMap = {};
                for (const b of marcas || []) { if (b?.id) this.marcasMap[b.id] = { nombre: this.getItemName(b), descripcion: b.descripcion }; }

                // normalize common alternate field names coming from backend
                for (const it of (equipos || [])) {
                    // id variants
                    if (it.id == null && it.idEquipo != null) it.id = it.idEquipo;
                    if (it.id == null && it.id_equipo != null) it.id = it.id_equipo;
                    // nombre variants
                    if (!it.nombre && (it.nombreEquipo || it.nombre_equipo)) it.nombre = it.nombreEquipo ?? it.nombre_equipo;
                    // modelo variants: if backend provides modeloId or modelo_id, map to modelo
                    if ((it.modelo == null || it.modelo === '') && (it.modeloId != null || it.modelo_id != null)) {
                        it.modelo = it.modeloId ?? it.modelo_id;
                    }
                    // marca variants
                    if ((it.marca == null || it.marca === '') && (it.marcaId != null || it.marca_id != null)) {
                        it.marca = it.marcaId ?? it.marca_id;
                    }
                    // ubicacion variants
                    if ((it.ubicacion == null || it.ubicacion === '') && (it.ubicacionId != null || it.ubicacion_id != null)) {
                        it.ubicacion = it.ubicacionId ?? it.ubicacion_id;
                    }
                    // requiere inspeccion variant (some backends use requiereEspecialista)
                    if (it.requiere_inspeccion == null && it.requiereEspecialista != null) {
                        it.requiere_inspeccion = it.requiereEspecialista;
                    }
                }
                this.equipos = equipos;
                this.cargando = false;
            },
            error: (err: any) => {
                console.error(err);
                this.error = 'No se pudieron cargar los equipos';
                this.cargando = false;
            }
        });
    }

    private getRelatedId(obj: any, field: string): number | undefined {
        if (!obj) return undefined;
        const v = obj[field];
        if (typeof v === 'number') return Number(v);
        if (typeof v === 'string') { const n = Number(v); if (!Number.isNaN(n)) return n; }
        if (typeof v === 'object' && v !== null) {
            if (v.id != null) return Number(v.id);
            if (v._id != null) return Number(v._id);
        }
        // alternate naming
        if (obj[`${field}Id`] != null) return Number(obj[`${field}Id`]);
        if (obj[`${field}_id`] != null) return Number(obj[`${field}_id`]);
        return undefined;
    }

    getTipoName(e: any): string {
        const id = this.getRelatedId(e, 'categoria') ?? this.getRelatedId(e, 'tipo');
        if (id != null) return this.tiposMap[id] ?? '-';
        // fallback if field is object with nombre
        const val = e.categoria ?? e.tipo;
        if (val && typeof val === 'object' && val.nombre) return String(val.nombre);
        if (typeof val === 'string' && val.trim() !== '') return val;
        return '-';
    }

    getModeloName(e: any): string {
        const id = this.getRelatedId(e, 'modelo');
        if (id != null) return this.modelosMap[id] ?? '-';
        const val = e.modelo;
        if (val && typeof val === 'object' && val.nombre) return String(val.nombre);
        if (typeof val === 'string' && val.trim() !== '') return val;
        return '-';
    }

    getMarcaName(e: any): string {
        // similar approach as in modelos.component
        const mField = e.marca ?? e.brand ?? e.marca_id ?? e.marcaId ?? e.modelo?.marca ?? undefined;
        // If the equipo has a marca id field
        const id = this.getRelatedId(e, 'marca') ?? this.getRelatedId({ marca: mField }, 'marca');
        if (id != null) return this.marcasMap[id]?.nombre ?? '-';

        // If mField is an object with nombre
        if (mField && typeof mField === 'object' && mField.nombre) return String(mField.nombre);

        if (typeof mField === 'string' && mField.trim() !== '') return mField;

        // If not directly present, try to resolve marca via modelo -> modeloMarcaMap
        const modeloId = this.getRelatedId(e, 'modelo');
        if (modeloId != null) {
            const fromModelo = this.modeloMarcaMap[modeloId];
            if (fromModelo != null) {
                if (typeof fromModelo === 'number') return this.marcasMap[fromModelo]?.nombre ?? '-';
                if (typeof fromModelo === 'string' && fromModelo.trim() !== '') return fromModelo;
            }
        }

        return '-';
    }

    getUbicacionName(e: any): string {
        const id = this.getRelatedId(e, 'ubicacion');
        if (id != null) return this.ubicacionesMap[id] ?? '-';
        const val = e.ubicacion;
        if (val && typeof val === 'object' && val.nombre) return String(val.nombre);
        if (typeof val === 'string' && val.trim() !== '') return val;
        return '-';
    }

    // Flexible name extractor for lookup items
    private getItemName(item: any): string {
        if (!item) return String(item ?? '-');
        // common name-like fields
        return String(item.nombre ?? item.name ?? item.nombreTipo ?? item.tipoNombre ?? item.tipo ?? item.descripcion ?? item.codigo ?? item.title ?? item.label ?? item.nombre_completo ?? item.nombreCompleto ?? item.id ?? '-');
    }

    nuevoEquipo() {
        this.equipoSeleccionado = undefined;
        this.esEdicion = false;
        this.mostrarFormulario = true;
    }

    editarEquipo(e: Equipo) {
        // clone and map to expected form shape
        this.equipoSeleccionado = { ...e } as any;
        this.esEdicion = true;
        this.mostrarFormulario = true;
    }

    eliminarEquipo(id?: number) {
        if (!id) return;
        if (!confirm('¿Seguro que deseas eliminar este equipo?')) return;
        this.equipoService.eliminarEquipo(id).subscribe({
            next: () => this.cargarEquipos(),
            error: (err) => {
                console.error(err);
                alert('Error al eliminar el equipo');
            }
        });
    }

    onGuardar(event: { equipo: any }) {
        const equipo = event.equipo;
            if (this.esEdicion && equipo.id) {
            this.equipoService.actualizarEquipo(equipo.id, equipo).subscribe({
                next: () => {
                    this.mostrarFormulario = false;
                    this.cargarEquipos();
                },
                error: (err) => {
                    console.error(err);
                    alert('Error al actualizar el equipo');
                }
            });
        } else {
            this.equipoService.crearEquipo(equipo).subscribe({
                next: () => {
                    this.mostrarFormulario = false;
                    this.cargarEquipos();
                },
                error: (err) => {
                    console.error(err);
                    alert('Error al crear el equipo');
                }
            });
        }
    }

    onCancelar() {
        this.mostrarFormulario = false;
    }
}

