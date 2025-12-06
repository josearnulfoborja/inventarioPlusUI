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

@Component({
    selector: 'app-ecommerce-dashboard',
    imports: [ChartModule, TableModule, MenuModule, ButtonModule, InputTextModule, FormsModule, CommonModule, IconFieldModule, InputIconModule, TagModule, RippleModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <!-- Tarjetas de estadísticas principales -->
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <div class="p-4 text-white h-24 rounded-border m-0 bg-center bg-cover bg-no-repeat bg-cyan-400" style="background-image: url('/demo/images/dashboard/effect-1.svg')">
                    <div class="font-bold w-full mb-2">
                        <span>Clientes</span>
                    </div>
                    <div class="text-white text-2xl font-bold w-full flex items-center py-1">{{ stats.clientes }}</div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <div class="p-4 text-white h-24 rounded-border m-0 bg-center bg-cover bg-no-repeat bg-orange-400" style="background-image: url('/demo/images/dashboard/effect-2.svg')">
                    <div class="font-bold w-full mb-2">
                        <span>Equipos</span>
                    </div>
                    <div class="text-white text-2xl font-bold w-full flex items-center py-1">{{ stats.equipos }}</div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <div class="p-4 text-white h-24 rounded-border m-0 bg-center bg-cover bg-no-repeat bg-purple-400" style="background-image: url('/demo/images/dashboard/effect-3.svg')">
                    <div class="font-bold w-full mb-2">
                        <span>Préstamos Activos</span>
                    </div>
                    <div class="text-white text-2xl font-bold w-full flex items-center py-1">{{ stats.prestamosActivos }}</div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
                <div class="p-4 text-white h-24 rounded-border m-0 bg-center bg-cover bg-no-repeat bg-slate-400" style="background-image: url('/demo/images/dashboard/effect-4.svg')">
                    <div class="font-bold w-full mb-2">
                        <span>Usuarios</span>
                    </div>
                    <div class="text-white text-2xl font-bold w-full flex items-center py-1">{{ stats.usuarios }}</div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card h-full">
                    <h5>Weekly Overview</h5>
                    <p-chart type="line" [data]="chartData" [options]="chartOptions" id="nasdaq-chart" [responsive]="true"></p-chart>
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

            <div class="col-span-12 lg:col-span-4">
                <div class="card">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-bold text-3xl text-color">{{ stats.equipos }}</span>
                            <p class="mt-2 mb-0 text-2xl text-muted-color">Equipos Registrados</p>
                        </div>
                        <div>
                            <i class="pi pi-desktop text-6xl text-cyan-500"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <div class="card">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-bold text-3xl text-color">{{ stats.prestamosActivos }}</span>
                            <p class="mt-2 mb-0 text-2xl text-muted-color">Préstamos Activos</p>
                        </div>
                        <div>
                            <i class="pi pi-send text-6xl text-orange-500"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <div class="card">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-bold text-3xl text-color">{{ stats.evaluaciones }}</span>
                            <p class="mt-2 mb-0 text-2xl text-muted-color">Evaluaciones Realizadas</p>
                        </div>
                        <div>
                            <i class="pi pi-check-circle text-6xl text-green-500"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 xl:col-span-6">
                <div class="card p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h5>Product Sales</h5>
                        <button pButton pRipple icon="pi pi-refresh" rounded outlined></button>
                    </div>

                    <div class="grid grid-cols-12 gap-4 mr-0">
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-surface-0 dark:bg-surface-950 border border-surface rounded-border" style="width: 90px; height: 90px">
                                    <img src="/demo/images/dashboard/headphone.png" style="width: 48px; height: 48px" />
                                </div>
                                <span class="font-medium text-color">Headphone</span>
                                <div class="text-sm text-muted-color mt-2">220 Sales</div>
                            </div>
                        </div>
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-surface-0 dark:bg-surface-950 border border-surface rounded-border" style="width: 90px; height: 90px">
                                    <img src="/demo/images/dashboard/laptop.png" style="width: 48px; height: 48px" />
                                </div>
                                <span class="font-medium text-color">Laptop</span>
                                <div class="text-sm text-muted-color mt-2">110 Sales</div>
                            </div>
                        </div>
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-surface-0 dark:bg-surface-950 border border-surface rounded-border" style="width: 90px; height: 90px">
                                    <img src="/demo/images/dashboard/phone.png" style="width: 48px; height: 48px" />
                                </div>
                                <span class="font-medium text-color">Phone</span>
                                <div class="text-sm text-muted-color mt-2">90 Sales</div>
                            </div>
                        </div>
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-surface-0 dark:bg-surface-950 border border-surface rounded-border" style="width: 90px; height: 90px">
                                    <img src="/demo/images/dashboard/shoes.png" style="width: 48px; height: 48px" />
                                </div>
                                <span class="font-medium text-color">Shoes</span>
                                <div class="text-sm text-muted-color mt-2">77 Sales</div>
                            </div>
                        </div>
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-surface-0 dark:bg-surface-950 border border-surface rounded-border" style="width: 90px; height: 90px">
                                    <img src="/demo/images/dashboard/tshirt.png" style="width: 48px; height: 48px" />
                                </div>
                                <span class="font-medium text-color">Tshirt</span>
                                <div class="text-sm text-muted-color mt-2">454 Sales</div>
                            </div>
                        </div>
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-surface-0 dark:bg-surface-950 border border-surface rounded-border" style="width: 90px; height: 90px">
                                    <img src="/demo/images/dashboard/vacuum.png" style="width: 48px; height: 48px" />
                                </div>
                                <span class="font-medium text-color">Vacuum</span>
                                <div class="text-sm text-muted-color mt-2">330 Sales</div>
                            </div>
                        </div>
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-surface-0 dark:bg-surface-950 border border-surface rounded-border" style="width: 90px; height: 90px">
                                    <img src="/demo/images/dashboard/wallet.png" style="width: 48px; height: 48px" />
                                </div>
                                <span class="font-medium text-color">Wallet</span>
                                <div class="text-sm text-muted-color mt-2">42 Sales</div>
                            </div>
                        </div>
                        <div class="col-span-6 md:col-span-4 lg:col-span-3 p-4">
                            <div class="text-center">
                                <div class="flex items-center justify-center mb-4 mx-auto bg-surface-0 dark:bg-surface-950 border border-surface rounded-border" style="width: 90px; height: 90px">
                                    <img src="/demo/images/dashboard/watch.png" style="width: 48px; height: 48px" />
                                </div>
                                <span class="font-medium text-color">Watch</span>
                                <div class="text-sm text-muted-color mt-2">112 Sales</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 xl:col-span-6">
                <div class="card">
                    <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-4 md:mb-0">Recent Sales</div>
                        <div class="inline-flex items-center">
                            <p-iconfield class="flex-auto">
                                <p-inputicon class="pi pi-search" />
                                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search" class="w-full" style="border-radius: 2rem" />
                            </p-iconfield>
                            <button pButton pRipple icon="pi pi-upload" class="mx-4 export-target-button" rounded (click)="dt.exportCSV()"></button>
                        </div>
                    </div>
                    <p-table #dt [value]="products" [columns]="cols" [paginator]="true" [rows]="6" responsiveLayout="scroll" [globalFilterFields]="['name', 'category', 'inventoryStatus']">
                        <ng-template pTemplate="header">
                            <tr>
                                <th pSortableColumn="name" style="min-width:12rem" class="white-space-nowrap">
                                    Name
                                    <p-sortIcon field="name"></p-sortIcon>
                                </th>
                                <th pSortableColumn="category" style="min-width:10rem" class="white-space-nowrap">
                                    Category
                                    <p-sortIcon field="category"></p-sortIcon>
                                </th>
                                <th pSortableColumn="price" style="min-width:10rem" class="white-space-nowrap">
                                    Price
                                    <p-sortIcon field="price"></p-sortIcon>
                                </th>
                                <th pSortableColumn="inventoryStatus" style="min-width:10rem" class="white-space-nowrap">
                                    Status
                                    <p-sortIcon field="inventoryStatus"></p-sortIcon>
                                </th>
                                <th></th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-product>
                            <tr>
                                <td>{{ product.name }}</td>
                                <td>
                                    {{ product.category }}
                                </td>
                                <td>
                                    {{ product.price | currency: 'USD' }}
                                </td>
                                <td>
                                    <p-tag [severity]="getBadgeSeverity(product)">{{ product.inventoryStatus }}</p-tag>
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

        this.chartInit();
        this.loadStats();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    loadStats() {
        // Cargar estadísticas de todos los módulos
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
                this.stats.clientes = responses.clientes.pagination?.totalItems || 0;
                this.stats.equipos = responses.equipos.pagination?.totalItems || 0;
                this.stats.usuarios = responses.usuarios.pagination?.totalItems || 0;
                this.stats.prestamos = responses.prestamos.pagination?.totalItems || 0;
                this.stats.evaluaciones = responses.evaluaciones.pagination?.totalItems || 0;
                this.stats.marcas = Array.isArray(responses.marcas) ? responses.marcas.length : 0;
                this.stats.modelos = Array.isArray(responses.modelos) ? responses.modelos.length : 0;
                this.stats.tiposEquipo = Array.isArray(responses.tiposEquipo) ? responses.tiposEquipo.length : 0;
                this.stats.ubicaciones = Array.isArray(responses.ubicaciones) ? responses.ubicaciones.length : 0;

                // Cargar préstamos activos por separado
                this.prestamoService.getPrestamosActivos().subscribe({
                    next: (response) => {
                        this.stats.prestamosActivos = Array.isArray(response.data) ? response.data.length : 0;
                    },
                    error: (error) => {
                        console.error('Error al cargar préstamos activos:', error);
                        this.stats.prestamosActivos = 0;
                    }
                });
            },
            error: (error) => {
                console.error('Error al cargar estadísticas:', error);
            }
        });
    }

    chartInit() {
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color') || 'rgba(0, 0, 0, 0.87)';
        const surfaceBorder = getComputedStyle(document.body).getPropertyValue('--surface-border');

        this.items = [
            {
                label: 'Options',
                items: [
                    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
                    { label: 'Search', icon: 'pi pi-fw pi-search' }
                ]
            }
        ];

        this.chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'New',
                    data: [11, 17, 30, 60, 88, 92],
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
                    label: 'Completed',
                    data: [11, 19, 39, 59, 69, 71],
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
                    label: 'Canceled',
                    data: [11, 17, 21, 30, 47, 83],
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
}
