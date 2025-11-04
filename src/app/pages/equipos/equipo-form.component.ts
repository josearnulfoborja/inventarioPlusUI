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
          <label class="block text-sm font-medium">Nombre</label>
          <input formControlName="nombre" class="input w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium">Tipo</label>
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
          <input formControlName="estado" class="input w-full" />
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
      nombre: ['', [Validators.required]],
      categoria: [''], // mapped from 'tipo'
      modelo: [''],
      numeroSerie: [''],
      estado: [''],
      ubicacion: [''],
      requiere_inspeccion: [false]
    });

    if (this.equipo) {
      this.form.patchValue({
        id: this.equipo.id,
        nombre: this.equipo.nombre,
        categoria: (this.equipo as any).categoria || (this.equipo as any).tipo || '',
        modelo: this.equipo.modelo,
                numeroSerie: this.equipo.numeroSerie || '',
        estado: this.equipo.estado,
        ubicacion: this.equipo.ubicacion,
        requiere_inspeccion: !!(this.equipo as any).requiere_inspeccion
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
  const value = this.form.value;
    // Map form fields to the backend/model shape expected by EquipoService
    const payload: any = {
      id: value.id,
      nombre: value.nombre,
      categoria: value.categoria,
      modelo: value.modelo,
      numeroSerie: value.numeroSerie,
      estado: value.estado,
      ubicacion: value.ubicacion,
      // keep custom field if backend expects it; API will ignore unknown fields if not used
      requiere_inspeccion: value.requiere_inspeccion
    };

    this.guardar.emit({ equipo: payload });
  }

    onCancelar() {
        this.cancelar.emit();
    }
}
