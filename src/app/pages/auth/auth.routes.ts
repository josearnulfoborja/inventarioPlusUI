import { Routes } from '@angular/router';
import { AccessDenied } from './accessdenied';
import { AccessDenied2 } from './accessdenied2';
import { Login } from './login';
import { Login2 } from './login2';
import { Error } from './error';
import { Error2 } from './error2';

export default [
    { path: 'access', component: AccessDenied },
    { path: 'access2', component: AccessDenied2 },
    { path: 'error', component: Error },
    { path: 'error2', component: Error2 },
    { path: 'login', component: Login },
    { path: 'login2', component: Login2 }
] as Routes;
