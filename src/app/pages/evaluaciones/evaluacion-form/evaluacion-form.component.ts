import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionTecnica } from 'src/app/core/models/evaluacion-tecnica.model';

@Component({
  selector: 'app-evaluacion-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluacion-form.component.html',
  styleUrls: ['./evaluacion-form.component.scss']
})
export class EvaluacionFormComponent implements OnInit {
  @Input() evaluacion?: EvaluacionTecnica;
  @Input() esEdicion = false;
  @Output() guardar = new EventEmitter<EvaluacionTecnica>();
  @Output() cancelar = new EventEmitter<void>();

  modelo: EvaluacionTecnica = {
    observaciones: '',
    aprobado: false,
    equipo: { idEquipo: 0 },
    usuario: { idUsuario: 0 }
  };

  ngOnInit() {
    if (this.evaluacion) {
      this.modelo = { ...this.evaluacion };
    }
  }

  onSubmit() {
    this.guardar.emit(this.modelo);
  }
}
