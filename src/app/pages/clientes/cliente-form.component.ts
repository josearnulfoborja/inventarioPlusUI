import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Cliente } from '@/core/models/inventario.model';

@Component({
    selector: 'app-cliente-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="card">
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium">Nombre *</label>
              <input class="form-input mt-1 block w-full" formControlName="nombre" />
              <div *ngIf="form.controls['nombre'].touched && form.controls['nombre'].invalid" class="text-red-600 text-sm">El nombre es requerido.</div>
            </div>

            <div>
              <label class="block text-sm font-medium">Apellido</label>
              <input class="form-input mt-1 block w-full" formControlName="apellido" />
            </div>

            <div>
              <label class="block text-sm font-medium">Tipo Documento</label>
              <select class="form-select mt-1 block w-full" formControlName="tipoDocumento">
                <option value="DUI">DUI</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">PASAPORTE</option>
                <option value="OTRO">OTRO</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium">Número Documento</label>
              <input class="form-input mt-1 block w-full" formControlName="numeroDocumento" />
            </div>

            <div>
              <label class="block text-sm font-medium">Teléfono</label>
              <input class="form-input mt-1 block w-full" formControlName="telefono" />
            </div>

            <div>
              <label class="block text-sm font-medium">Correo</label>
              <input class="form-input mt-1 block w-full" formControlName="email" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium">Dirección</label>
              <input class="form-input mt-1 block w-full" formControlName="direccion" />
            </div>

            <div class="md:col-span-2 flex items-center gap-4 mt-2">
              <label class="inline-flex items-center">
                <input type="checkbox" class="form-checkbox" formControlName="activo" />
                <span class="ml-2">Activo</span>
              </label>
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="btn btn-secondary" (click)="onCancelar()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
    `
})
export class ClienteFormComponent implements OnInit {
    @Input() cliente?: Cliente;
    @Output() guardar = new EventEmitter<{ cliente: Cliente }>();
    @Output() cancelar = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      apellido: [''],
      tipoDocumento: ['DUI'],
      numeroDocumento: [''],
      telefono: [''],
      email: ['', Validators.email],
      direccion: [''],
      activo: [true]
    });

    if (this.cliente) {
      this.form.patchValue(this.cliente as any);
    }
  }

    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const value = this.form.value as Cliente;
        this.guardar.emit({ cliente: value });
    }

    onCancelar() {
        this.cancelar.emit();
    }
}
