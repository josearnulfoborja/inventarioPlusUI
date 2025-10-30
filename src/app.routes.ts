import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/components/app.layout';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: '',
                loadComponent: () => import('@/pages/dashboards/ecommercedashboard').then((c) => c.EcommerceDashboard),
                data: { breadcrumb: 'E-Commerce Dashboard' }
            },
            {
                path: 'clientes',
                loadComponent: () => import('@/pages/clientes/clientes').then((c) => c.Clientes),
                data: { breadcrumb: 'Clientes' }
            },
            {
                path: 'equipos',
                loadComponent: () => import('@/pages/equipos/equipos').then((c) => c.Equipos),
                data: { breadcrumb: 'Equipos' }
            },
            {
                path: 'prestamos',
                loadComponent: () => import('@/pages/prestamos/prestamos').then((c) => c.Prestamos),
                data: { breadcrumb: 'Préstamos' }
            },
            {
                path: 'evaluaciones',
                loadComponent: () => import('@/pages/evaluaciones/evaluaciones').then((c) => c.EvaluacionesComponent),
                data: { breadcrumb: 'Evaluaciones' }
            },
            {
                path: 'usuarios',
                loadComponent: () => import('@/pages/usuarios/usuarios').then((c) => c.Usuarios),
                data: { breadcrumb: 'Usuarios' }
            },
            {
                path: 'roles',
                loadComponent: () => import('@/pages/usuarios/roles.component').then((c) => c.RolesComponent),
                data: { breadcrumb: 'Roles' }
            },
            {
                path: 'reportes',
                loadComponent: () => import('@/pages/reportes/reportes').then((c) => c.Reportes),
                data: { breadcrumb: 'Reportes' }
            },
            {
                path: 'dashboard-banking',
                loadComponent: () => import('@/pages/dashboards/bankingdashboard').then((c) => c.BankingDashboard),
                data: { breadcrumb: 'Banking Dashboard' }
            },
            {
                path: 'uikit',
                data: { breadcrumb: 'UI Kit' },
                loadChildren: () => import('@/pages/uikit/uikit.routes')
            },
            {
                path: 'documentation',
                data: { breadcrumb: 'Documentation' },
                loadComponent: () => import('@/pages/documentation/documentation').then((c) => c.Documentation)
            },
            {
                path: 'pages',
                loadChildren: () => import('@/pages/pages.routes'),
                data: { breadcrumb: 'Pages' }
            },
            {
                path: 'apps',
                loadChildren: () => import('@/apps/apps.routes'),
                data: { breadcrumb: 'Apps' }
            },

            {
                path: 'blocks',
                data: { breadcrumb: 'Free Blocks' },
                loadComponent: () => import('@/pages/blocks/blocks').then((c) => c.Blocks)
            },
            {
                path: 'ecommerce',
                loadChildren: () => import('@/pages/ecommerce/ecommerce.routes'),
                data: { breadcrumb: 'E-Commerce' }
            },
            {
                path: 'profile',
                loadChildren: () => import('@/pages/usermanagement/usermanagement.routes'),
                data: { breadcrumb: 'User Management' }
            }
        ]
    },
    { path: 'landing', loadComponent: () => import('@/pages/landing/landing').then((c) => c.Landing) },
    { path: 'notfound', loadComponent: () => import('@/pages/notfound/notfound').then((c) => c.Notfound) },
    { path: 'notfound2', loadComponent: () => import('@/pages/notfound/notfound2').then((c) => c.Notfound2) },
    {
        path: 'auth',
        loadChildren: () => import('@/pages/auth/auth.routes')
    },
    { path: '**', redirectTo: '/notfound' }
];
