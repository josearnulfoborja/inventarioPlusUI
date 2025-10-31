import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from './usuarios.service';
import { Usuario } from 'src/app/core/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario | null = null;
  mostrarFormulario = false;
  esEdicion = false;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe((data: Usuario[]) => {
      this.usuarios = data;
    });
  }

  nuevoUsuario() {
    this.usuarioSeleccionado = {
      nombre: '', apellido: '', correoElectronico: '', telefono: '',
      username: '', password: '', rolId: 1, activo: true, dui: ''
    };
    this.mostrarFormulario = true;
    this.esEdicion = false;
  }

  editarUsuario(usuario: Usuario) {
    this.usuarioSeleccionado = { ...usuario };
    this.mostrarFormulario = true;
    this.esEdicion = true;
  }

  guardarUsuario() {
    if (this.esEdicion && this.usuarioSeleccionado?.idUsuario) {
      this.usuariosService.actualizarUsuario(this.usuarioSeleccionado.idUsuario, this.usuarioSeleccionado)
        .subscribe(() => {
          this.cargarUsuarios();
          this.mostrarFormulario = false;
        });
    } else {
      this.usuariosService.crearUsuario(this.usuarioSeleccionado!)
        .subscribe(() => {
          this.cargarUsuarios();
          this.mostrarFormulario = false;
        });
    }
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(id).subscribe(() => {
        this.cargarUsuarios();
      });
    }
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.usuarioSeleccionado = null;
  }
}
