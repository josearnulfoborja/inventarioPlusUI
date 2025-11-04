
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluacionTecnicaService } from 'src/app/core/services/evaluacion-tecnica.service';
import { EvaluacionTecnica } from 'src/app/core/models/evaluacion-tecnica.model';
import { EvaluacionFormComponent } from './evaluacion-form/evaluacion-form.component';

@Component({
    selector: 'app-evaluaciones',
    standalone: true,
    imports: [CommonModule, EvaluacionFormComponent],
    templateUrl: './evaluaciones.component.html',
    styleUrls: ['./evaluaciones.component.scss']
})
export class EvaluacionesComponent implements OnInit {
    evaluaciones: EvaluacionTecnica[] = [];
    seleccionada?: EvaluacionTecnica;
    mostrarFormulario = false;
    esEdicion = false;

    constructor(private readonly evaluacionService: EvaluacionTecnicaService) {}

    ngOnInit(): void {
        this.cargarEvaluaciones();
    }

    cargarEvaluaciones() {
        this.evaluacionService.getEvaluaciones().subscribe(data => {
            this.evaluaciones = data;
        });
    }

    nuevaEvaluacion() {
        this.seleccionada = undefined;
        this.mostrarFormulario = true;
        this.esEdicion = false;
    }

    editarEvaluacion(evaluacion: EvaluacionTecnica) {
        this.seleccionada = { ...evaluacion };
        this.mostrarFormulario = true;
        this.esEdicion = true;
    }

    eliminarEvaluacion(id: number) {
        if (confirm('¿Seguro que deseas eliminar esta evaluación?')) {
            this.evaluacionService.eliminarEvaluacion(id).subscribe(() => {
                this.cargarEvaluaciones();
            });
        }
    }

    guardarEvaluacion(evaluacion: EvaluacionTecnica) {
        if (this.esEdicion && evaluacion.idEvaluacion) {
            this.evaluacionService.actualizarEvaluacion(evaluacion.idEvaluacion, evaluacion).subscribe(() => {
                this.cargarEvaluaciones();
                this.mostrarFormulario = false;
            });
        } else {
            this.evaluacionService.crearEvaluacion(evaluacion).subscribe(() => {
                this.cargarEvaluaciones();
                this.mostrarFormulario = false;
            });
        }
    }
}
