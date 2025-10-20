# Servicios del Sistema de Inventario Plus

## 📋 Índice

- [Descripción General](#descripción-general)
- [Servicios Disponibles](#servicios-disponibles)
- [Modelos de Datos](#modelos-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Integración en Componentes](#integración-en-componentes)

---

## 📖 Descripción General

Este documento describe todos los servicios creados para el sistema **InventarioPlus**. Cada servicio maneja un módulo específico del sistema y proporciona métodos para realizar operaciones CRUD completas.

### Arquitectura

```
ApiService (servicio base HTTP)
    ├── ClienteService
    ├── EquipoService
    ├── PrestamoService
    ├── EvaluacionService
    ├── UsuarioService
    └── ReporteService
```

---

## 🛠️ Servicios Disponibles

### 1. ClienteService

**Ubicación**: `src/app/core/services/cliente.service.ts`

Gestiona todas las operaciones relacionadas con clientes.

**Métodos principales:**
- `getClientes(page, pageSize, filtros)` - Listar clientes (paginado)
- `getClienteById(id)` - Obtener cliente por ID
- `buscarClientes(criterio)` - Buscar por texto
- `buscarPorDocumento(tipo, numero)` - Buscar por documento
- `crearCliente(cliente)` - Crear nuevo cliente
- `actualizarCliente(id, cliente)` - Actualizar cliente
- `actualizarParcial(id, datos)` - Actualización parcial
- `cambiarEstado(id, activo)` - Activar/desactivar
- `eliminarCliente(id)` - Eliminar cliente
- `getHistorialPrestamos(id)` - Historial de préstamos
- `exportarExcel(filtros)` - Exportar a Excel
- `exportarPDF(filtros)` - Exportar a PDF
- `importarExcel(file)` - Importar desde Excel

**Ejemplo de uso:**

```typescript
constructor(private clienteService: ClienteService) {}

cargarClientes() {
    this.clienteService.getClientes(1, 10).subscribe({
        next: (response) => {
            if (response.success) {
                this.clientes = response.data;
                this.totalPages = response.pagination.totalPages;
            }
        },
        error: (err) => console.error(err.message)
    });
}
```

---

### 2. EquipoService

**Ubicación**: `src/app/core/services/equipo.service.ts`

Gestiona el inventario de equipos.

**Métodos principales:**
- `getEquipos(page, pageSize, filtros)` - Listar equipos (paginado)
- `getEquipoById(id)` - Obtener equipo por ID
- `buscarEquipos(criterio)` - Buscar equipos
- `buscarPorCodigo(codigo)` - Buscar por código
- `getEquiposDisponibles()` - Equipos disponibles para préstamo
- `getPorCategoria(categoria)` - Filtrar por categoría
- `getCategorias()` - Obtener lista de categorías
- `crearEquipo(equipo)` - Crear nuevo equipo
- `actualizarEquipo(id, equipo)` - Actualizar equipo
- `cambiarEstado(id, estado)` - Cambiar estado (DISPONIBLE, PRESTADO, etc.)
- `cambiarActivo(id, activo)` - Activar/desactivar
- `eliminarEquipo(id)` - Eliminar equipo
- `getHistorialPrestamos(id)` - Historial de préstamos
- `getEvaluaciones(id)` - Evaluaciones del equipo
- `subirImagen(id, imagen)` - Subir foto del equipo
- `generarQR(id)` - Generar código QR
- `exportarExcel(filtros)` - Exportar a Excel
- `exportarPDF(filtros)` - Exportar a PDF

**Ejemplo de uso:**

```typescript
// Obtener equipos disponibles
this.equipoService.getEquiposDisponibles().subscribe({
    next: (response) => {
        if (response.success) {
            this.equiposDisponibles = response.data;
        }
    }
});

// Cambiar estado del equipo
this.equipoService.cambiarEstado(equipoId, 'MANTENIMIENTO').subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Estado actualizado');
        }
    }
});
```

---

### 3. PrestamoService

**Ubicación**: `src/app/core/services/prestamo.service.ts`

Gestiona los préstamos de equipos a clientes.

**Métodos principales:**
- `getPrestamos(page, pageSize, filtros)` - Listar préstamos (paginado)
- `getPrestamoById(id)` - Obtener préstamo por ID
- `getPrestamosActivos()` - Préstamos activos
- `getPrestamosVencidos()` - Préstamos vencidos
- `getPrestamosPorCliente(clienteId)` - Préstamos de un cliente
- `getPrestamosPorEquipo(equipoId)` - Préstamos de un equipo
- `verificarDisponibilidad(equipoId, fechaInicio, fechaFin)` - Verificar disponibilidad
- `crearPrestamo(prestamo)` - Crear nuevo préstamo
- `actualizarPrestamo(id, prestamo)` - Actualizar préstamo
- `registrarDevolucion(id, fecha, observaciones)` - Registrar devolución
- `renovarPrestamo(id, nuevaFecha)` - Renovar préstamo
- `cancelarPrestamo(id, motivo)` - Cancelar préstamo
- `eliminarPrestamo(id)` - Eliminar préstamo
- `generarContrato(id)` - Generar contrato PDF
- `generarRecibo(id)` - Generar recibo de devolución
- `exportarExcel(filtros)` - Exportar a Excel
- `exportarPDF(filtros)` - Exportar a PDF
- `getEstadisticas()` - Estadísticas de préstamos

**Ejemplo de uso:**

```typescript
// Verificar disponibilidad antes de crear préstamo
this.prestamoService.verificarDisponibilidad(
    equipoId,
    new Date('2025-01-01'),
    new Date('2025-01-15')
).subscribe({
    next: (response) => {
        if (response.data.disponible) {
            // Crear préstamo
            this.prestamoService.crearPrestamo(prestamo).subscribe(...);
        } else {
            alert(response.data.mensaje);
        }
    }
});

// Registrar devolución
this.prestamoService.registrarDevolucion(
    prestamoId,
    new Date(),
    'Equipo en buen estado'
).subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Devolución registrada');
        }
    }
});
```

---

### 4. EvaluacionService

**Ubicación**: `src/app/core/services/evaluacion.service.ts`

Gestiona las evaluaciones de equipos (salida, devolución, periódicas).

**Métodos principales:**
- `getEvaluaciones(page, pageSize, filtros)` - Listar evaluaciones (paginado)
- `getEvaluacionById(id)` - Obtener evaluación por ID
- `getEvaluacionesPorPrestamo(prestamoId)` - Evaluaciones de un préstamo
- `getEvaluacionesPorEquipo(equipoId)` - Evaluaciones de un equipo
- `getEvaluacionesPendientes()` - Evaluaciones pendientes
- `getRequierenMantenimiento()` - Evaluaciones que requieren mantenimiento
- `crearEvaluacion(evaluacion)` - Crear nueva evaluación
- `crearEvaluacionSalida(prestamoId, evaluacion)` - Evaluar al prestar
- `crearEvaluacionDevolucion(prestamoId, evaluacion)` - Evaluar al devolver
- `actualizarEvaluacion(id, evaluacion)` - Actualizar evaluación
- `eliminarEvaluacion(id)` - Eliminar evaluación
- `subirImagenes(id, imagenes)` - Subir fotos de la evaluación
- `generarReporte(id)` - Generar reporte PDF
- `compararEvaluaciones(prestamoId)` - Comparar salida vs devolución
- `exportarExcel(filtros)` - Exportar a Excel
- `exportarPDF(filtros)` - Exportar a PDF
- `getEstadisticas()` - Estadísticas de evaluaciones

**Ejemplo de uso:**

```typescript
// Crear evaluación al momento de prestar
this.evaluacionService.crearEvaluacionSalida(prestamoId, {
    estadoGeneral: 'EXCELENTE',
    estadoFisico: 'Sin rayones ni daños visibles',
    estadoFuncional: 'Funciona correctamente',
    observaciones: 'Equipo en perfectas condiciones',
    requiereMantenimiento: false
}).subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Evaluación de salida registrada');
        }
    }
});

// Comparar evaluaciones
this.evaluacionService.compararEvaluaciones(prestamoId).subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Diferencias:', response.data.diferencias);
        }
    }
});
```

---

### 5. UsuarioService

**Ubicación**: `src/app/core/services/usuario.service.ts`

Gestiona usuarios del sistema y sus permisos.

**Métodos principales:**
- `getUsuarios(page, pageSize, activo)` - Listar usuarios (paginado)
- `getUsuarioById(id)` - Obtener usuario por ID
- `getPerfil()` - Obtener perfil del usuario actual
- `buscarUsuarios(criterio)` - Buscar usuarios
- `verificarUsername(username)` - Verificar disponibilidad de username
- `verificarEmail(email)` - Verificar disponibilidad de email
- `getUsuariosPorRol(rol)` - Filtrar por rol
- `crearUsuario(usuario)` - Crear nuevo usuario
- `actualizarUsuario(id, usuario)` - Actualizar usuario
- `actualizarPerfil(usuario)` - Actualizar perfil actual
- `cambiarPassword(id, actual, nueva)` - Cambiar contraseña
- `resetearPassword(id, nueva)` - Resetear contraseña (admin)
- `cambiarEstado(id, activo)` - Activar/desactivar
- `cambiarRol(id, rol)` - Cambiar rol del usuario
- `eliminarUsuario(id)` - Eliminar usuario
- `getHistorialActividades(id)` - Historial de actividades
- `exportarExcel()` - Exportar a Excel
- `exportarPDF()` - Exportar a PDF
- `getEstadisticas()` - Estadísticas de usuarios

**Ejemplo de uso:**

```typescript
// Crear nuevo usuario
const nuevoUsuario: Usuario = {
    username: 'jperez',
    email: 'juan.perez@example.com',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'OPERADOR',
    activo: true,
    password: 'Password123!'
};

this.usuarioService.crearUsuario(nuevoUsuario).subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Usuario creado:', response.data);
        }
    }
});

// Cambiar rol
this.usuarioService.cambiarRol(userId, 'ADMIN').subscribe({
    next: (response) => {
        if (response.success) {
            console.log('Rol actualizado');
        }
    }
});
```

---

### 6. ReporteService

**Ubicación**: `src/app/core/services/reporte.service.ts`

Genera y gestiona reportes del sistema.

**Métodos principales:**
- `getReportes(page, pageSize)` - Historial de reportes generados
- `getReporteById(id)` - Obtener reporte por ID
- `getDashboardStats()` - Estadísticas del dashboard
- `generarReportePrestamos(fechaInicio, fechaFin, formato)` - Reporte de préstamos
- `generarReporteEquipos(categoria, estado, formato)` - Reporte de equipos
- `generarReporteClientes(activo, formato)` - Reporte de clientes
- `generarReporteEvaluaciones(fechaInicio, fechaFin, formato)` - Reporte de evaluaciones
- `generarReporteGeneral(fechaInicio, fechaFin, formato)` - Reporte general
- `generarReporteEquiposPorEstado(formato)` - Equipos por estado
- `generarReportePrestamosVencidos(formato)` - Préstamos vencidos
- `generarReporteMantenimiento(formato)` - Equipos que requieren mantenimiento
- `generarReporteActividadUsuario(usuarioId, fechaInicio, fechaFin, formato)` - Actividad del usuario
- `generarReportePersonalizado(parametros)` - Reporte personalizado
- `programarReporte(config)` - Programar reporte automático
- `getReportesProgramados()` - Obtener reportes programados
- `cancelarReporteProgramado(id)` - Cancelar reporte programado
- `descargarReporte(id)` - Descargar reporte previamente generado
- `getGraficosDashboard(periodo)` - Obtener datos para gráficos

**Ejemplo de uso:**

```typescript
// Obtener estadísticas del dashboard
this.reporteService.getDashboardStats().subscribe({
    next: (response) => {
        if (response.success) {
            this.stats = response.data;
            console.log('Total clientes:', this.stats.totalClientes);
            console.log('Préstamos activos:', this.stats.prestamosActivos);
        }
    }
});

// Generar reporte de préstamos
this.reporteService.generarReportePrestamos(
    new Date('2025-01-01'),
    new Date('2025-12-31'),
    'PDF'
).subscribe({
    next: (blob) => console.log('Reporte descargado'),
    error: (err) => console.error(err.message)
});

// Obtener datos para gráficos
this.reporteService.getGraficosDashboard(30).subscribe({
    next: (response) => {
        if (response.success) {
            this.graficos = response.data;
            // Usar datos en Chart.js, ApexCharts, etc.
        }
    }
});
```

---

## 📊 Modelos de Datos

**Ubicación**: `src/app/core/models/inventario.model.ts`

### Principales Interfaces

```typescript
// Cliente
interface Cliente {
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    tipoDocumento: 'DNI' | 'RUC' | 'PASAPORTE' | 'OTRO';
    numeroDocumento: string;
    activo: boolean;
}

// Equipo
interface Equipo {
    id?: number;
    codigo: string;
    nombre: string;
    marca: string;
    modelo: string;
    categoria: string;
    estado: 'DISPONIBLE' | 'PRESTADO' | 'MANTENIMIENTO' | 'BAJA';
    valorEstimado?: number;
    activo: boolean;
}

// Préstamo
interface Prestamo {
    id?: number;
    clienteId: number;
    equipoId: number;
    fechaPrestamo: Date;
    fechaDevolucionEstimada: Date;
    fechaDevolucionReal?: Date;
    estado: 'ACTIVO' | 'DEVUELTO' | 'VENCIDO' | 'CANCELADO';
}

// Evaluación
interface Evaluacion {
    id?: number;
    prestamoId: number;
    equipoId: number;
    tipoEvaluacion: 'SALIDA' | 'DEVOLUCION' | 'PERIODICA';
    fechaEvaluacion: Date;
    estadoGeneral: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'MALO';
    requiereMantenimiento: boolean;
}

// Usuario
interface Usuario {
    id?: number;
    username: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';
    activo: boolean;
}

// Dashboard Stats
interface DashboardStats {
    totalClientes: number;
    totalEquipos: number;
    prestamosActivos: number;
    prestamosVencidos: number;
    equiposDisponibles: number;
}
```

---

## 💡 Ejemplos de Uso en Componentes

### Componente de Lista de Clientes

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '@/core/services';
import { Cliente } from '@/core/models';
import { ApiError } from '@/core/models';

@Component({
    selector: 'app-clientes-lista',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div *ngIf="isLoading">Cargando...</div>
        <div *ngIf="error" class="alert">{{ error }}</div>
        <table *ngIf="!isLoading">
            <tr *ngFor="let cliente of clientes">
                <td>{{ cliente.nombre }} {{ cliente.apellido }}</td>
                <td>{{ cliente.email }}</td>
                <td>
                    <button (click)="editar(cliente)">Editar</button>
                    <button (click)="eliminar(cliente.id!)">Eliminar</button>
                </td>
            </tr>
        </table>
    `
})
export class ClientesListaComponent implements OnInit {
    clientes: Cliente[] = [];
    isLoading = false;
    error: string | null = null;

    constructor(private clienteService: ClienteService) {}

    ngOnInit() {
        this.cargarClientes();
    }

    cargarClientes() {
        this.isLoading = true;
        this.error = null;

        this.clienteService.getClientes(1, 10).subscribe({
            next: (response) => {
                if (response.success) {
                    this.clientes = response.data;
                }
                this.isLoading = false;
            },
            error: (err: ApiError) => {
                this.error = err.message;
                this.isLoading = false;
            }
        });
    }

    editar(cliente: Cliente) {
        // Navegar a formulario de edición
    }

    eliminar(id: number) {
        if (confirm('¿Eliminar cliente?')) {
            this.clienteService.eliminarCliente(id).subscribe({
                next: () => this.cargarClientes(),
                error: (err) => alert(err.message)
            });
        }
    }
}
```

### Componente de Dashboard

```typescript
import { Component, OnInit } from '@angular/core';
import { ReporteService } from '@/core/services';
import { DashboardStats } from '@/core/models';

@Component({
    selector: 'app-dashboard',
    template: `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Clientes</h3>
                <p>{{ stats.totalClientes }}</p>
            </div>
            <div class="stat-card">
                <h3>Préstamos Activos</h3>
                <p>{{ stats.prestamosActivos }}</p>
            </div>
            <div class="stat-card">
                <h3>Equipos Disponibles</h3>
                <p>{{ stats.equiposDisponibles }}</p>
            </div>
        </div>
    `
})
export class DashboardComponent implements OnInit {
    stats!: DashboardStats;

    constructor(private reporteService: ReporteService) {}

    ngOnInit() {
        this.reporteService.getDashboardStats().subscribe({
            next: (response) => {
                if (response.success) {
                    this.stats = response.data;
                }
            }
        });
    }
}
```

---

## ✅ Checklist de Implementación

- [x] ApiService centralizado creado
- [x] Modelos de datos definidos
- [x] ClienteService implementado
- [x] EquipoService implementado
- [x] PrestamoService implementado
- [x] EvaluacionService implementado
- [x] UsuarioService implementado
- [x] ReporteService implementado
- [x] Interceptores configurados
- [x] Documentación completa

---

## 🚀 Próximos Pasos

1. **Configurar URL del backend** en `src/environments/environment.ts`
2. **Implementar componentes** usando estos servicios
3. **Agregar validaciones** en formularios
4. **Implementar manejo de errores** visual (toasts, alerts)
5. **Agregar loading indicators** en la UI

---

**¿Preguntas o dudas?** Consulta la documentación completa en `SERVICIO-HTTP.md`
