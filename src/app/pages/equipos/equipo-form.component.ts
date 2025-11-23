import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Equipo, Mcodigo, Marca, TipoEquipo, Modelo, Ubicacion } from '@/core/models/inventario.model';
import { McodigosService } from '@/core/services/mcodigos.service';
import { MarcaService } from '@/core/services/marca.service';
import { TipoEquipoService } from '@/core/services/tipo-equipo.service';
import { ModeloService } from '@/core/services/modelo.service';
import { UbicacionService } from '@/core/services/ubicacion.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-equipo-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">Nombre</label>
          <input formControlName="nombre" class="input w-full bg-gray-100" readonly />
        </div>
        <div>
          <label class="block text-sm font-medium">Marca</label>
          <select formControlName="marcaId" class="input w-full">
            <option [ngValue]="null">Seleccione una marca...</option>
            <option *ngFor="let m of marcas" [ngValue]="m.id">{{ m.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Tipo/Categoría</label>
          <select formControlName="categoriaId" class="input w-full">
            <option [ngValue]="null">Seleccione un tipo...</option>
            <option *ngFor="let t of tipos" [ngValue]="t.id">{{ getNombre(t) }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Modelo</label>
          <select formControlName="modeloId" class="input w-full">
            <option [ngValue]="null">Seleccione un modelo...</option>
            <option *ngFor="let m of modelos" [ngValue]="m.id">{{ m.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Número de serie</label>
          <input formControlName="numeroSerie" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium">Estado</label>
          <select formControlName="estadoId" class="input w-full">
            <option [ngValue]="null">Seleccione...</option>
            <option *ngFor="let e of estadosEquipo" [ngValue]="e.id">{{ e.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Ubicación</label>
          <select formControlName="ubicacionId" class="input w-full">
            <option [ngValue]="null">Seleccione una ubicación...</option>
            <option *ngFor="let u of ubicaciones" [ngValue]="u.id">{{ u.nombre }}</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="inline-flex items-center">
            <input type="checkbox" formControlName="requiere_inspeccion" class="mr-2" />
            <span>Requiere inspección</span>
          </label>
        </div>
        <div class="col-span-2">
          <label class="inline-flex items-center">
            <input type="checkbox" formControlName="activo" class="mr-2" />
            <span>Activo</span>
          </label>
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn" (click)="onCancelar()">Cancelar</button>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar</button>
      </div>
    </form>
    `
})
export class EquipoFormComponent implements OnInit {
    @Input() equipo?: Equipo;
    @Output() guardar = new EventEmitter<{ equipo: Equipo }>();
    @Output() cancelar = new EventEmitter<void>();

  // form will be created in ngOnInit because FormBuilder is injected
  form: any;
  estadosEquipo: Mcodigo[] = [];
  estadoCodigoById: Record<number, string> = {};
  marcas: Marca[] = [];
  tipos: TipoEquipo[] = [];
  modelos: Modelo[] = [];
  ubicaciones: Ubicacion[] = [];

  constructor(
    private readonly fb: FormBuilder, 
    private readonly mcodigosService: McodigosService,
    private readonly marcaService: MarcaService,
    private readonly tipoService: TipoEquipoService,
    private readonly modeloService: ModeloService,
    private readonly ubicacionService: UbicacionService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required]],
      marcaId: [null, [Validators.required]],
      categoriaId: [null, [Validators.required]],
      modeloId: [null],
      numeroSerie: [''],
      estadoId: [null, [Validators.required]],
      ubicacionId: [null],
      requiere_inspeccion: [false],
      activo: [true, [Validators.required]]
    });

    // Suscribirse a cambios en marca, tipo y modelo para generar el nombre automáticamente
    this.form.get('categoriaId')?.valueChanges.subscribe(() => this.generarNombre());
    this.form.get('marcaId')?.valueChanges.subscribe(() => this.generarNombre());
    this.form.get('modeloId')?.valueChanges.subscribe(() => this.generarNombre());

    // Cargar todos los datos necesarios en paralelo
    forkJoin({
      estados: this.mcodigosService.listar('EQUIPO'),
      marcas: this.marcaService.listar(),
      tipos: this.tipoService.listar(),
      modelos: this.modeloService.listar(),
      ubicaciones: this.ubicacionService.listar()
    }).subscribe({
      next: (result) => {
        console.log('Estados recibidos del backend:', result.estados);
        console.log('Estados detallados:', JSON.stringify(result.estados, null, 2));
        
        // El servicio ya filtra por grupo 'EQUIPO', usar directamente
        this.estadosEquipo = result.estados || [];
        this.marcas = result.marcas || [];
        this.tipos = result.tipos || [];
        this.modelos = result.modelos || [];
        this.ubicaciones = result.ubicaciones || [];
        
        console.log('Estados de EQUIPO cargados:', this.estadosEquipo);
        console.log('Primer estado:', this.estadosEquipo[0]);

        this.estadoCodigoById = {};
        (this.estadosEquipo || []).forEach(e => { 
          if (e.id != null) this.estadoCodigoById[Number(e.id)] = e.codigo; 
        });

        // Si hay equipo cargado, mapear los valores
        if (this.equipo) {
          const equipoData: any = this.equipo;
          
          // Mapear marca
          let marcaId = this.extractId(equipoData.marca) || equipoData.marcaId || equipoData.marca_id;
          
          // Mapear tipo/categoría
          let categoriaId = this.extractId(equipoData.categoria) || this.extractId(equipoData.tipo) || 
                           equipoData.categoriaId || equipoData.categoria_id || equipoData.tipoId || equipoData.tipo_id;
          
          // Mapear modelo
          let modeloId = this.extractId(equipoData.modelo) || equipoData.modeloId || equipoData.modelo_id;
          
          // Mapear ubicación
          let ubicacionId = this.extractId(equipoData.ubicacion) || equipoData.ubicacionId || equipoData.ubicacion_id;
          
          // Mapear estado
          let estadoId = equipoData.estadoId;
          if (!estadoId && equipoData.estado) {
            const code = String(equipoData.estado).toUpperCase();
            const found = this.estadosEquipo.find(e => e.codigo === code);
            if (found?.id != null) estadoId = Number(found.id);
          }

          this.form.patchValue({
            id: this.equipo.id,
            nombre: this.equipo.nombre,
            marcaId: marcaId,
            categoriaId: categoriaId,
            modeloId: modeloId,
            numeroSerie: this.equipo.numeroSerie || '',
            estadoId: estadoId,
            ubicacionId: ubicacionId,
            requiere_inspeccion: !!equipoData.requiere_inspeccion,
            activo: equipoData.activo !== undefined ? equipoData.activo : true
          });

          // Generar nombre después de cargar los datos
          this.generarNombre();
        }
      },
      error: (err) => {
        console.error('Error cargando datos del formulario:', err);
      }
    });
  }

  // Método auxiliar para extraer ID de objetos o valores simples
  private extractId(value: any): number | null {
    if (!value) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = Number(value);
      return !isNaN(num) ? num : null;
    }
    if (typeof value === 'object' && value.id != null) {
      return Number(value.id);
    }
    return null;
  }

  // Método auxiliar para obtener nombre de objetos tipo/categoria
  getNombre(item: any): string {
    return item?.nombre || item?.name || item?.nombreTipo || item?.tipo || '-';
  }

  // Generar nombre automáticamente basado en Tipo + Marca + Modelo
  private generarNombre(): void {
    const categoriaId = this.form.get('categoriaId')?.value;
    const marcaId = this.form.get('marcaId')?.value;
    const modeloId = this.form.get('modeloId')?.value;

    const partes: string[] = [];

    // Obtener nombre del tipo/categoría
    if (categoriaId) {
      const tipo = this.tipos.find(t => t.id === categoriaId);
      if (tipo) {
        partes.push(this.getNombre(tipo));
      }
    }

    // Obtener nombre de la marca
    if (marcaId) {
      const marca = this.marcas.find(m => m.id === marcaId);
      if (marca?.nombre) {
        partes.push(marca.nombre);
      }
    }

    // Obtener nombre del modelo
    if (modeloId) {
      const modelo = this.modelos.find(m => m.id === modeloId);
      if (modelo?.nombre) {
        partes.push(modelo.nombre);
      }
    }

    // Generar el nombre concatenado
    const nombreGenerado = partes.join(' ');
    this.form.get('nombre')?.setValue(nombreGenerado, { emitEvent: false });
  }

  submit() {
    if (this.form.invalid) return;
    const value = this.form.value;
    
    console.log('Form value:', value);
    console.log('Estados disponibles:', this.estadosEquipo);
    console.log('Estado ID seleccionado en form:', value.estadoId, 'tipo:', typeof value.estadoId);
    
    const selectedEstadoId = value.estadoId != null ? Number(value.estadoId) : null;
    console.log('Estado ID parseado a número:', selectedEstadoId);
    
    // Buscar el código del estado
    let estadoCodigo = 'DISPONIBLE';
    if (selectedEstadoId != null) {
      console.log('Buscando estado con id:', selectedEstadoId, 'en array:', this.estadosEquipo.map(e => ({id: e.id, codigo: e.codigo, grupo: e.grupo})));
      const estadoObj = this.estadosEquipo.find((e: Mcodigo) => e.id === selectedEstadoId);
      console.log('Estado encontrado:', estadoObj);
      if (estadoObj) {
        console.log('Tipo de codigo encontrado:', typeof estadoObj.codigo, 'valor:', estadoObj.codigo);
        estadoCodigo = String(estadoObj.codigo); // Forzar a string
      }
    }
    
    console.log('Código de estado a usar (final):', estadoCodigo, 'tipo:', typeof estadoCodigo);
    
    // Construir el payload con AMBOS formatos (camelCase Y snake_case) para máxima compatibilidad
    const now = new Date();
    const fechaISO = now.toISOString(); // Formato completo ISO: "2025-11-23T12:34:56.789Z"
    
    const payload: any = {
      // Campos básicos en ambos formatos
      nombre: value.nombre,
      numeroSerie: value.numeroSerie || null,
      numero_serie: value.numeroSerie || null,
      estado: estadoCodigo,
      estadoId: selectedEstadoId,
      estado_id: selectedEstadoId,
      requiereInspeccion: value.requiere_inspeccion ? 1 : 0,
      requiere_inspeccion: value.requiere_inspeccion ? 1 : 0,
      requiereEspecialista: 0, // Por defecto no requiere especialista
      requiere_especialista: 0,
      activo: value.activo ? 1 : 0,
      // Ambas fechas con formato LocalDateTime completo
      fechaCreacion: fechaISO,
      fecha_creacion: fechaISO,
      fechaActualizacion: fechaISO,
      fecha_actualizacion: fechaISO
    };

    // Solo agregar ID si es edición
    if (value.id) {
      payload.id = Number(value.id);
    }

    // Agregar los IDs de las relaciones directamente en los campos que el backend espera
    if (value.marcaId != null) {
      payload.marca_id = Number(value.marcaId);
    }
    
    if (value.categoriaId != null) {
      payload.categoria_id = Number(value.categoriaId);
    }
    
    if (value.modeloId != null) {
      payload.modelo_id = Number(value.modeloId);
    }
    
    if (value.ubicacionId != null) {
      payload.ubicacion_id = Number(value.ubicacionId);
    }
    
    if (value.tipoId != null) {
      payload.tipo_id = Number(value.tipoId);
    }
    
    // Estado ID
    if (selectedEstadoId) {
      payload.estado_id = selectedEstadoId;
    }

    console.log('Payload a enviar:', payload);
    this.guardar.emit({ equipo: payload });
  }

    onCancelar() {
        this.cancelar.emit();
    }
}
