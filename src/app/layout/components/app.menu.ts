import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: '[app-menu]',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu" #menuContainer>
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    el = inject(ElementRef);

    @ViewChild('menuContainer') menuContainer!: ElementRef;

    model = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            routerLink: ['/']
        },
        {
            label: 'Mantenimiento',
            icon: 'pi pi-cog',
            items: [
                {
                    label: 'Clientes',
                    icon: 'pi pi-users',
                    routerLink: ['/clientes']
                },
                {
                    label: 'Equipos',
                    icon: 'pi pi-desktop',
                    routerLink: ['/equipos']
                },
                {
                    label: 'Estados',
                    icon: 'pi pi-list',
                    routerLink: ['/catalogos/estados']
                },
                {
                    label: 'Tipos',
                    icon: 'pi pi-tags',
                    routerLink: ['/catalogos/tipos-equipo']
                },
                {
                    label: 'Marcas',
                    icon: 'pi pi-bookmark',
                    routerLink: ['/catalogos/marcas']
                },
                {
                    label: 'Modelos',
                    icon: 'pi pi-folder',
                    routerLink: ['/catalogos/modelos']
                },
                {
                    label: 'Ubicaciones',
                    icon: 'pi pi-map',
                    routerLink: ['/catalogos/ubicaciones']
                },
                {
                    label: 'Usuarios',
                    icon: 'pi pi-user',
                    routerLink: ['/usuarios']
                },
                {
                    label: 'Roles',
                    icon: 'pi pi-shield',
                    routerLink: ['/roles']
                }
            ]
        },
        {
            label: 'Transaccional',
            icon: 'pi pi-briefcase',
            items: [
                {
                    label: 'Préstamos',
                    icon: 'pi pi-credit-card',
                    routerLink: ['/prestamos']
                },
                {
                    label: 'Evaluaciones',
                    icon: 'pi pi-check',
                    routerLink: ['/evaluaciones']
                },
                {
                    label: 'Reportes',
                    icon: 'pi pi-chart-bar',
                    routerLink: ['/reportes']
                }
            ]
        }
    ];
}
