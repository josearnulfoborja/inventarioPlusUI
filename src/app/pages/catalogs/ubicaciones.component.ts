import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ubicacion } from '@/core/models/inventario.model';
import { UbicacionService } from '@/core/services/ubicacion.service';

@Component({
    selector: 'app-ubicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
    template: `
    <div class="card">
      <div class="card-header flex justify-between items-center">
        <h3 class="text-lg font-medium">Ubicaciones</h3>
        <button class="btn btn-primary" (click)="nuevo()">+ Nuevo</button>
      </div>

      <div class="p-4">
        <div *ngIf="error" class="text-red-600 mb-2">{{ error }}</div>

        <div class="overflow-x-auto bg-white rounded-md border border-gray-100">
          <table class="min-w-full divide-y divide-gray-200" *ngIf="!cargando && ubicaciones.length > 0">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let s of ubicaciones">
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-700">{{ s.nombre }}</td>
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-600">{{ s.tipo || '-' }}</td>
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-700">{{ s.responsable || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button class="text-blue-600 hover:underline mr-4" (click)="editar(s)">Editar</button>
                  <button class="text-red-600 hover:underline" (click)="eliminar(s.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="!cargando && ubicaciones.length === 0" class="p-6 text-sm text-gray-600">No hay ubicaciones registradas.</div>
          <div *ngIf="cargando" class="p-6 text-sm text-gray-500">Cargando...</div>
        </div>

        <div *ngIf="mostrarFormulario" class="mt-4 bg-white p-4 rounded-md border border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Nombre" [(ngModel)]="form.nombre" class="input" />
            <input placeholder="Tipo" [(ngModel)]="form.tipo" class="input" />
            <input placeholder="Responsable" [(ngModel)]="form.responsable" class="input" />
            <input placeholder="Dirección" [(ngModel)]="form.direccion" class="input" />
            <input placeholder="Teléfono" [(ngModel)]="form.telefono" class="input" />
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
export class UbicacionesComponent implements OnInit {
  ubicaciones: Ubicacion[] = [];
  cargando = false;
  error: string | null = null;
  mostrarFormulario = false;
  form: Partial<Ubicacion> = { nombre: '', tipo: '', responsable: '', direccion: '', telefono: '', activo: true };
  editingId?: number;

    constructor(private readonly service: UbicacionService) {}

    ngOnInit(): void { this.load(); }
    load() {
      this.cargando = true;
      this.error = null;
      this.service.listar().subscribe({ next: (r) => { console.log('UbicacionService.listar() result:', r); this.ubicaciones = r; this.cargando = false; }, error: (e) => { console.error('Error loading ubicaciones:', e); this.error = 'Error cargando ubicaciones: ' + (e?.message ?? JSON.stringify(e)); this.cargando = false; } });
    }
    nuevo() { this.form = { nombre: '', tipo: '', responsable: '', direccion: '', telefono: '', activo: true }; this.editingId = undefined; this.mostrarFormulario = true; }
    editar(u: Ubicacion) { this.form = { ...u }; this.editingId = u.id; this.mostrarFormulario = true; }
    guardar() {
      const payload = { nombre: this.form.nombre, tipo: this.form.tipo, responsable: this.form.responsable, direccion: this.form.direccion, telefono: this.form.telefono, activo: !!this.form.activo } as Ubicacion;
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
