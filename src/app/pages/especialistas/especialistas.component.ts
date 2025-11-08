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
      disponibilidad: [true, Validators.required]
    });
  }

  ngOnInit() {
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
    const especialista: Especialista = this.especialistaForm.value;
    if (this.editMode && this.selectedEspecialista) {
      this.especialistasService.updateEspecialista(this.selectedEspecialista.idEspecialista!, especialista)
        .subscribe(() => {
          this.cargarEspecialistas();
          this.cancelarEdicion();
          this.mostrarFormulario = false;
        });
    } else {
      this.especialistasService.addEspecialista(especialista)
        .subscribe(() => {
          this.cargarEspecialistas();
          this.especialistaForm.reset({ disponibilidad: true });
          this.mostrarFormulario = false;
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
