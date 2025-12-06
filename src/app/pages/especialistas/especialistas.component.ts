import { Component, OnInit } from '@angular/core';
import { EspecialistasService, Especialista } from './especialistas.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-especialistas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './especialistas.component.html',
  styleUrls: ['./especialistas.component.scss']
})
export class EspecialistasComponent implements OnInit {
  especialistas: Especialista[] = [];
  especialistaForm: FormGroup;
  editMode = false;
  selectedEspecialista: Especialista | null = null;
  loading = false;
  mostrarFormulario = false;

  constructor(
    private especialistasService: EspecialistasService,
    private fb: FormBuilder
  ) {
    this.especialistaForm = this.fb.group({
      nombre: ['', Validators.required],
      disponibilidad: [true]
    });
  }  ngOnInit() {
    this.cargarEspecialistas();
  }

  cargarEspecialistas() {
    this.loading = true;
    this.especialistasService.getEspecialistas().subscribe(data => {
      this.especialistas = data;
      this.loading = false;
    });
  }

  guardarEspecialista() {
    if (this.especialistaForm.invalid) return;
    
    const formValue = this.especialistaForm.value;
    const now = new Date().toISOString();
    
    const payload = {
      nombre: formValue.nombre || '',
      documento: '',
      telefono: '',
      direccion: '',
      correo: '',
      disponibilidad: formValue.disponibilidad ? 'Disponible' : 'No disponible',
      usuarioId: 1,
      activo: true,
      fechaCreacion: now,
      fechaActualizacion: now
    };
    
    console.log('Payload enviado:', payload);
    
    if (this.editMode && this.selectedEspecialista && this.selectedEspecialista.idEspecialista) {
      this.especialistasService.updateEspecialista(this.selectedEspecialista.idEspecialista, payload as any)
        .subscribe({
          next: () => {
            this.cargarEspecialistas();
            this.cancelarEdicion();
            this.mostrarFormulario = false;
          },
          error: (err) => {
            console.error('Error al actualizar:', err);
            alert('Error al actualizar. Revisa consola y Network.');
          }
        });
    } else {
      this.especialistasService.addEspecialista(payload as any)
        .subscribe({
          next: () => {
            console.log('Especialista agregado exitosamente');
            this.cargarEspecialistas();
            this.especialistaForm.reset({ disponibilidad: true });
            this.mostrarFormulario = false;
          },
          error: (err) => {
            console.error('Error al agregar:', err);
            alert('Error al agregar. Revisa consola y Network.');
          }
        });
    }
  }

  editarEspecialista(especialista: Especialista) {
    this.editMode = true;
    this.selectedEspecialista = especialista;
    this.especialistaForm.patchValue(especialista);
  }

  eliminarEspecialista(id: number) {
    if (confirm('¿Seguro que deseas eliminar este especialista?')) {
      this.especialistasService.deleteEspecialista(id).subscribe(() => {
        this.cargarEspecialistas();
      });
    }
  }

  cancelarEdicion() {
    this.editMode = false;
    this.selectedEspecialista = null;
    this.especialistaForm.reset({ disponibilidad: true });
    this.mostrarFormulario = false;
  }
}
