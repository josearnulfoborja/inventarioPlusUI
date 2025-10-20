# Servicio HTTP Centralizado - ApiService

## 📋 Descripción

Este proyecto incluye un servicio centralizado (`ApiService`) para manejar todas las peticiones HTTP al backend. Proporciona una interfaz consistente para realizar operaciones CRUD con manejo de errores, autenticación automática y loading global.

## 🏗️ Estructura de Archivos

```
src/
├── environments/
│   ├── environment.ts              # Configuración de desarrollo
│   └── environment.prod.ts         # Configuración de producción
├── app/
│   └── core/
│       ├── models/
│       │   └── api.model.ts        # Interfaces y tipos para respuestas del API
│       ├── services/
│       │   ├── api.service.ts      # Servicio HTTP centralizado
│       │   ├── loading.service.ts  # Servicio para controlar estado de carga
│       │   └── cliente.service.example.ts  # Ejemplo de servicio específico
│       └── interceptors/
│           ├── auth.interceptor.ts    # Interceptor para agregar tokens
│           └── loading.interceptor.ts # Interceptor para loading global
```

## ⚙️ Configuración

### 1. Variables de Entorno

Edita `src/environments/environment.ts` con la URL de tu backend:

```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/api',  // ⚠️ CAMBIA ESTO
    apiTimeout: 30000
};
```

### 2. Interceptores Registrados

Los interceptores ya están configurados en `app.config.ts`:
- **authInterceptor**: Agrega automáticamente el token JWT a todas las peticiones
- **loadingInterceptor**: Muestra/oculta el indicador de carga global

## 🚀 Uso Básico

### Inyectar el Servicio

```typescript
import { ApiService } from '@/core/services/api.service';

export class MiComponente {
    constructor(private apiService: ApiService) {}
}
```

### Peticiones GET

```typescript
// GET simple
this.apiService.get<Usuario>('/usuarios/1').subscribe({
    next: (response) => {
        if (response.success) {
            console.log(response.data);
        }
    },
    error: (err) => console.error(err)
});

// GET con parámetros
this.apiService.get<Usuario[]>('/usuarios', {
    params: { activo: true, rol: 'admin' }
}).subscribe(...);

// GET paginado
this.apiService.getPaginated<Usuario>('/usuarios', 1, 10).subscribe({
    next: (response) => {
        console.log(response.data);         // Array de usuarios
        console.log(response.pagination);   // Info de paginación
    }
});
```

### Peticiones POST

```typescript
const nuevoUsuario = {
    nombre: 'Juan',
    email: 'juan@example.com'
};

this.apiService.post<Usuario>('/usuarios', nuevoUsuario).subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Usuario creado:', response.data);
        }
    },
    error: (err) => console.error(err.message)
});
```

### Peticiones PUT y PATCH

```typescript
// PUT - Actualización completa
this.apiService.put<Usuario>('/usuarios/1', usuarioActualizado).subscribe(...);

// PATCH - Actualización parcial
this.apiService.patch<Usuario>('/usuarios/1', { activo: false }).subscribe(...);
```

### Peticiones DELETE

```typescript
this.apiService.delete<void>('/usuarios/1').subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Usuario eliminado');
        }
    }
});
```

### Descarga de Archivos

```typescript
this.apiService.downloadFile('/reportes/ventas', 'reporte.pdf').subscribe({
    next: (blob) => console.log('Archivo descargado'),
    error: (err) => console.error(err)
});
```

### Upload de Archivos

```typescript
const file = event.target.files[0];

this.apiService.uploadFile<any>('/documentos', file, {
    categoria: 'facturas',
    año: 2025
}).subscribe({
    next: (response) => console.log('Archivo subido:', response.data)
});
```

## 🎯 Crear Servicios Específicos

### Ejemplo: ClienteService

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@/core/services/api.service';
import { ApiResponse } from '@/core/models/api.model';

export interface Cliente {
    id?: number;
    nombre: string;
    email: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
    private endpoint = '/clientes';

    constructor(private apiService: ApiService) {}

    getAll(): Observable<ApiResponse<Cliente[]>> {
        return this.apiService.get<Cliente[]>(this.endpoint);
    }

