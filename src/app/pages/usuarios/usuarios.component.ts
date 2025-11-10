import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from './usuarios.service';
import { Usuario } from 'src/app/core/models/usuario.model';
import { RolService } from '@/core/services/rol.service';
import { Rol } from '@/core/models/inventario.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  rolesMap: Record<string, string> = {};
  usuarioSeleccionado: Usuario | null = null;
  mostrarFormulario = false;
  esEdicion = false;

  constructor(private readonly usuariosService: UsuariosService, private readonly rolService: RolService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    // Cargar usuarios y roles en paralelo para poder mostrar el nombre del rol
    forkJoin({
      usuarios: this.usuariosService.getUsuarios(),
      roles: this.rolService.listarRoles()
    }).subscribe(({ usuarios, roles }) => {
      this.usuarios = usuarios || [];
      this.roles = roles || [];
      // construir mapa id->nombre (soporta varias formas que puede devolver el backend)
      this.rolesMap = {};
      for (const r of this.roles) {
        if (r?.id != null) {
          const display = (r as any).nombreRol ?? (r as any).nombre ?? (r as any).name ?? String(r.id);
          this.rolesMap[String(r.id)] = display;
          // also index by alternative id fields if present
          if ((r as any).idRol != null) this.rolesMap[String((r as any).idRol)] = display;
          if ((r as any).code != null) this.rolesMap[String((r as any).code)] = display;
        }
      }

      // helper to find role name by id or by searching roles array
      const findRoleNameById = (id: any): string | undefined => {
        if (id == null) return undefined;
        const key = String(id);
        if (this.rolesMap[key]) return this.rolesMap[key];
        // try numeric
        if (/^\d+$/.test(key) && this.rolesMap[String(Number(key))]) return this.rolesMap[String(Number(key))];
        // fallback: search roles array for matching id-like fields
        for (const rr of this.roles) {
          const rrAny = rr as any;
          if (rrAny.id == id || String(rrAny.id) === key || rrAny.idRol == id || String(rrAny.idRol) === key || rrAny.code == id || String(rrAny.code) === key) {
            return rrAny.nombreRol ?? rrAny.nombre ?? rrAny.name ?? String(rrAny.id);
          }
        }
        return undefined;
      };

      // Derivar y adjuntar un campo rolNombre en cada usuario para usar en la plantilla
      for (const u of this.usuarios) {
        // si el usuario ya trae un objeto rol con nombre, usarlo
        const nestedName = (u as any).rol?.nombreRol ?? (u as any).rol?.nombre ?? (u as any).rol?.name;
        if (nestedName) {
          (u as any).rolNombre = nestedName;
          continue;
        }

        // intentar obtener id desde varias propiedades
        const id = (u as any).rolId ?? (u as any).roleId ?? (u as any).rol?.id ?? (u as any).role?.id ?? (u as any).role;
        const resolved = findRoleNameById(id);
        if (resolved) {
          (u as any).rolNombre = resolved;
          continue;
        }

        // fallback
        (u as any).rolNombre = '-';
      }

      // Debug: print roles and derived mapping to console to help diagnose runtime mismatch
      // eslint-disable-next-line no-console
      console.info('UsuariosComponent debug: roles=', this.roles, 'rolesMap=', this.rolesMap, 'usuarios sample=', this.usuarios?.[0]);
    });
  }

  getRolName(usuario: Usuario): string {
    if (!usuario) return '-';

    // Try common locations for a role id / object
    const possibleRid = (usuario as any).rolId ?? (usuario as any).roleId ?? (usuario as any).rol ?? (usuario as any).role;

    // If rol is an object, try to read its id or name directly
    if (possibleRid && typeof possibleRid === 'object') {
      const rObj: any = possibleRid;
      const ridFromObj = rObj.id ?? rObj.idRol ?? rObj.roleId;
      const nameFromObj = rObj.nombreRol ?? rObj.nombre ?? rObj.name;
      if (nameFromObj) return nameFromObj;
      if (ridFromObj != null) return this.rolesMap[ridFromObj] ?? String(ridFromObj);
    }

    // If rol is a primitive id
    if (typeof possibleRid === 'number' || (typeof possibleRid === 'string' && /^\d+$/.test(possibleRid))) {
      const ridNum = Number(possibleRid);
      return this.rolesMap[ridNum] ?? String(ridNum);
    }

    // final fallback: if usuario has a nested 'rol' name field
    const nestedName = (usuario as any).rol?.nombreRol ?? (usuario as any).rol?.nombre ?? (usuario as any).rol?.name;
    if (nestedName) return nestedName;

    return '-';
  }

  // Helper to compute the display label for a Rol object.
  // We cast to `any` inside to avoid template type-checking issues for alternate fields.
  getRoleLabel(r: Rol): string {
    return r.nombreRol ?? (r as any).nombre ?? (r as any).name ?? String(r.id ?? '');
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
