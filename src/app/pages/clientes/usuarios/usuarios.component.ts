import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Usuario } from '@/core/models/usuario.model';
import { UsuarioService } from '@/core/services/usuario.service';
import { ApiError } from '@/core/models/api.model';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule],
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
    usuarios: Usuario[] = [];
    isLoading = false;
    error: string | null = null;
    showForm = false;
    editing: Usuario | null = null;

    // simple pagination
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;

    formModel: Partial<Usuario> = {
        nombre: '',
        apellido: '',
        correo_electronico: '',
        telefono: '',
        dui: '',
        username: '',
        password: '',
        rol_id: 3,
        activo: true
    };

    @ViewChild('formContainer') formContainer!: ElementRef;
    @ViewChild('firstInput') firstInput!: ElementRef;

    constructor(private readonly usuarioService: UsuarioService) {}

    // mensajes dentro del diálogo
    dialogMessageSuccess: string | null = null;
    dialogMessageError: string | null = null;

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    cargarUsuarios(): void {
        this.isLoading = true;
        this.error = null;

        this.usuarioService.getUsuarios(this.currentPage, this.pageSize).subscribe({
            next: (response) => {
                if (response.success) {
                    this.usuarios = response.data;
                    this.totalPages = response.pagination?.totalPages ?? 1;
                }
            },
            error: (err: ApiError) => {
                this.error = err.message;
                this.isLoading = false;
            },
            complete: () => (this.isLoading = false)
        });
    }

    nuevo(): void {
        this.editing = null;
        this.formModel = {
            nombre: '',
            apellido: '',
            correo_electronico: '',
            telefono: '',
            dui: '',
            username: '',
            password: '',
            rol_id: 3,
            activo: true
        };
        this.dialogMessageSuccess = null;
        this.dialogMessageError = null;
        this.showForm = true;
    }

    onDialogShow(): void {
        // set focus to first input inside dialog
        setTimeout(() => {
            try {
                const el: HTMLElement | null = this.firstInput?.nativeElement as HTMLElement;
                el?.focus();
            } catch (e) {
                // ignore
            }
        }, 50);
    }

    editar(usuario: Usuario): void {
        this.editing = usuario;
        this.formModel = { ...usuario };
        // no mostrar password
        delete this.formModel.password;
        this.showForm = true;
    }

    cancelar(): void {
        this.showForm = false;
        this.editing = null;
        this.dialogMessageSuccess = null;
        this.dialogMessageError = null;
    }

    guardar(): void {
        this.error = null;
        this.dialogMessageSuccess = null;
        this.dialogMessageError = null;
        if (this.editing && this.editing.id_usuario) {
            // actualizar
            this.usuarioService.actualizarParcialUsuario(this.editing.id_usuario, this.formModel).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.cargarUsuarios();
                        // mostrar mensaje de éxito y cerrar
                        this.dialogMessageSuccess = 'Usuario actualizado correctamente.';
                        setTimeout(() => {
                            this.showForm = false;
                            this.dialogMessageSuccess = null;
                        }, 1000);
                    }
                },
                error: (err: ApiError) => {
                    this.dialogMessageError = err.message;
                    this.error = err.message;
                }
            });
        } else {
            // crear (rol_id por defecto 3 si no se especifica)
            const payload: Usuario = {
                nombre: this.formModel.nombre || '',
                apellido: this.formModel.apellido || '',
                correo_electronico: this.formModel.correo_electronico || '',
                telefono: this.formModel.telefono,
                dui: this.formModel.dui,
                username: this.formModel.username || '',
                password: this.formModel.password || '',
                rol_id: this.formModel.rol_id ?? 3,
                activo: this.formModel.activo ?? true
            };

            this.usuarioService.crearUsuario(payload).subscribe({
                next: (res) => {
                    if (res.success) {
                        // mostrar mensaje de éxito en el diálogo y cerrar tras un breve intervalo
                        this.dialogMessageSuccess = 'Usuario creado correctamente.';
                        this.cargarUsuarios();
                        setTimeout(() => {
                            this.showForm = false;
                            this.dialogMessageSuccess = null;
                        }, 1200);
                    }
                },
                error: (err: ApiError) => {
                    // mostrar mensaje de error dentro del diálogo
                    this.dialogMessageError = err.message;
                    this.error = err.message;
                }
            });
        }
    }

    eliminar(id?: number): void {
        if (!id) return;
        if (!confirm('¿Eliminar usuario?')) return;
        this.usuarioService.eliminarUsuario(id).subscribe({
            next: (res) => {
                if (res.success) this.cargarUsuarios();
            },
            error: (err: ApiError) => (this.error = err.message)
        });
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.cargarUsuarios();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.cargarUsuarios();
        }
    }
}
