import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevolucionesService } from './devoluciones.service';
import { AuthService } from '@/core/services/auth.service';
import { PrestamoService } from '@/core/services/prestamo.service';
import { UsuarioService } from '@/core/services/usuario.service';
import { EspecialistasService } from '@/pages/especialistas/especialistas.service';
import { of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-devoluciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-4">Devoluciones</h2>

    <div class="mb-6 bg-white p-4 rounded shadow">
      <h3 class="font-medium mb-2">Registrar devolución</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm">ID Usuario</label>
          <input [(ngModel)]="form.idUsuario" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm">ID Equipo</label>
          <input [(ngModel)]="form.idEquipo" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm">Fecha</label>
          <!-- Bind to fecha_devolucion_real: backend expects this field name in some endpoints -->
          <input type="date" [(ngModel)]="form.fecha_devolucion_real" class="input w-full" />
        </div>
      </div>
      <div class="mt-3">
        <label class="block text-sm">Condición</label>
        <!-- Use condicionAlDevolver (camelCase) or legacy keys will be normalized in create -->
        <input [(ngModel)]="form.condicionAlDevolver" class="input w-full" />
      </div>
      <div class="mt-3">
        <label class="block text-sm">Observaciones</label>
        <textarea [(ngModel)]="form.observaciones" class="input w-full" rows="3"></textarea>
      </div>
      <div class="mt-3">
        <button class="btn btn-primary" (click)="crear()">Registrar devolución</button>
        <span *ngIf="message" class="ml-3 text-sm text-green-700">{{message}}</span>
        <span *ngIf="error" class="ml-3 text-sm text-red-600">{{error}}</span>
      </div>
    </div>

    <div class="bg-white p-4 rounded shadow">
      <h3 class="font-medium mb-2">Historial de devoluciones</h3>
      <table class="w-full table-auto text-left">
        <thead>
          <tr class="border-b">
            <th class="py-2">ID</th>
            <th class="py-2">Cliente</th>
            <th class="py-2">Equipo</th>
            <th class="py-2">Fecha devolución</th>
            <th class="py-2">Condición</th>
            <th class="py-2">Inspección</th>
            <th class="py-2">Especialista</th>
            <th class="py-2">Observaciones</th>
            <th class="py-2">Creado por</th>
          </tr>
        </thead>
        <tbody>
            <tr *ngFor="let d of devoluciones" class="border-b align-top">
            <td class="py-2">{{d.id_devolucion ?? d.id ?? d.idDevolucion}}</td>
            <td class="py-2">{{d.clienteNombre || d.cliente?.nombre || d.usuarioNombre || d.usuario?.nombre || d.cliente || d.id_cliente || d.idUsuario || '-'}}</td>
            <td class="py-2">{{d.equipoNombre || d.equipo?.nombre || d.equipoNombre || d.equipo || d.id_equipo || (d.prestamo?.equipoNombre) || '-'}}</td>
            <td class="py-2">{{ (d.fecha_devolucion_real ?? d.fechaDevolucion ?? d.fecha_registro_devolucion ?? d.prestamo?.fechaDevolucion ?? d.prestamo?.fecha_devolucion) | date:'shortDate' }}</td>
            <td class="py-2">{{d.condicionAlDevolver ?? d.condicion_al_devolver ?? d.condicion ?? d.motivo ?? '-'}}</td>
            <td class="py-2">{{(d.solicitar_inspeccion || d.inspeccion_solicitada) ? 'Sí' : 'No'}}</td>
            <td class="py-2">{{d.especialista_asignado_nombre || d.especialista?.nombre || d.especialista_asignado_id || '-'}}</td>
            <td class="py-2 break-words">{{d.observaciones ?? '-'}}</td>
            <td class="py-2">{{d.creado_por_nombre || d.creado_por?.nombre || d.usuario?.nombre || d.creado_por || '-'}}</td>
          </tr>
          <tr *ngIf="devoluciones.length === 0">
            <td colspan="9" class="py-4 text-center text-sm text-gray-600">No hay devoluciones registradas.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `
})
export class DevolucionesComponent implements OnInit {
  devoluciones: any[] = [];
  form: any = {
    id_prestamo: '',
    fecha_devolucion_real: '',
    condicionAlDevolver: '',
    observaciones: '',
    solicitar_inspeccion: false,
    especialista_asignado_id: '',
    fecha_inspeccion_programada: '',
    inspeccion_realizada: '',
    estado_inspeccion: ''
  };
  message: string | null = null;
  error: string | null = null;

  constructor(
    private svc: DevolucionesService,
    private auth: AuthService,
    private prestamoService: PrestamoService,
    private usuarioService: UsuarioService,
    private especialistasService: EspecialistasService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    // Cargar devoluciones y prestamos activos para resolver cliente/equipo por prestamo
      // Primero cargar devoluciones. Luego intentar enriquecer con prestamos si están disponibles.
      this.svc.getDevoluciones().subscribe({
        next: (devoluciones) => {
          console.debug('[DEVOLUCIONES] api devoluciones result:', devoluciones);
          this.devoluciones = devoluciones || [];

          // Pre-fill prestamoById with any nested `prestamo` objects returned directly
          const prestamoById: Record<string, any> = {};
          (this.devoluciones || []).forEach((d: any) => {
            const pid = d.id_prestamo ?? d.prestamoId ?? d.idPrestamo ?? d.id ?? null;
            if (pid != null && d.prestamo) {
              prestamoById[String(pid)] = d.prestamo;
            }
          });

          // IDs to request are those without nested prestamo present
          const prestamoIds = Array.from(new Set((this.devoluciones || [])
            .map((d: any) => d.id_prestamo ?? d.prestamoId ?? d.idPrestamo ?? d.id)
            .filter((v: any) => v != null && !prestamoById[String(v)])
          ));

          const calls: Record<string, any> = {};
          prestamoIds.forEach((id: any) => {
            calls[String(id)] = this.prestamoService.getPrestamoById(Number(id)).pipe(
              catchError((err: any) => {
                console.warn('[DEVOLUCIONES] fallo al cargar prestamo id=' + id, err);
                return of({ data: null });
              })
            );
          });

          const finishWithPrestamoMap = (additional: Record<string, any>) => {
            // merge fetched prestamos into map
            Object.assign(prestamoById, additional || {});

            // Build sets of especialista ids and creador ids to fetch missing names
            const especialistaIds = new Set<number>();
            const creadorIds = new Set<number>();
            const prefilledEspecialistas: Record<string, string> = {};
            const prefilledCreadores: Record<string, string> = {};

            (this.devoluciones || []).forEach((d: any) => {
              const pid = d.id_prestamo ?? d.prestamoId ?? d.idPrestamo ?? d.id ?? null;
              const prestamo = pid != null ? prestamoById[String(pid)] : null;

              // If prestamo includes an especialista object, prefill its name
              const prestamoEspecialista = prestamo?.especialista ?? prestamo?.assignedEspecialista ?? null;
              if (prestamoEspecialista && (prestamoEspecialista.nombre || prestamoEspecialista.name)) {
                const peid = prestamoEspecialista.idEspecialista ?? prestamoEspecialista.id ?? null;
                if (peid != null) prefilledEspecialistas[String(peid)] = prestamoEspecialista.nombre ?? prestamoEspecialista.name;
              }

              // If prestamo includes a creador/usuario object, prefill its name
              const prestamoCreador = prestamo?.creadoPor ?? prestamo?.creador ?? prestamo?.usuarioRegistro ?? null;
              if (prestamoCreador && (prestamoCreador.nombre || prestamoCreador.name || prestamoCreador.email)) {
                const pcid = prestamoCreador.idUsuario ?? prestamoCreador.id ?? null;
                if (pcid != null) prefilledCreadores[String(pcid)] = prestamoCreador.nombre ?? prestamoCreador.name ?? prestamoCreador.email;
              }

              const eid = d.especialista_asignado_id ?? d.especialista_asignado ?? d.especialistaId ?? prestamo?.especialista?.idEspecialista ?? prestamo?.especialistaId ?? null;
              // Compute creator id (cid) defensively to avoid mixing && and ?? operators
              let cid: number | null = d.creado_por ?? d.creadoPor ?? d.creado_por_id ?? null;
              if ((cid === null || cid === undefined) && prestamo) {
                const created = prestamo.creadoPor ?? prestamo.creador ?? prestamo.usuarioRegistro ?? null;
                if (created != null) {
                  if (typeof created === 'number') {
                    cid = created as number;
                  } else {
                    cid = Number(created.idUsuario ?? created.id ?? created.usuarioId ?? null) || null;
                  }
                }
              }

              if (eid != null && !prefilledEspecialistas[String(eid)]) especialistaIds.add(Number(eid));
              if (cid != null && !prefilledCreadores[String(cid)]) creadorIds.add(Number(cid));
            });

            const especialistaCalls: Record<string, any> = {};
            Array.from(especialistaIds).forEach((id) => {
              especialistaCalls[String(id)] = this.especialistasService.getEspecialista(id).pipe(
                catchError(() => of(null))
              );
            });

            const creadorCalls: Record<string, any> = {};
            Array.from(creadorIds).forEach((id) => {
              creadorCalls[String(id)] = this.usuarioService.getUsuarioById(id).pipe(
                catchError(() => of(null))
              );
            });

            forkJoin({
              especialistas: (Object.keys(especialistaCalls).length ? forkJoin(especialistaCalls) : of({})),
              creadores: (Object.keys(creadorCalls).length ? forkJoin(creadorCalls) : of({}))
            }).subscribe((lookups: any) => {
              const especialistasById: Record<string, any> = {};
              const creadoresById: Record<string, any> = {};
              Object.entries(lookups.especialistas || {}).forEach(([k, v]: any) => {
                const payload = v && (v.data ?? v) || v;
                especialistasById[k] = payload?.nombre ?? payload?.name ?? null;
              });
              Object.entries(lookups.creadores || {}).forEach(([k, v]: any) => {
                const payload = v && (v.data ?? v) || v;
                creadoresById[k] = (payload?.nombre ?? payload?.name ?? payload?.username ?? payload?.email) ?? null;
              });

              // Merge prefills from prestamo objects (avoid extra requests)
              Object.assign(especialistasById, prefilledEspecialistas);
              Object.assign(creadoresById, prefilledCreadores);

              this.devoluciones = (this.devoluciones || []).map((d: any) => {
                const pid = d.id_prestamo ?? d.prestamoId ?? d.idPrestamo ?? d.id ?? null;
                const prestamo = pid != null ? prestamoById[String(pid)] : null;
                const eid = d.especialista_asignado_id ?? d.especialista_asignado ?? d.especialistaId ?? prestamo?.especialista?.idEspecialista ?? prestamo?.especialistaId ?? null;
                const cid = d.creado_por ?? d.creadoPor ?? d.creado_por_id ?? prestamo?.creadoPor ?? prestamo?.creado_por ?? null;
                const especialistaName = d.especialista_asignado_nombre || d.especialista?.nombre || (eid != null ? especialistasById[String(eid)] : null) || prestamo?.especialista?.nombre || null;
                const creadorName = d.creado_por_nombre || d.creado_por || (cid != null ? creadoresById[String(cid)] : null) || prestamo?.creadoPor || prestamo?.creado_por || null;

                const condNorm = d.condicionAlDevolver ?? d.condicion_al_devolver ?? d.condicion ?? d.motivo ?? prestamo?.condicionAlDevolver ?? null;
                return {
                  ...d,
                  clienteNombre: d.clienteNombre || d.cliente?.nombre || prestamo?.cliente?.nombre || prestamo?.clienteNombre || prestamo?.cliente?.nombreCompleto || null,
                  equipoNombre: d.equipoNombre || d.equipo?.nombre || prestamo?.equipo?.nombre || prestamo?.equipoNombre || null,
                  especialista_asignado_nombre: especialistaName ?? null,
                  creado_por_nombre: creadorName ?? null,
                  // normalize condition values into both camelCase and legacy keys for display and backend compatibility
                  condicionAlDevolver: condNorm,
                  condicion_al_devolver: condNorm,
                  condicion: condNorm,
                  motivo: condNorm
                };
              });
            });
          };

          if (Object.keys(calls).length === 0) {
            // No IDs to fetch, finish using prefilled prestamoById
            finishWithPrestamoMap({});
          } else {
            forkJoin(calls).subscribe((results: any) => {
              const fetched: Record<string, any> = {};
              Object.entries(results || {}).forEach(([key, resp]: any) => {
                const p = resp && (resp.data ?? resp) || null;
                fetched[key] = p;
              });
              finishWithPrestamoMap(fetched);
            });
          }
        },
        error: (e) => { console.error(e); this.error = 'Error cargando devoluciones'; }
      });
  }

  crear() {
    this.message = null; this.error = null;
    const payload = { ...this.form };
    // include creado_por from current logged user when available
    const current = this.auth.getUser();
    if (current && (current['idUsuario'] ?? current['id'])) {
      payload.creado_por = current['idUsuario'] ?? current['id'];
    }

    // Normalize date field names: ensure backend-friendly `fecha_devolucion_real` is set
    if (!payload.fecha_devolucion_real && payload.fechaDevolucion) {
      payload.fecha_devolucion_real = payload.fechaDevolucion;
    }
    // keep both names to maximize compatibility
    if (!payload.fechaDevolucion && payload.fecha_devolucion_real) {
      payload.fechaDevolucion = payload.fecha_devolucion_real;
    }

    // Normalize condition field names: prefer camelCase `condicionAlDevolver` (API), but keep older variants for compatibility
    const condFromAny = payload.condicionAlDevolver ?? payload.condicion_al_devolver ?? payload.condicion ?? payload.motivo ?? null;
    if (condFromAny != null) {
      payload.condicionAlDevolver = condFromAny;
      payload.condicion_al_devolver = condFromAny;
      payload.condicion = condFromAny;
      payload.motivo = condFromAny;
    }

    this.svc.crearDevolucion(payload).subscribe({
      next: (r) => {
        this.message = 'Devolución registrada';
        this.load();
        this.form = { id_prestamo: '', fecha_devolucion_real: '', condicionAlDevolver: '', observaciones: '', solicitar_inspeccion: false, especialista_asignado_id: '', fecha_inspeccion_programada: '', inspeccion_realizada: '', estado_inspeccion: '' };
      },
      error: (err) => { console.error(err); this.error = 'Error registrando devolución'; }
    });
  }
}
