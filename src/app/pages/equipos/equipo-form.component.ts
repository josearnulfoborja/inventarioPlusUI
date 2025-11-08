import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Equipo } from '@/core/models/inventario.model';

@Component({
    selector: 'app-equipo-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">Código</label>
          <input formControlName="codigo" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium">Nombre</label>
          <input formControlName="nombre" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium">Marca</label>
          <input formControlName="marca" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium">Tipo/Categoría</label>
          <input formControlName="categoria" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium">Modelo</label>
          <input formControlName="modelo" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium">Número de serie</label>
          <input formControlName="numeroSerie" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium">Estado</label>
          <select formControlName="estado" class="input w-full">
            <option value="">Seleccione...</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="PRESTADO">Prestado</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="BAJA">Baja</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Ubicación</label>
          <input formControlName="ubicacion" class="input w-full" />
        </div>
        <div class="col-span-2">
          <label class="inline-flex items-center">
            <input type="checkbox" formControlName="requiere_inspeccion" class="mr-2" />
            <span>Requiere inspección</span>
          </label>
        </div>
        <div class="col-span-2">
          <label class="inline-flex items-center">
            <input type="checkbox" formControlName="activo" class="mr-2" />
            <span>Activo</span>
          </label>
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn" (click)="onCancelar()">Cancelar</button>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar</button>
      </div>
    </form>
    `
})
export class EquipoFormComponent implements OnInit {
    @Input() equipo?: Equipo;
    @Output() guardar = new EventEmitter<{ equipo: Equipo }>();
    @Output() cancelar = new EventEmitter<void>();

  // form will be created in ngOnInit because FormBuilder is injected
  form: any;


  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      codigo: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      modelo: [''],
      numeroSerie: [''],
      estado: ['', [Validators.required]],
      ubicacion: [''],
      requiere_inspeccion: [false],
      activo: [true, [Validators.required]]
    });

    if (this.equipo) {
      this.form.patchValue({
        id: this.equipo.id,
        codigo: (this.equipo as any).codigo || '',
        nombre: this.equipo.nombre,
        marca: (this.equipo as any).marca || '',
        categoria: (this.equipo as any).categoria || (this.equipo as any).tipo || '',
        modelo: this.equipo.modelo,
        numeroSerie: this.equipo.numeroSerie || '',
        estado: this.equipo.estado,
        ubicacion: this.equipo.ubicacion,
        requiere_inspeccion: !!(this.equipo as any).requiere_inspeccion,
        activo: (this.equipo as any).activo !== undefined ? (this.equipo as any).activo : true
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    const value = this.form.value;
    // Limpiar strings vacíos en campos opcionales
    const clean = (v: any) => (typeof v === 'string' && v.trim() === '') ? undefined : v;
    const payload: any = {
      id: value.id,
      codigo: value.codigo,
      nombre: value.nombre,
      marca: value.marca,
      categoria: value.categoria,
      modelo: clean(value.modelo),
      numeroSerie: clean(value.numeroSerie),
      estado: value.estado,
      ubicacion: clean(value.ubicacion),
      requiere_inspeccion: value.requiere_inspeccion,
      activo: value.activo
    };
    this.guardar.emit({ equipo: payload });
  }

    onCancelar() {
        this.cancelar.emit();
    }
}
