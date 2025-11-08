import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./especialistas.component').then(m => m.EspecialistasComponent),
    data: { breadcrumb: 'Especialistas' }
  }
] as Routes;
