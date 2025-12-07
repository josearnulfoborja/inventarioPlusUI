import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from 'src/app/pages/usuarios/usuarios.service';
import { AuthService } from '@/core/services/auth.service';
import { Usuario } from '@/core/models/usuario.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="w-full min-h-screen bg-gray-100 py-8">
    <div class="max-w-screen-2xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Left card: avatar -->
        <div class="bg-white rounded shadow p-6 flex flex-col items-center">
          <h3 class="mb-4 font-semibold text-lg">{{ displayRole || 'Sin rol asignado' }}</h3>
          <div class="w-64 h-80 overflow-hidden rounded-full relative" style="border-radius: 50%/60%;">
            <ng-container *ngIf="imagePreview || imageUrl; else placeholder">
              <img [src]="imagePreview || imageUrl" alt="avatar" class="w-full h-full object-cover block" />
            </ng-container>
            <ng-template #placeholder>
              <div class="w-full h-full flex items-center justify-center bg-gray-200">
                <!-- Plain neutral background with centered SVG icon -->
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="text-gray-400">
                  <g fill="currentColor">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                  </g>
                </svg>
              </div>
            </ng-template>
          </div>
          <div class="mt-4 text-center font-medium">{{ perfil?.username || displayName }}</div>
          <div class="mt-6 w-full">
            <input type="file" (change)="onFileSelected($event)" accept="image/*" class="block w-full" />
            <div class="mt-3 flex gap-2">
              <button type="button" class="btn btn-primary" (click)="uploadAvatar()" [disabled]="!selectedFile">Subir imagen</button>
              <button type="button" class="btn" (click)="cancel()">Cancelar</button>
            </div>
          </div>
        </div>

        <!-- Right card: form spans two columns on desktop -->
        <div class="md:col-span-2 bg-white rounded shadow p-6">
          <h3 class="text-xl font-semibold mb-4">Editar Perfil</h3>
          <div *ngIf="error" class="mb-3 text-sm text-yellow-700 bg-yellow-100 p-2 rounded">{{ error }}</div>
          <div *ngIf="successMessage" class="mb-3 text-sm text-green-700 bg-green-100 p-2 rounded">{{ successMessage }}</div>

          <form *ngIf="perfil" class="space-y-4" (ngSubmit)="save()">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Correo electrónico</label>
              <input [(ngModel)]="formModel.correoElectronico" name="correoElectronico" class="input w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label class="block text-sm text-gray-700 mb-1">Fecha de nacimiento</label>
              <input type="date" [(ngModel)]="formModel.fechaNacimiento" name="fechaNacimiento" class="input w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label class="block text-sm text-gray-700 mb-1">Nueva contraseña (opcional)</label>
              <input type="password" placeholder="Dejar en blanco si no deseas cambiarla" [(ngModel)]="formModel.newPassword" name="newPassword" class="input w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label class="block text-sm text-gray-700 mb-1">Avatar (imagen)</label>
              <div class="flex items-center gap-3">
                <input type="file" (change)="onFileSelected($event)" accept="image/*" class="block" />
                <button type="button" class="btn btn-sm btn-secondary" (click)="uploadAvatar()" [disabled]="!selectedFile">Seleccionar y subir</button>
              </div>
            </div>

            <div>
              <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            </div>
          </form>

          <div *ngIf="!perfil && !error" class="p-4 text-sm text-gray-600">Cargando perfil...</div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ProfileComponent implements OnInit {
  perfil: Partial<Usuario> | null = null;
  formModel: any = {};
  error: string | null = null;
  successMessage: string | null = null;
  // image handling
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  imageUrl: string | null = null; // current URL coming from perfil

  constructor(private usuariosService: UsuariosService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadPerfil();
  }

  get displayRole(): string {
    if (!this.perfil) return '';
    const r = (this.perfil as any)['rolNombre'] ?? (this.perfil as any)['rol']?.nombre ?? (this.perfil as any)['role'] ?? '';
    return r || '';
  }

  get displayName(): string {
    if (this.perfil) {
      const n = (this.perfil as any)['nombre'] ?? (this.perfil as any)['name'] ?? '';
      const a = (this.perfil as any)['apellido'] ?? (this.perfil as any)['lastName'] ?? '';
      const uname = (this.perfil as any)['username'] ?? '';
      const fullname = (n || '') + (a ? ' ' + a : '');
      return (fullname.trim() || uname) || 'Usuario';
    }
    const u = this.auth.getUser();
    if (!u) return 'Usuario';
    return (u['nombre'] ?? u['name'] ?? u['username'] ?? 'Usuario');
  }

  private loadPerfil() {
    this.error = null;

    const stored = this.auth.getUser();
    // Try backend /usuarios/me first
    this.usuariosService.miPerfil().subscribe({
      next: (u) => {
        this.perfil = u;
        this.imageUrl = (u as any)['avatar'] ?? (u as any)['avatarUrl'] ?? (u as any)['foto'] ?? (u as any)['photoUrl'] ?? null;
        // populate formModel with fields that may not exist on Usuario interface
        this.formModel = {
          nombre: (u as any)['nombre'] ?? (u as any)['name'] ?? '',
          apellido: (u as any)['apellido'] ?? (u as any)['lastName'] ?? '',
          correoElectronico: (u as any)['correoElectronico'] ?? (u as any)['email'] ?? (u as any)['correo'] ?? '',
          telefono: (u as any)['telefono'] ?? (u as any)['phone'] ?? '',
          dui: (u as any)['dui'] ?? '',
          username: (u as any)['username'] ?? '',
          fechaNacimiento: (u as any)['fechaNacimiento'] ?? '',
          newPassword: ''
        };
      },
      error: (e) => {
        // If server call fails (e.g., 403) try to use locally stored user info so the form shows.
        if (stored) {
          // use fields available in stored object to prefill form (best-effort)
          this.perfil = {
            nombre: stored['nombre'] ?? stored['name'] ?? '',
            apellido: stored['apellido'] ?? stored['lastName'] ?? '',
            correoElectronico: stored['correoElectronico'] ?? stored['email'] ?? stored['correo'] ?? '',
            telefono: stored['telefono'] ?? stored['phone'] ?? '',
            dui: stored['dui'] ?? '',
            username: stored['username'] ?? stored['user'] ?? ''
          } as Partial<Usuario>;
          this.imageUrl = stored['avatar'] ?? stored['avatarUrl'] ?? stored['photoUrl'] ?? null;
          this.formModel = {
            nombre: this.perfil.nombre ?? '',
            apellido: this.perfil.apellido ?? '',
            correoElectronico: this.perfil.correoElectronico ?? '',
            telefono: this.perfil.telefono ?? '',
            dui: this.perfil.dui ?? '',
            username: this.perfil.username ?? '',
            fechaNacimiento: stored['fechaNacimiento'] ?? '',
            newPassword: ''
          };
          // show a non-blocking warning
          this.error = 'No se pudo cargar datos desde el servidor; mostrando datos locales (si hay).';
        } else {
          // No stored user: show empty form so user can type their data
          this.perfil = {} as Partial<Usuario>;
          this.formModel = { nombre: '', apellido: '', correoElectronico: '', telefono: '', dui: '', username: '', fechaNacimiento: '', newPassword: '' };
          this.error = 'No se pudo cargar perfil desde el servidor. Complete los campos y presione Guardar.';
        }
      }
    });
  }

  save() {
    if (!this.perfil) return;
    const id = (this.perfil as any)['idUsuario'] ?? (this.perfil as any)['id'];
    if (!id) { this.error = 'ID de usuario no disponible'; return; }

    // Prepare payload: prefer values from formModel (contains extra fields not present on Usuario)
    const payload: any = {
      // include idUsuario to satisfy backends that expect the id in the body for /perfil
      idUsuario: id,
      nombre: this.formModel.nombre ?? this.perfil.nombre,
      apellido: this.formModel.apellido ?? this.perfil.apellido,
      correoElectronico: this.formModel.correoElectronico ?? this.perfil.correoElectronico,
      telefono: this.formModel.telefono ?? this.perfil.telefono,
      dui: this.formModel.dui ?? this.perfil.dui,
      username: this.formModel.username ?? this.perfil.username,
      activo: (this.perfil as any).activo,
      // include avatar filename or url if available
      avatar: this.formModel.avatar ?? (this.perfil as any).avatar ?? undefined
    };

    // If user provided a new password in the form, include it
    if (this.formModel.newPassword && String(this.formModel.newPassword).trim() !== '') {
      payload.password = String(this.formModel.newPassword).trim();
    }

    this.usuariosService.guardarPerfil(payload).subscribe({
      next: (res) => {
        // update local stored user if present
        const stored = this.auth.getUser();
        if (stored) {
          const merged = { ...stored, ...res };
          try { localStorage.setItem('inventarioplus_user', JSON.stringify(merged)); } catch {}
        }
        // also update local perfil and formModel with returned values
        this.perfil = { ...this.perfil, ...res } as Partial<Usuario>;
        this.formModel = { ...this.formModel, ...res, newPassword: '' };
        this.successMessage = 'Perfil actualizado correctamente.';
        this.error = null;
      },
      error: (err) => {
        this.error = 'Error guardando perfil: ' + (err?.message ?? JSON.stringify(err));
        this.successMessage = null;
      }
    });
  }

  cancel() {
    // reload original
    this.successMessage = null;
    this.error = null;
    this.loadPerfil();
  }

  onFileSelected(e: Event) {
    const inp = e.target as HTMLInputElement;
    if (!inp.files || inp.files.length === 0) { this.selectedFile = null; this.imagePreview = null; return; }
    this.selectedFile = inp.files[0];
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result as string; };
    reader.readAsDataURL(this.selectedFile);
  }

  uploadAvatar() {
    if (!this.perfil) { this.error = 'Perfil no cargado'; return; }
    const id = (this.perfil as any)['idUsuario'] ?? (this.perfil as any)['id'];
    if (!id) { this.error = 'ID de usuario no disponible'; return; }
    if (!this.selectedFile) { this.error = 'Selecciona un archivo primero'; return; }

    try { console.debug('[ProfileComponent] uploadAvatar - preparing to send', { id, fileName: this.selectedFile.name }); } catch (e) {}

    this.usuariosService.uploadAvatar(Number(id), this.selectedFile).subscribe({
      next: (res: any) => {
        // try to extract returned filename or URL if present
        const filename = res?.filename ?? res?.fileName ?? res?.data?.filename ?? res?.data?.fileName ?? null;
        const url = filename ?? res?.url ?? res?.data?.url ?? res?.avatarUrl ?? res?.avatar ?? null;
        if (url) {
          this.imageUrl = url;
          // update perfil field too (store filename or url as backend returns)
          (this.perfil as any)['avatar'] = filename ?? url;
          this.formModel.avatar = filename ?? url;
        }
        this.selectedFile = null;
        this.imagePreview = null;
        this.successMessage = 'Imagen subida con éxito.';
        this.error = null;
      },
      error: (err) => {
        this.error = 'Error subiendo imagen: ' + (err?.message ?? JSON.stringify(err));
        try { console.debug('[ProfileComponent] uploadAvatar error', err); } catch (e) {}
        this.successMessage = null;
      }
    });
  }
}
