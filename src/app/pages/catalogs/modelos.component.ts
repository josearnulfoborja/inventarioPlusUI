import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modelo } from '@/core/models/inventario.model';
import { ModeloService } from '@/core/services/modelo.service';
import { MarcaService } from '@/core/services/marca.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-modelos',
  standalone: true,
  imports: [CommonModule, FormsModule],
    template: `
    <div class="card">
      <div class="card-header flex justify-between items-center">
        <h3 class="text-lg font-medium">Modelos</h3>
        <button class="btn btn-primary" (click)="nuevo()">+ Nuevo</button>
      </div>

      <div class="p-4">
        <div *ngIf="error" class="text-red-600 mb-2">{{ error }}</div>

        <div class="overflow-x-auto bg-white rounded-md border border-gray-100">
          <table class="min-w-full divide-y divide-gray-200" *ngIf="!cargando && modelos.length > 0">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca (descripcion)</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let s of modelos">
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-700">{{ getMarcaName(s) }}</td>
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-700">{{ s.nombre }}</td>
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-700">{{ s.descripcion }}</td>
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-600">{{ getMarcaDescription(s) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ s.activo ? 'Sí' : 'No' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button class="text-blue-600 hover:underline mr-4" (click)="editar(s)">Editar</button>
                  <button class="text-red-600 hover:underline" (click)="eliminar(s.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="!cargando && modelos.length === 0" class="p-6 text-sm text-gray-600">No hay modelos registrados.</div>
          <div *ngIf="cargando" class="p-6 text-sm text-gray-500">Cargando...</div>
        </div>

       

        <div *ngIf="mostrarFormulario" class="mt-4 bg-white p-4 rounded-md border border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select [(ngModel)]="form.marca" class="input">
              <option [ngValue]="undefined">-- Seleccionar marca --</option>
              <option *ngFor="let m of marcas" [ngValue]="m.id">{{ m.nombre }}</option>
            </select>
            <input placeholder="Nombre" [(ngModel)]="form.nombre" class="input" />
            <input placeholder="Código" [(ngModel)]="form.codigo" class="input" />
            <input placeholder="Descripción" [(ngModel)]="form.descripcion" class="input" />
            <label class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="form.activo" />
              <span>Activo</span>
            </label>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="btn" (click)="cancelar()">Cancelar</button>
            <button class="btn btn-primary" (click)="guardar()">Guardar</button>
          </div>
        </div>
      </div>
    </div>
    `
})
export class ModelosComponent implements OnInit {
  modelos: Modelo[] = [];
  cargando = false;
  error: string | null = null;
  mostrarFormulario = false;
  form: Partial<Modelo> = { nombre: '', marca: '', codigo: '', descripcion: '', activo: true };
  editingId?: number;
  marcasMap: Record<number, { nombre: string; descripcion?: string }> = {};
  marcas: any[] = [];

  constructor(private readonly service: ModeloService, private readonly marcaService: MarcaService) {}

    ngOnInit(): void { this.load(); }
    load() {
      this.cargando = true;
      this.error = null;
      // Load modelos and marcas in parallel so we can show marca name instead of id
      forkJoin([this.service.listar(), this.marcaService.listar()]).subscribe({
        next: ([modelos, marcas]) => {
          console.log('ModeloService.listar() result:', modelos);
          console.log('MarcaService.listar() result:', marcas);
          // build id -> nombre map
          this.marcasMap = {};
          for (const m of (marcas || [])) {
            if (m?.id) {
              this.marcasMap[m.id] = { nombre: m.nombre, descripcion: m.descripcion };
            }
          }
          // keep full list for form selects
          this.marcas = marcas || [];
          this.modelos = modelos;
          this.cargando = false;
        },
        error: (e) => {
          console.error('Error loading modelos or marcas:', e);
          this.error = 'Error cargando modelos: ' + (e?.message ?? JSON.stringify(e));
          this.cargando = false;
        }
      });
    }

    private getMarcaIdFromModel(modelo: any): number | undefined {
      if (!modelo) return undefined;
      const m = modelo.marca;
      // If marca is a number (id)
      if (typeof m === 'number') return Number(m);
      // If marca is a string that can be parsed as number
      if (typeof m === 'string') {
        const n = Number(m);
        if (!Number.isNaN(n)) return n;
      }
      // If marca is an object with an id property
      if (typeof m === 'object' && m !== null) {
        if (m.id != null) return Number(m.id);
      }
      // Fallback: check common alternate fields on modelo
      if (modelo.marcaId != null) return Number(modelo.marcaId);
      if (modelo.marca_id != null) return Number(modelo.marca_id);
      return undefined;
    }

    getMarcaName(modeloOrField: any): string {
      // Accept either the whole modelo object or the marca field
  const modelo = modeloOrField?.nombre === undefined ? undefined : modeloOrField;
      let marcaField = modelo ? modelo.marca : modeloOrField;

      const id = this.getMarcaIdFromModel(modelo ?? { marca: marcaField });
      if (id != null) return this.marcasMap[id]?.nombre ?? '-';

      // If marcaField is an object with nombre
      if (marcaField && typeof marcaField === 'object' && marcaField.nombre) return String(marcaField.nombre);

      // If marcaField is a plain string (already a name)
      if (typeof marcaField === 'string' && marcaField.trim() !== '') return marcaField;

      return '-';
    }

    getMarcaDescription(modeloOrField: any): string {
  const modelo = modeloOrField?.nombre === undefined ? undefined : modeloOrField;
      let marcaField = modelo ? modelo.marca : modeloOrField;

      const id = this.getMarcaIdFromModel(modelo ?? { marca: marcaField });
      if (id != null) return this.marcasMap[id]?.descripcion ?? '-';

      if (marcaField && typeof marcaField === 'object' && marcaField.descripcion) return String(marcaField.descripcion);

      return '-';
    }
    nuevo() { this.form = { nombre: '', marca: '', codigo: '', descripcion: '', activo: true }; this.editingId = undefined; this.mostrarFormulario = true; }
    editar(m: Modelo) { this.form = { ...m }; this.editingId = m.id; this.mostrarFormulario = true; }
    guardar() {
      const payload = { nombre: this.form.nombre, marca: this.form.marca, codigo: this.form.codigo, descripcion: this.form.descripcion, activo: !!this.form.activo } as Modelo;
      if (this.editingId) {
        this.service.actualizar(this.editingId, payload).subscribe({ next: () => { this.mostrarFormulario = false; this.load(); }, error: () => alert('Error al actualizar') });
      } else {
        this.service.crear(payload).subscribe({ next: () => { this.mostrarFormulario = false; this.load(); }, error: () => alert('Error al crear') });
      }
    }
  eliminar(id?: number) {
    if (!id) return;
    if (!confirm('Eliminar?')) return;
    this.service.eliminar(id).subscribe({ next: () => this.load(), error: () => alert('Error') });
  }
    cancelar() { this.mostrarFormulario = false; }
}