    getById(id: number): Observable<ApiResponse<Cliente>> {
        return this.apiService.get<Cliente>(\`\${this.endpoint}/\${id}\`);
    }

    create(cliente: Cliente): Observable<ApiResponse<Cliente>> {
        return this.apiService.post<Cliente>(this.endpoint, cliente);
    }

    update(id: number, cliente: Cliente): Observable<ApiResponse<Cliente>> {
        return this.apiService.put<Cliente>(\`\${this.endpoint}/\${id}\`, cliente);
    }

    delete(id: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<void>(\`\${this.endpoint}/\${id}\`);
    }
}
```

### Usar el Servicio en un Componente

```typescript
import { Component, OnInit } from '@angular/core';
import { ClienteService, Cliente } from '@/core/services/cliente.service';
import { ApiError } from '@/core/models/api.model';

@Component({
    selector: 'app-clientes',
    template: `
        <div *ngFor="let cliente of clientes">
            {{ cliente.nombre }} - {{ cliente.email }}
        </div>
    `
})
export class ClientesComponent implements OnInit {
    clientes: Cliente[] = [];

    constructor(private clienteService: ClienteService) {}

    ngOnInit(): void {
        this.clienteService.getAll().subscribe({
            next: (response) => {
                if (response.success) {
                    this.clientes = response.data;
                }
            },
            error: (err: ApiError) => {
                console.error('Error:', err.message);
            }
        });
    }
}
```

## 🔐 Autenticación

El interceptor de autenticación agrega automáticamente el token JWT a todas las peticiones.

### Guardar Token después del Login

```typescript
// En tu servicio de autenticación
login(credentials: LoginCredentials): Observable<ApiResponse<AuthResponse>> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
        tap(response => {
            if (response.success && response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
            }
        })
    );
}
```

### Logout

```typescript
logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/auth/login2']);
}
```

## 📊 Interfaces de Respuesta

### ApiResponse

```typescript
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
    };
    message?: string;
}
```

### ApiError

```typescript
interface ApiError {
    statusCode: number;
    message: string;
    errors?: string[];
    timestamp?: string;
}
```

## ⚠️ Manejo de Errores

El servicio maneja automáticamente los errores HTTP comunes:

| Código | Mensaje |
|--------|---------|
| 0      | No se pudo conectar con el servidor |
| 400    | Solicitud incorrecta |
| 401    | No autorizado (redirige al login) |
| 403    | Sin permisos |
| 404    | Recurso no encontrado |
| 500    | Error interno del servidor |
| 503    | Servicio no disponible |

Los errores se pueden capturar en el componente:

```typescript
this.apiService.get<Usuario>('/usuarios/999').subscribe({
    error: (err: ApiError) => {
        console.error('Código:', err.statusCode);
        console.error('Mensaje:', err.message);
        console.error('Errores:', err.errors);
    }
});
```

## 🎨 Loading Global

El `LoadingService` controla el estado de carga automáticamente:

```typescript
import { LoadingService } from '@/core/services/loading.service';

export class MiComponente {
    isLoading = this.loadingService.isLoading;

    constructor(private loadingService: LoadingService) {}
}
```

En el template:

```html
<div *ngIf="isLoading()">
    <p-progressSpinner />
</div>
```

## 🔧 Personalización

### Agregar Headers Personalizados

```typescript
this.apiService.get<Usuario>('/usuarios', {
    headers: {
        'X-Custom-Header': 'valor',
        'Accept-Language': 'es-ES'
    }
}).subscribe(...);
```

### Cambiar Timeout

Edita `environment.ts`:

```typescript
export const environment = {
    apiTimeout: 60000  // 60 segundos
};
```

## 📝 Ejemplo Completo

Ver archivo: `src/app/pages/clientes/clientes-example.component.ts`

Este archivo contiene un componente completo con:
- ✅ Listado paginado
- ✅ Crear, editar, eliminar
- ✅ Manejo de errores
- ✅ Loading states
- ✅ Exportar a Excel

## 🚦 Próximos Pasos

1. **Configura la URL del backend** en `environment.ts`
2. **Adapta las interfaces** en `api.model.ts` según tu API
3. **Crea servicios específicos** para cada módulo (usuarios, productos, etc.)
4. **Implementa autenticación** guardando el token después del login
5. **Personaliza el manejo de errores** según tus necesidades

## 💡 Tips

- ⚡ El servicio usa **signals** para el loading (Angular 17+)
- 🔄 Todas las peticiones tienen **timeout automático** (30s por defecto)
- 🔒 El token se agrega **automáticamente** vía interceptor
- 📦 Las respuestas están **tipadas** con TypeScript
- 🎯 Usa servicios específicos en lugar de llamar directamente al `ApiService`

## 🆘 Problemas Comunes

### CORS Error
```
❌ Access to XMLHttpRequest has been blocked by CORS policy
```
**Solución**: Configura CORS en tu backend para permitir requests desde `http://localhost:4200`

### 401 Unauthorized
```
❌ No autorizado. Por favor inicia sesión nuevamente.
```
**Solución**: Verifica que el token esté guardado en localStorage y sea válido

### Connection Refused
```
❌ No se pudo conectar con el servidor
```
**Solución**: Verifica que el backend esté corriendo y la URL en `environment.ts` sea correcta

---

**¿Preguntas?** Consulta el archivo de ejemplo o revisa los comentarios en el código.
