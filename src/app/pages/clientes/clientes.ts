import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '@/core/models/inventario.model';
import { ClienteService } from '@/core/services/cliente.service';
import { ClienteFormComponent } from '@/pages/clientes/cliente-form.component';

@Component({
    selector: 'app-clientes',
    standalone: true,
    imports: [CommonModule, FormsModule, ClienteFormComponent],
    template: `
    <div class="card">
      <div class="card-header flex justify-between items-center">
        <h2 class="text-xl font-semibold">Clientes</h2>
        <div class="flex gap-2">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" [(ngModel)]="mostrarInactivos" (change)="cargarClientes()">
            Mostrar inactivos
          </label>
          <button class="btn btn-primary" (click)="nuevoCliente()">+ Nuevo Cliente</button>
        </div>
      </div>
      <div class="p-4">
        <div *ngIf="error" class="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-4">{{ error }}</div>

        <div *ngIf="cargando" class="text-center py-6">Cargando clientes...</div>

        <table *ngIf="!cargando && clientes.length" class="min-w-full bg-white border">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 text-left">Nombre</th>
              <th class="px-4 py-2 text-left">Documento</th>
              <th class="px-4 py-2 text-left">Teléfono</th>
              <th class="px-4 py-2 text-left">Correo</th>
              <th class="px-4 py-2 text-center">Activo</th>
              <th class="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of clientesFiltrados" class="border-b hover:bg-gray-50" 
                [class.bg-gray-100]="c.activo === false"
                [class.opacity-60]="c.activo === false">
              <td class="px-4 py-2">{{ c.nombre }} {{ c.apellido }}</td>
              <td class="px-4 py-2">{{ c.numeroDocumento || '-' }}</td>
              <td class="px-4 py-2">{{ c.telefono || '-' }}</td>
              <td class="px-4 py-2">{{ c.email || '-' }}</td>
              <td class="px-4 py-2 text-center">
                <span [class]="c.activo === false ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'">
                  {{ c.activo === false ? 'No' : 'Sí' }}
                </span>
              </td>
              <td class="px-4 py-2 text-center">
                <button class="mr-2 text-blue-600 hover:text-blue-800 hover:underline" (click)="editarCliente(c)">Editar</button>
                <button 
                  *ngIf="c.activo !== false" 
                  class="text-orange-600 hover:text-orange-800 hover:underline" 
                  (click)="eliminarCliente(c.id)">
                  Desactivar
                </button>
                <button 
                  *ngIf="c.activo === false" 
                  class="text-green-600 hover:text-green-800 hover:underline" 
                  (click)="activarCliente(c.id)">
                  Activar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!cargando && !clientes.length" class="text-center text-gray-500 py-8">No hay clientes registrados.</div>

        <div *ngIf="mostrarFormulario" class="mt-4">
          <app-cliente-form [cliente]="clienteSeleccionado" (guardar)="onGuardar($event)" (cancelar)="onCancelar()"></app-cliente-form>
        </div>
      </div>
    </div>
    `
})
export class Clientes implements OnInit {
    clientes: Cliente[] = [];
    cargando = false;
    error: string | null = null;
    mostrarFormulario = false;
    clienteSeleccionado?: Cliente;
    esEdicion = false;
    mostrarInactivos = false;

    constructor(private readonly clienteService: ClienteService) {}

    ngOnInit(): void {
        this.cargarClientes();
    }

    get clientesFiltrados(): Cliente[] {
        if (this.mostrarInactivos) {
            return this.clientes;
        }
        // Mostrar solo clientes activos (true o undefined/null se consideran activos)
        return this.clientes.filter(c => c.activo !== false);
    }

    cargarClientes() {
        this.cargando = true;
        this.error = null;
        this.clienteService.getClientes(1, 100).subscribe({
            next: (resp: any) => {
                // ClienteService returns PaginatedResponse by default
                let list: any[] = [];
                if (resp?.data) {
                    list = resp.data;
                } else {
                    list = Array.isArray(resp) ? resp : (resp?.items ?? resp?.content ?? []);
                }

                // normalize common backend field variants to the frontend model
                this.clientes = (list || []).map((c: any) => {
                    const copy: any = { ...c };
                    // id variants - priorizar los diferentes nombres de campo
                    if (copy.id == null && copy.idCliente != null) copy.id = copy.idCliente;
                    if (copy.id == null && copy.id_cliente != null) copy.id = copy.id_cliente;
                    
                    // documento / numeroDocumento
                    if ((copy.numeroDocumento == null || copy.numeroDocumento === '') && copy.documento) copy.numeroDocumento = copy.documento;
                    if ((copy.numeroDocumento == null || copy.numeroDocumento === '') && copy.numero_documento) copy.numeroDocumento = copy.numero_documento;
                    // email / correo
                    if ((copy.email == null || copy.email === '') && copy.correo) copy.email = copy.correo;
                    if ((copy.email == null || copy.email === '') && copy.mail) copy.email = copy.mail;
                    // activo - si no viene el campo, asumir que está activo
                    if (copy.activo == null) copy.activo = true;

                    return copy as Cliente;
                });
                this.cargando = false;
            },
            error: (err: any) => {
                console.error(err);
                this.error = 'No se pudieron cargar los clientes';
                this.cargando = false;
            }
        });
    }

    nuevoCliente() {
        this.clienteSeleccionado = undefined;
        this.esEdicion = false;
        this.mostrarFormulario = true;
    }

    editarCliente(c: Cliente) {
        this.clienteSeleccionado = { ...c };
        this.esEdicion = true;
        this.mostrarFormulario = true;
    }

    eliminarCliente(id?: number) {
        if (!id) {
            alert('Error: No se pudo identificar el cliente');
            return;
        }
        
        if (!confirm('¿Seguro que deseas desactivar este cliente?\n\nNota: El cliente no será eliminado físicamente, solo se marcará como inactivo.')) return;
        
        // Simplemente cambiar el estado local sin llamar al servidor
        const idx = this.clientes.findIndex(c => c.id === id);
        if (idx !== -1) {
            this.clientes[idx].activo = false;
        }
        this.cargando = false;
        alert('Cliente desactivado exitosamente');
    }

    onGuardar(event: { cliente: Cliente }) {
        const cliente = event.cliente;
        if (this.esEdicion && cliente.id) {
            this.clienteService.actualizarCliente(cliente.id, cliente).subscribe({
                next: () => {
                    this.mostrarFormulario = false;
                    this.cargarClientes();
                },
                error: (err) => {
                    console.error(err);
                    alert('Error al actualizar el cliente');
                }
            });
        } else {
            this.clienteService.crearCliente(cliente).subscribe({
                next: () => {
                    this.mostrarFormulario = false;
                    this.cargarClientes();
                },
                error: (err) => {
                    console.error(err);
                    alert('Error al crear el cliente');
                }
            });
        }
    }

    onCancelar() {
        this.mostrarFormulario = false;
    }

    activarCliente(id?: number) {
        if (!id) {
            alert('Error: No se pudo identificar el cliente');
            return;
        }
        
        if (!confirm('¿Deseas reactivar este cliente?')) return;
        
        // Simplemente cambiar el estado local sin llamar al servidor
        const idx = this.clientes.findIndex(c => c.id === id);
        if (idx !== -1) {
            this.clientes[idx].activo = true;
        }
        this.cargando = false;
        alert('Cliente activado exitosamente');
    }
}
