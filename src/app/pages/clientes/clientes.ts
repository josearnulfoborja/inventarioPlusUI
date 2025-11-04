import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cliente } from '@/core/models/inventario.model';
import { ClienteService } from '@/core/services/cliente.service';
import { ClienteFormComponent } from '@/pages/clientes/cliente-form.component';

@Component({
    selector: 'app-clientes',
    standalone: true,
    imports: [CommonModule, ClienteFormComponent],
    template: `
    <div class="card">
      <div class="card-header flex justify-between items-center">
        <h2 class="text-xl font-semibold">Clientes</h2>
        <button class="btn btn-primary" (click)="nuevoCliente()">+ Nuevo Cliente</button>
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
            <tr *ngFor="let c of clientes" class="border-b hover:bg-gray-50">
              <td class="px-4 py-2">{{ c.nombre }} {{ c.apellido }}</td>
              <td class="px-4 py-2">{{ c.numeroDocumento || '-' }}</td>
              <td class="px-4 py-2">{{ c.telefono || '-' }}</td>
              <td class="px-4 py-2">{{ c.email || '-' }}</td>
              <td class="px-4 py-2 text-center">
                <span [class]="c.activo ? 'text-green-600' : 'text-gray-500'">{{ c.activo ? 'Sí' : 'No' }}</span>
              </td>
              <td class="px-4 py-2 text-center">
                <button class="mr-2 text-yellow-600" (click)="editarCliente(c)">Editar</button>
                <button class="text-red-600" (click)="eliminarCliente(c.id)">Eliminar</button>
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

    constructor(private readonly clienteService: ClienteService) {}

    ngOnInit(): void {
        this.cargarClientes();
    }

    cargarClientes() {
        this.cargando = true;
        this.error = null;
        this.clienteService.getClientes(1, 100).subscribe({
            next: (resp: any) => {
                // ClienteService returns PaginatedResponse by default
                if (resp?.data) {
                    this.clientes = resp.data;
                } else {
                    this.clientes = resp as Cliente[];
                }
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
        if (!id) return;
        if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
        this.clienteService.eliminarCliente(id).subscribe({
            next: () => this.cargarClientes(),
            error: (err) => {
                console.error(err);
                alert('Error al eliminar el cliente');
            }
        });
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
}
