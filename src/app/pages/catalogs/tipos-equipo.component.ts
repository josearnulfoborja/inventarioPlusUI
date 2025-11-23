import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TipoEquipo } from '@/core/models/inventario.model';
import { TipoEquipoService } from '@/core/services/tipo-equipo.service';

@Component({
    selector: 'app-tipos-equipo',
  standalone: true,
  imports: [CommonModule, FormsModule],
    template: `
    <div class="card">
      <div class="card-header flex justify-between items-center">
        <h3 class="text-lg font-medium">Tipos de Equipo</h3>
        <button class="btn btn-primary" (click)="nuevo()">+ Nuevo</button>
      </div>

      <div class="p-4">
        <div *ngIf="error" class="text-red-600 mb-2">{{ error }}</div>

        <div class="overflow-x-auto bg-white rounded-md border border-gray-100">
          <table class="min-w-full divide-y divide-gray-200" *ngIf="!cargando && tipos.length > 0">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let s of tipos">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ s.codigo }}</td>
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-700">{{ s.nombre }}</td>
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-600">{{ s.descripcion }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ s.activo ? 'Sí' : 'No' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button class="text-blue-600 hover:underline mr-4" (click)="editar(s)">Editar</button>
                  <button class="text-red-600 hover:underline" (click)="eliminar(s.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="!cargando && tipos.length === 0" class="p-6 text-sm text-gray-600">No hay tipos registrados.</div>
          <div *ngIf="cargando" class="p-6 text-sm text-gray-500">Cargando...</div>
        </div>

        <div *ngIf="mostrarFormulario" class="mt-4 bg-white p-4 rounded-md border border-gray-100">
          <div class="grid grid-cols-1 gap-3">
            <input placeholder="Código" [(ngModel)]="form.codigo" class="input" />
            <input placeholder="Nombre" [(ngModel)]="form.nombre" class="input" />
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
export class TiposEquipoComponent implements OnInit {
  tipos: TipoEquipo[] = [];
  cargando = false;
  error: string | null = null;
  mostrarFormulario = false;
  form: Partial<TipoEquipo> = { codigo: '', nombre: '', descripcion: '', activo: true };
  editingId?: number;

    constructor(private readonly service: TipoEquipoService) {}

    ngOnInit(): void { this.load(); }
    load() {
      this.cargando = true;
      this.error = null;
      this.service.listar().subscribe({ next: (r) => { console.log('TipoEquipoService.listar() result:', r); this.tipos = r; this.cargando = false; }, error: (e) => { console.error('Error loading tipos:', e); this.error = 'Error cargando tipos: ' + (e?.message ?? JSON.stringify(e)); this.cargando = false; } });
    }
    nuevo() { this.form = { codigo: '', nombre: '', descripcion: '', activo: true }; this.editingId = undefined; this.mostrarFormulario = true; }
    editar(t: TipoEquipo) { this.form = { ...t }; this.editingId = t.id; this.mostrarFormulario = true; }
    guardar() {
      const now = new Date().toISOString();
      const payload: any = { 
        codigo: this.form.codigo, 
        nombre: this.form.nombre, 
        descripcion: this.form.descripcion, 
        activo: !!this.form.activo,
        updatedAt: now
      };
      
      if (this.editingId) {
        this.service.actualizar(this.editingId, payload).subscribe({ 
          next: () => { this.mostrarFormulario = false; this.load(); }, 
          error: (err) => {
            console.error('Error al actualizar:', err);
            this.error = 'Error al actualizar: ' + (err?.message || 'Error desconocido');
          }
        });
      } else {
        payload.createdAt = now;
        this.service.crear(payload).subscribe({ 
          next: () => { this.mostrarFormulario = false; this.load(); }, 
          error: (err) => {
            console.error('Error al crear:', err);
            this.error = 'Error al crear: ' + (err?.message || 'Error en el servidor. Verifica que todos los campos estén completos.');
          }
        });
      }
    }
  eliminar(id?: number) {
    if (!id) return;
    if (!confirm('Eliminar?')) return;
    this.service.eliminar(id).subscribe({ next: () => this.load(), error: () => alert('Error') });
  }
    cancelar() { this.mostrarFormulario = false; }
}
