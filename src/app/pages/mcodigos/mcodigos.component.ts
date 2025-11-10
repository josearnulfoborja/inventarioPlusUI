import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { McodigosService } from '@/core/services/mcodigos.service';
import { Mcodigo } from '@/core/models/inventario.model';

@Component({
  standalone: true,
  selector: 'app-mcodigos',
  templateUrl: './mcodigos.component.html',
  styleUrls: ['./mcodigos.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class McodigosComponent implements OnInit {
  mcodigos: Mcodigo[] = [];
  grupos: string[] = ['EQUIPO', 'PRESTAMO', 'MARCA', 'TIPO_EQUIPO'];
  filtroGrupo: string = 'EQUIPO';

  // form model
  mostrarFormulario = false;
  esEdicion = false;
  elemento: Mcodigo = { grupo: 'EQUIPO', codigo: '', nombre: '', descripcion: '', orden: 0, activo: true };

  constructor(private readonly mcodigosService: McodigosService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.mcodigosService.listar(this.filtroGrupo).subscribe(list => {
      this.mcodigos = list || [];
    });
  }

  nuevo(): void {
    this.esEdicion = false;
    this.elemento = { grupo: this.filtroGrupo, codigo: '', nombre: '', descripcion: '', orden: 0, activo: true };
    this.mostrarFormulario = true;
  }

  editar(e: Mcodigo): void {
    this.esEdicion = true;
    this.elemento = { ...e };
    this.mostrarFormulario = true;
  }

  guardar(): void {
    if (!this.elemento.codigo || !this.elemento.nombre) return;
    if (this.esEdicion && this.elemento.id) {
      this.mcodigosService.actualizar(this.elemento.id, this.elemento).subscribe(() => {
        this.cargar();
        this.mostrarFormulario = false;
      });
    } else {
      this.mcodigosService.crear(this.elemento).subscribe(() => {
        this.cargar();
        this.mostrarFormulario = false;
      });
    }
  }

  eliminar(id?: number): void {
    if (!id) return;
    if (confirm('¿Eliminar este registro?')) {
      this.mcodigosService.eliminar(id).subscribe(() => this.cargar());
    }
  }

  cambiarGrupo(): void {
    this.cargar();
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.elemento = { grupo: this.filtroGrupo, codigo: '', nombre: '', descripcion: '', orden: 0, activo: true };
    this.esEdicion = false;
  }
}
