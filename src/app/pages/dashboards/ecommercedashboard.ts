import { Component, ElementRef, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { Table, TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Product, ProductService } from '@/pages/service/product.service';
import { LayoutService } from '@/layout/service/layout.service';
import { debounceTime, Subscription, forkJoin } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { ClienteService } from '@/core/services/cliente.service';
import { EquipoService } from '@/core/services/equipo.service';
import { UsuarioService } from '@/core/services/usuario.service';
import { PrestamoService } from '@/core/services/prestamo.service';
import { EvaluacionService } from '@/core/services/evaluacion.service';
import { MarcaService } from '@/core/services/marca.service';
import { ModeloService } from '@/core/services/modelo.service';
import { TipoEquipoService } from '@/core/services/tipo-equipo.service';
import { UbicacionService } from '@/core/services/ubicacion.service';
import { ReporteService } from '@/core/services/reporte.service';

@Component({
    selector: 'app-ecommerce-dashboard',
    imports: [ChartModule, TableModule, MenuModule, ButtonModule, InputTextModule, FormsModule, CommonModule, IconFieldModule, InputIconModule, TagModule, RippleModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <!-- Tarjetas de estadísticas principales -->
            <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <div class="p-4 text-white h-24 rounded-border m-0 bg-center bg-cover bg-no-repeat bg-cyan-400" style="background-image: url('/demo/images/dashboard/effect-1.svg')">
                    <div class="font-bold w-full mb-2">
                        <span>Clientes</span>
                    </div>
                    <div class="text-white text-2xl font-bold w-full flex items-center py-1">{{ stats.clientes }}</div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <div class="p-4 text-white h-24 rounded-border m-0 bg-center bg-cover bg-no-repeat bg-orange-400" style="background-image: url('/demo/images/dashboard/effect-2.svg')">
                    <div class="font-bold w-full mb-2">
                        <span>Equipos</span>
                    </div>
                    <div class="text-white text-2xl font-bold w-full flex items-center py-1">{{ stats.equipos }}</div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <div class="p-4 text-white h-24 rounded-border m-0 bg-center bg-cover bg-no-repeat bg-slate-400" style="background-image: url('/demo/images/dashboard/effect-4.svg')">
                    <div class="font-bold w-full mb-2">
                        <span>Usuarios</span>
                    </div>
                    <div class="text-white text-2xl font-bold w-full flex items-center py-1">{{ stats.usuarios }}</div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <div class="flex items-center justify-between mb-6">
                        <h5>Resumen del Sistema</h5>
                        <div class="ml-auto">
                            <button pButton pRipple icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" (click)="menu.toggle($event)"></button>
                            <p-menu #menu [popup]="true" [model]="items"></p-menu>
                        </div>
                    </div>

                    <ul class="mt-6 p-0 mx-0">
                        <li class="flex items-center py-3 border-b border-surface">
                            <span class="rounded-border bg-cyan-500 mr-4 w-4 h-4"></span>
                            <span class="text-lg font-medium text-color">Marcas</span>
                            <span class="text-lg font-medium text-muted-color ml-auto">{{ stats.marcas }}</span>
                        </li>
                        <li class="flex items-center py-3 border-b border-surface">
                            <span class="rounded-md bg-orange-500 mr-4 w-4 h-4"></span>
                            <span class="text-lg font-medium text-color">Modelos</span>
                            <span class="text-lg font-medium text-muted-color ml-auto">{{ stats.modelos }}</span>
                        </li>
                        <li class="flex items-center py-3 border-b border-surface">
                            <span class="rounded-md bg-pink-500 mr-4 w-4 h-4"></span>
                            <span class="text-lg font-medium text-color">Tipos de Equipo</span>
                            <span class="text-lg font-medium text-muted-color ml-auto">{{ stats.tiposEquipo }}</span>
                        </li>
                        <li class="flex items-center py-3 border-b border-surface">
                            <span class="rounded-md bg-purple-500 mr-4 w-4 h-4"></span>
                            <span class="text-lg font-medium text-color">Ubicaciones</span>
                            <span class="text-lg font-medium text-muted-color ml-auto">{{ stats.ubicaciones }}</span>
                        </li>
                        <li class="flex items-center py-3 border-b border-surface">
                            <span class="rounded-md bg-blue-500 mr-4 w-4 h-4"></span>
                            <span class="text-lg font-medium text-color">Evaluaciones</span>
                            <span class="text-lg font-medium text-muted-color ml-auto">{{ stats.evaluaciones }}</span>
                        </li>
                        <li class="flex items-center py-3">
                            <span class="rounded-md bg-green-500 mr-4 w-4 h-4"></span>
                            <span class="text-lg font-medium text-color">Préstamos Totales</span>
                            <span class="text-lg font-medium text-muted-color ml-auto">{{ stats.prestamos }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="col-span-12 xl:col-span-6">
                <div class="card p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h5>Equipos por Estado</h5>
                        <button pButton pRipple icon="pi pi-refresh" rounded outlined (click)="loadStats()"></button>
                    </div>

                    <div class="grid grid-cols-12 gap-4 mr-0">
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-border" style="width: 90px; height: 90px">
                                    <i class="pi pi-check-circle text-green-500 text-4xl"></i>
                                </div>
                                <span class="font-medium text-color">Disponible</span>
                                <div class="text-sm text-muted-color mt-2">{{ equiposPorEstado.disponible }} Equipos</div>
                            </div>
                        </div>
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-border" style="width: 90px; height: 90px">
                                    <i class="pi pi-send text-orange-500 text-4xl"></i>
                                </div>
                                <span class="font-medium text-color">Prestado</span>
                                <div class="text-sm text-muted-color mt-2">{{ equiposPorEstado.prestado }} Equipos</div>
                            </div>
                        </div>
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-border" style="width: 90px; height: 90px">
                                    <i class="pi pi-wrench text-blue-500 text-4xl"></i>
                                </div>
                                <span class="font-medium text-color">Mantenimiento</span>
                                <div class="text-sm text-muted-color mt-2">{{ equiposPorEstado.mantenimiento }} Equipos</div>
                            </div>
                        </div>
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-border" style="width: 90px; height: 90px">
                                    <i class="pi pi-times-circle text-red-500 text-4xl"></i>
                                </div>
                                <span class="font-medium text-color">Baja</span>
                                <div class="text-sm text-muted-color mt-2">{{ equiposPorEstado.baja }} Equipos</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div class="col-span-12 xl:col-span-6">
                <div class="card">
                    <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-4 md:mb-0">Préstamos Recientes</div>
                        <div class="inline-flex items-center">
                            <p-iconfield class="flex-auto">
                                <p-inputicon class="pi pi-search" />
                                <input pInputText type="text" (input)="onGlobalFilterPrestamos(dtPrestamos, $event)" placeholder="Buscar" class="w-full" style="border-radius: 2rem" />
                            </p-iconfield>
                            <button pButton pRipple icon="pi pi-upload" class="mx-4 export-target-button" rounded (click)="dtPrestamos.exportCSV()"></button>
                        </div>
                    </div>
                    <p-table #dtPrestamos [value]="prestamosRecientes" [columns]="colsPrestamos" [paginator]="true" [rows]="6" responsiveLayout="scroll" [globalFilterFields]="['cliente', 'equipo', 'estado']">
                        <ng-template pTemplate="header">
                            <tr>
                                <th pSortableColumn="cliente" style="min-width:12rem" class="white-space-nowrap">
                                    Cliente
                                    <p-sortIcon field="cliente"></p-sortIcon>
                                </th>
                                <th pSortableColumn="equipo" style="min-width:10rem" class="white-space-nowrap">
                                    Equipo
                                    <p-sortIcon field="equipo"></p-sortIcon>
                                </th>
                                <th pSortableColumn="fechaPrestamo" style="min-width:10rem" class="white-space-nowrap">
                                    Fecha Préstamo
                                    <p-sortIcon field="fechaPrestamo"></p-sortIcon>
                                </th>
                                <th pSortableColumn="estado" style="min-width:10rem" class="white-space-nowrap">
                                    Estado
                                    <p-sortIcon field="estado"></p-sortIcon>
                                </th>
                                <th></th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-prestamo>
                            <tr>
                                <td>{{ prestamo.cliente }}</td>
                                <td>{{ prestamo.equipo }}</td>
                                <td>{{ prestamo.fechaPrestamo | date: 'dd/MM/yyyy' }}</td>
                                <td>
                                    <p-tag [severity]="getPrestamoBadgeSeverity(prestamo.estado)">{{ prestamo.estado }}</p-tag>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>
        </div>
    `,
    providers: [ProductService]
})
export class EcommerceDashboard implements OnInit, OnDestroy {
    products!: Product[];

    chartData: any;

    chartOptions: any;

    layoutService: LayoutService = inject(LayoutService);
    private reporteService = inject(ReporteService);
    private clienteService = inject(ClienteService);
    private equipoService = inject(EquipoService);
    private usuarioService = inject(UsuarioService);
    private prestamoService = inject(PrestamoService);
    private evaluacionService = inject(EvaluacionService);
    private marcaService = inject(MarcaService);
    private modeloService = inject(ModeloService);
    private tipoEquipoService = inject(TipoEquipoService);
    private ubicacionService = inject(UbicacionService);

    items!: MenuItem[];

    cols: any[] = [];
    colsPrestamos: any[] = [];

    subscription!: Subscription;

    @ViewChild('chatcontainer') chatContainerViewChild!: ElementRef;

    stats = {
        clientes: 0,
        equipos: 0,
        usuarios: 0,
        prestamos: 0,
        prestamosActivos: 0,
        evaluaciones: 0,
        marcas: 0,
        modelos: 0,
        tiposEquipo: 0,
        ubicaciones: 0
    };

    equiposPorEstado = {
        disponible: 0,
        prestado: 0,
        mantenimiento: 0,
        baja: 0
    };

    prestamosRecientes: any[] = [];

    constructor(private productService: ProductService) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(50)).subscribe((config) => {
            this.chartInit();
        });
    }

    ngOnInit() {
        this.productService.getProducts().then((data) => (this.products = data));

        this.cols = [
            { header: 'Name', field: 'name' },
            { header: 'Category', field: 'category' },
            { header: 'Price', field: 'price' },
            { header: 'Status', field: 'inventoryStatus' }
        ];

        this.colsPrestamos = [
            { header: 'Cliente', field: 'cliente' },
            { header: 'Equipo', field: 'equipo' },
            { header: 'Fecha Préstamo', field: 'fechaPrestamo' },
            { header: 'Estado', field: 'estado' }
        ];

        this.chartInit();
        this.loadStats();
        this.loadPrestamosRecientes();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    loadStats() {
        console.log('🔄 Cargando estadísticas del dashboard...');
        
        // Usar el servicio de reportes para obtener todas las estadísticas en una sola llamada
        this.reporteService.getDashboardStats().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    console.log('✅ Estadísticas del dashboard recibidas:', response.data);
                    
                    const data = response.data;
                    this.stats.clientes = data.totalClientes || 0;
                    this.stats.equipos = data.totalEquipos || 0;
                    this.stats.usuarios = data.clientesActivos || 0;
                    this.stats.prestamosActivos = data.prestamosActivos || 0;
                    this.stats.evaluaciones = data.evaluacionesPendientes || 0;
                    
                    console.log('📊 Estadísticas actualizadas:', this.stats);
                    
                    // Cargar detalles adicionales
                    this.loadDetallesAdicionales();
                    this.loadEquiposPorEstado();
                }
            },
            error: (error) => {
                console.error('⚠️ El endpoint de estadísticas no está disponible, usando método alternativo');
                console.error('Error:', error);
                // Fallback: cargar estadísticas individualmente
                this.loadStatsIndividual();
            }
        });
    }

    loadStatsIndividual() {
        console.log('🔄 Cargando estadísticas individualmente...');
        
        forkJoin({
            clientes: this.clienteService.getClientes(1, 1),
            equipos: this.equipoService.getEquipos(1, 1),
            usuarios: this.usuarioService.getUsuarios(1, 1),
            prestamos: this.prestamoService.getPrestamos(1, 1),
            evaluaciones: this.evaluacionService.getEvaluaciones(1, 1),
            marcas: this.marcaService.listar(),
            modelos: this.modeloService.listar(),
            tiposEquipo: this.tipoEquipoService.listar(),
            ubicaciones: this.ubicacionService.listar()
        }).subscribe({
            next: (responses) => {
                console.log('✅ Respuestas recibidas:', responses);
                
                this.stats.clientes = responses.clientes.pagination?.totalItems || 0;
                this.stats.equipos = responses.equipos.pagination?.totalItems || 0;
                this.stats.usuarios = responses.usuarios.pagination?.totalItems || 0;
                this.stats.prestamos = responses.prestamos.pagination?.totalItems || 0;
                this.stats.evaluaciones = responses.evaluaciones.pagination?.totalItems || 0;
                this.stats.marcas = Array.isArray(responses.marcas) ? responses.marcas.length : 0;
                this.stats.modelos = Array.isArray(responses.modelos) ? responses.modelos.length : 0;
                this.stats.tiposEquipo = Array.isArray(responses.tiposEquipo) ? responses.tiposEquipo.length : 0;
                this.stats.ubicaciones = Array.isArray(responses.ubicaciones) ? responses.ubicaciones.length : 0;

                console.log('📊 Estadísticas actualizadas:', this.stats);

                // Intentar cargar préstamos activos
                this.prestamoService.getPrestamosActivos().subscribe({
                    next: (response) => {
                        this.stats.prestamosActivos = Array.isArray(response.data) ? response.data.length : 0;
                        console.log('✅ Préstamos activos:', this.stats.prestamosActivos);
                    },
                    error: (error) => {
                        console.warn('⚠️ No se pudieron cargar préstamos activos');
                        this.stats.prestamosActivos = 0;
                    }
                });

                this.loadEquiposPorEstado();
            },
            error: (error) => {
                console.error('❌ Error al cargar estadísticas:', error);
            }
        });
    }

    loadDetallesAdicionales() {
        // Cargar marcas, modelos, tipos y ubicaciones
        forkJoin({
            marcas: this.marcaService.listar(),
            modelos: this.modeloService.listar(),
            tiposEquipo: this.tipoEquipoService.listar(),
            ubicaciones: this.ubicacionService.listar(),
            usuarios: this.usuarioService.getUsuarios(1, 1),
            evaluaciones: this.evaluacionService.getEvaluaciones(1, 1),
            prestamos: this.prestamoService.getPrestamos(1, 1)
        }).subscribe({
            next: (responses) => {
                this.stats.marcas = Array.isArray(responses.marcas) ? responses.marcas.length : 0;
                this.stats.modelos = Array.isArray(responses.modelos) ? responses.modelos.length : 0;
                this.stats.tiposEquipo = Array.isArray(responses.tiposEquipo) ? responses.tiposEquipo.length : 0;
                this.stats.ubicaciones = Array.isArray(responses.ubicaciones) ? responses.ubicaciones.length : 0;
                this.stats.usuarios = responses.usuarios.pagination?.totalItems || 0;
                this.stats.evaluaciones = responses.evaluaciones.pagination?.totalItems || 0;
                this.stats.prestamos = responses.prestamos.pagination?.totalItems || 0;
                
                console.log('✅ Detalles adicionales cargados:', {
                    marcas: this.stats.marcas,
                    modelos: this.stats.modelos,
                    tipos: this.stats.tiposEquipo,
                    ubicaciones: this.stats.ubicaciones
                });
            },
            error: (error) => {
                console.error('⚠️ Error al cargar detalles adicionales:', error);
            }
        });
    }

    loadEquiposPorEstado() {
        console.log('🔄 Cargando equipos por estado...');
        
        forkJoin({
            disponible: this.equipoService.getEquipos(1, 1, { estado: 'DISPONIBLE' }),
            prestado: this.equipoService.getEquipos(1, 1, { estado: 'PRESTADO' }),
            mantenimiento: this.equipoService.getEquipos(1, 1, { estado: 'MANTENIMIENTO' }),
            baja: this.equipoService.getEquipos(1, 1, { estado: 'BAJA' })
        }).subscribe({
            next: (responses) => {
                this.equiposPorEstado.disponible = responses.disponible.pagination?.totalItems || 0;
                this.equiposPorEstado.prestado = responses.prestado.pagination?.totalItems || 0;
                this.equiposPorEstado.mantenimiento = responses.mantenimiento.pagination?.totalItems || 0;
                this.equiposPorEstado.baja = responses.baja.pagination?.totalItems || 0;
                
                console.log('✅ Equipos por estado:', this.equiposPorEstado);
            },
            error: (error) => {
                console.error('❌ Error al cargar equipos por estado:', error);
            }
        });
    }

    loadPrestamosRecientes() {
        console.log('🔄 Cargando préstamos recientes...');
        
        this.prestamoService.getPrestamos(1, 10).subscribe({
            next: (response) => {
                console.log('📦 Respuesta préstamos:', response);
                
                if (response.success && response.data) {
                    this.prestamosRecientes = response.data.map((prestamo: any) => ({
                        id: prestamo.id,
                        cliente: `${prestamo.cliente?.nombre || ''} ${prestamo.cliente?.apellido || ''}`.trim() || 'Sin cliente',
                        equipo: prestamo.equipo?.nombre || 'Sin equipo',
                        fechaPrestamo: prestamo.fechaPrestamo,
                        estado: prestamo.estado
                    }));
                    
                    console.log('✅ Préstamos recientes cargados:', this.prestamosRecientes.length);
                }
            },
            error: (error) => {
                console.error('❌ Error al cargar préstamos recientes:', error);
            }
        });
    }

    chartInit() {
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color') || 'rgba(0, 0, 0, 0.87)';
        const surfaceBorder = getComputedStyle(document.body).getPropertyValue('--surface-border');

        this.items = [
            {
                label: 'Opciones',
                items: [
                    { label: 'Actualizar', icon: 'pi pi-fw pi-refresh', command: () => this.loadStats() },
                    { label: 'Ver Reportes', icon: 'pi pi-fw pi-chart-bar' }
                ]
            }
        ];

        this.chartData = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Equipos',
                    data: [10, 15, 18, 22, 25, 30],
                    backgroundColor: 'rgba(13, 202, 240, .2)',
                    borderColor: '#0dcaf0',
                    pointBackgroundColor: '#0dcaf0',
                    pointBorderColor: '#0dcaf0',
                    pointBorderWidth: 0,
                    pointStyle: 'line',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Préstamos',
                    data: [8, 12, 20, 35, 45, 50],
                    backgroundColor: 'rgba(253, 126, 20, .2)',
                    borderColor: '#fd7e14',
                    pointBackgroundColor: '#fd7e14',
                    pointBorderColor: '#fd7e14',
                    pointBorderWidth: 0,
                    pointStyle: 'line',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Evaluaciones',
                    data: [5, 10, 15, 25, 35, 45],
                    backgroundColor: 'rgba(111, 66, 193, .2)',
                    borderColor: '#6f42c1',
                    pointBackgroundColor: '#6f42c1',
                    pointBorderColor: '#6f42c1',
                    pointBorderWidth: 0,
                    pointStyle: 'line',
                    fill: true,
                    tension: 0.4
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.9,
            plugins: {
                legend: {
                    fill: true,
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                y: {
                    max: 100,
                    min: 0,
                    grid: {
                        color: surfaceBorder
                    },
                    ticks: {
                        color: textColor
                    }
                },
                x: {
                    grid: {
                        display: true,
                        color: surfaceBorder
                    },
                    ticks: {
                        color: textColor,
                        beginAtZero: true
                    }
                }
            }
        };
    }

    onEmojiClick(chatInput: any, emoji: string) {
        if (chatInput) {
            chatInput.value += emoji;
            chatInput.focus();
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onGlobalFilterPrestamos(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getBadgeSeverity(product: Product) {
        switch (product.inventoryStatus) {
            case 'INSTOCK':
                return 'success';

            case 'LOWSTOCK':
                return 'warn';

            case 'OUTOFSTOCK':
                return 'danger';

            default:
                return 'info';
        }
    }

    getPrestamoBadgeSeverity(estado: string) {
        switch (estado) {
            case 'ACTIVO':
                return 'success';

            case 'DEVUELTO':
                return 'info';

            case 'VENCIDO':
                return 'danger';

            case 'CANCELADO':
                return 'warn';

            default:
                return 'info';
        }
    }
}
