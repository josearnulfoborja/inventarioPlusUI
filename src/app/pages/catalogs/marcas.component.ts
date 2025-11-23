import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Marca } from '@/core/models/inventario.model';
import { MarcaService } from '@/core/services/marca.service';

@Component({
  selector: 'app-marcas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <div class="card-header flex justify-between items-center">
      <h3 class="text-lg font-medium">Marcas</h3>
      <button class="btn btn-primary" (click)="nuevo()">+ Nuevo</button>
    </div>

    <div class="p-4">
      <div *ngIf="error" class="text-red-600 mb-2">{{ error }}</div>

      <div class="overflow-x-auto bg-white rounded-md border border-gray-100">
        <table class="min-w-full divide-y divide-gray-200" *ngIf="!cargando && marcas.length > 0">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let m of marcas">
              <td class="px-6 py-4 whitespace-normal text-sm text-gray-700">{{ m.nombre }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ m.activo ? 'Sí' : 'No' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="text-blue-600 hover:underline mr-4" (click)="editar(m)">Editar</button>
                <button class="text-red-600 hover:underline" (click)="eliminar(m.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!cargando && marcas.length === 0" class="p-6 text-sm text-gray-600">No hay marcas registradas.</div>
        <div *ngIf="cargando" class="p-6 text-sm text-gray-500">Cargando...</div>
      </div>

      <div *ngIf="mostrarFormulario" class="mt-4 bg-white p-4 rounded-md border border-gray-100">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Nombre" [(ngModel)]="form.nombre" class="input" />
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
export class MarcasComponent implements OnInit {
  marcas: Marca[] = [];
  cargando = false;
  error: string | null = null;
  mostrarFormulario = false;
  form: Partial<Marca> = { nombre: '', activo: true };
  editingId?: number;

  constructor(private readonly service: MarcaService) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.cargando = true;
    this.error = null;
    this.service.listar().subscribe({ next: (r) => { console.log('MarcaService.listar() result:', r); this.marcas = r; this.cargando = false; }, error: (e) => { console.error('Error loading marcas:', e); this.error = 'Error cargando marcas: ' + (e?.message ?? JSON.stringify(e)); this.cargando = false; } });
  }

  nuevo() { this.form = { nombre: '', activo: true }; this.editingId = undefined; this.mostrarFormulario = true; }
  editar(m: Marca) { this.form = { ...m }; this.editingId = m.id; this.mostrarFormulario = true; }

  guardar() {
    // Validación básica
    if (!this.form.nombre || this.form.nombre.trim() === '') {
      alert('El nombre es requerido');
      return;
    }

    const ahora = new Date().toISOString();
    const payload = { 
      nombre: this.form.nombre.trim(), 
      activo: this.form.activo !== undefined ? this.form.activo : true,
      createdAt: ahora,
      updatedAt: ahora
    } as Marca;
    
    console.log('Guardando marca:', payload);
    
    if (this.editingId) {
      // En actualización, solo enviamos updatedAt
      const updatePayload = {
        nombre: payload.nombre,
        activo: payload.activo,
        updatedAt: ahora
      } as Marca;
      
      this.service.actualizar(this.editingId, updatePayload).subscribe({ 
        next: () => { 
          this.mostrarFormulario = false; 
          this.load(); 
        }, 
        error: (err) => {
          console.error('Error al actualizar marca:', err);
          alert('Error al actualizar: ' + (err?.error?.message || err?.message || JSON.stringify(err)));
        }
      });
    } else {
      this.service.crear(payload).subscribe({ 
        next: () => { 
          this.mostrarFormulario = false; 
          this.load(); 
        }, 
        error: (err) => {
          console.error('Error al crear marca:', err);
          alert('Error al crear: ' + (err?.error?.message || err?.message || JSON.stringify(err)));
        }
      });
    }
  }

  eliminar(id?: number) {
    if (!id) {
      alert('ID de marca no válido');
      return;
    }
    if (!confirm('¿Eliminar marca?')) return;
    
    console.log('Eliminando marca con ID:', id);
    
    this.service.eliminar(id).subscribe({ 
      next: () => {
        console.log('Marca eliminada exitosamente');
        this.load();
      }, 
      error: (err) => {
        console.error('Error al eliminar marca:', err);
        
        // Si el backend devuelve status 200 pero con texto plano (error de parseo JSON)
        if (err.statusCode === 200 || (err as any).original?.name === 'SyntaxError') {
          console.log('Eliminación exitosa a pesar del error de parseo');
          this.load();
          return;
        }
        
        alert('Error al eliminar: ' + (err?.message || JSON.stringify(err)));
      }
    });
  }

  cancelar() { this.mostrarFormulario = false; }
}
