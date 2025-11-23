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
  mcodigosOriginal: Mcodigo[] = [];
  grupos: string[] = ['EQUIPO', 'PRESTAMO', 'MARCA', 'TIPO_EQUIPO'];
  filtroGrupo: string = 'EQUIPO';
  cargando = false;
  guardando = false;
  errorMsg = '';
  successMsg = '';
  eliminandoId: number | null = null;

  // form model
  mostrarFormulario = false;
  esEdicion = false;
  elemento: Mcodigo = { grupo: 'EQUIPO', codigo: '', nombre: '', descripcion: '', orden: 0, activo: true };

  constructor(private readonly mcodigosService: McodigosService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.mcodigos = [];
    // eslint-disable-next-line no-console
    console.debug('[mcodigos] solicitando grupo:', this.filtroGrupo);
    this.mcodigosService.listar(this.filtroGrupo).subscribe({
      next: list => {
        // eslint-disable-next-line no-console
        console.debug('[mcodigos] respuesta grupo', this.filtroGrupo, 'conteo:', (list || []).length);
        this.mcodigosOriginal = list || [];
        this.filtrarLocal();
        this.cargando = false;
      },
      error: err => {
        // eslint-disable-next-line no-console
        console.error('[mcodigos] error cargando grupo', this.filtroGrupo, err);
        this.cargando = false;
      }
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
    this.errorMsg = '';
    this.successMsg = '';
    if (!this.elemento.codigo || !this.elemento.nombre) return;

    // Preparar payload normalizado (algunos backends esperan números)
    const payload: any = {
      grupo: (this.elemento.grupo || this.filtroGrupo || '').toUpperCase().trim(),
      codigo: String(this.elemento.codigo).trim(),
      nombre: String(this.elemento.nombre).trim(),
      descripcion: this.elemento.descripcion?.trim() || undefined,
      orden: this.elemento.orden != null ? Number(this.elemento.orden) : 0,
      activo: !!this.elemento.activo
    };
    if (/^\d+$/.test(payload.codigo)) payload.codigo = Number(payload.codigo);

    // Fallback para backends que requieren campos de auditoría not-null
    const nowIso = new Date().toISOString();
    if (!this.esEdicion) payload.createdAt = nowIso;
    payload.updatedAt = nowIso;

    this.guardando = true;
    const obs = this.esEdicion && this.elemento.id
      ? this.mcodigosService.actualizar(this.elemento.id!, payload)
      : this.mcodigosService.crear(payload);

    obs.subscribe({
      next: () => {
        this.successMsg = this.esEdicion ? 'Registro actualizado' : 'Registro creado';
        this.cargar();
        this.mostrarFormulario = false;
        this.guardando = false;
      },
      error: (e: any) => {
        // Mostrar mensaje claro y no fallar silenciosamente
        this.errorMsg = e?.message || 'No se pudo guardar. Revisa el servidor.';
        // eslint-disable-next-line no-console
        console.error('[mcodigos] error al guardar', e);
        this.guardando = false;
      }
    });
  }

  eliminar(id?: number): void {
    if (!id) return;
    if (!confirm('¿Eliminar este registro?')) return;
    this.errorMsg = '';
    this.successMsg = '';
    this.eliminandoId = id;

    const onOk = () => {
      this.successMsg = 'Registro eliminado';
      this.cargar();
      this.eliminandoId = null;
    };
    const onErr = (e: any) => {
      this.errorMsg = e?.message || 'No se pudo eliminar.';
      // eslint-disable-next-line no-console
      console.error('[mcodigos] error al eliminar', e);
      this.eliminandoId = null;
    };

    // Intentos secuenciales con distintos patrones de backend
    // eslint-disable-next-line no-console
    console.debug('[mcodigos] intentando eliminar /mcodigos/', id);
    this.mcodigosService.eliminar(id).subscribe({
      next: onOk,
      error: (e1) => {
        // eslint-disable-next-line no-console
        console.debug('[mcodigos] fallback query ?id=', id, 'error base:', e1?.statusCode);
        this.mcodigosService.eliminarPorQuery(id).subscribe({
          next: onOk,
          error: (e2) => {
            // eslint-disable-next-line no-console
            console.debug('[mcodigos] fallback /delete/', id, 'error query:', e2?.statusCode);
            this.mcodigosService.eliminarRutaDelete(id).subscribe({
              next: onOk,
              error: (e3) => {
                // eslint-disable-next-line no-console
                console.debug('[mcodigos] fallback POST /eliminar body {id}', id, 'error delete-route:', e3?.statusCode);
                this.mcodigosService.eliminarPorPost(id).subscribe({
                  next: onOk,
                  error: (eFinal) => {
                    // Si falla todo, reportar el primer error significativo
                    onErr(eFinal || e3 || e2 || e1);
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  cambiarGrupo(): void {
    // normalizar a mayúsculas si el backend es case-sensitive
    this.filtroGrupo = (this.filtroGrupo || '').toUpperCase();
    this.mostrarFormulario = false; // cerrar formulario al cambiar grupo
    this.elemento = { grupo: this.filtroGrupo, codigo: '', nombre: '', descripcion: '', orden: 0, activo: true };
    this.cargar();
  }

  private filtrarLocal(): void {
    const g = (this.filtroGrupo || '').toUpperCase();
    // Si el backend devolvió mezclado, filtramos por grupo exacto
    this.mcodigos = (this.mcodigosOriginal || []).filter(m => (m.grupo || '').toUpperCase() === g);
    // eslint-disable-next-line no-console
    console.debug('[mcodigos] filtrado local por', g, 'resultado:', this.mcodigos.length);
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.elemento = { grupo: this.filtroGrupo, codigo: '', nombre: '', descripcion: '', orden: 0, activo: true };
    this.esEdicion = false;
  }
}
