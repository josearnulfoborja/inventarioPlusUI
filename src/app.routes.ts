import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/components/app.layout';
import { AuthGuard } from '@/core/guards/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
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
                path: 'catalogos/estados',
                loadComponent: () => import('@/pages/catalogs/estados.component').then((c) => c.EstadosComponent),
                data: { breadcrumb: 'Estados de Equipo' }
            },
            {
                path: 'catalogos/tipos-equipo',
                loadComponent: () => import('@/pages/catalogs/tipos-equipo.component').then((c) => c.TiposEquipoComponent),
                data: { breadcrumb: 'Tipos de Equipo' }
            },
            {
                path: 'catalogos/modelos',
                loadComponent: () => import('@/pages/catalogs/modelos.component').then((c) => c.ModelosComponent),
                data: { breadcrumb: 'Modelos' }
            },
            {
                path: 'catalogos/marcas',
                loadComponent: () => import('@/pages/catalogs/marcas.component').then((c) => c.MarcasComponent),
                data: { breadcrumb: 'Marcas' }
            },
            {
                path: 'catalogos/ubicaciones',
                loadComponent: () => import('@/pages/catalogs/ubicaciones.component').then((c) => c.UbicacionesComponent),
                data: { breadcrumb: 'Ubicaciones' }
            },
            {
                path: 'catalogos/mcodigos',
                loadComponent: () => import('@/pages/mcodigos/mcodigos.component').then((c) => c.McodigosComponent),
                data: { breadcrumb: 'Maestro Códigos' }
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
                path: 'devoluciones',
                loadComponent: () => import('@/pages/devoluciones/devoluciones.component').then(c => c.DevolucionesComponent),
                data: { breadcrumb: 'Devoluciones' }
            },
                {
                    path: 'usuarios',
                    loadComponent: () => import('src/app/pages/usuarios/usuarios.component').then(m => m.UsuariosComponent)
                },
                {
                    path: 'especialistas',
                    loadComponent: () => import('@/pages/especialistas/especialistas.component').then(m => m.EspecialistasComponent),
                    data: { breadcrumb: 'Especialistas' }
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
                pathMatch: 'full',
                loadChildren: () => import('@/pages/usermanagement/usermanagement.routes'),
                data: { breadcrumb: 'User Management' }
            }
            ,
            {
                path: 'profile/me',
                loadComponent: () => import('@/pages/profile/profile.component').then((c) => c.ProfileComponent),
                data: { breadcrumb: 'Mi Perfil' }
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
