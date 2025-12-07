# Backend Fix Required - Equipos Relations

## Problem
When creating or updating `Equipo` entities, the relations (`modelo`, `tipo`, `marca`, `ubicacion`, `estadoEquipo`) are not being persisted even though the frontend sends the correct IDs (`modelo_id`, `tipo_id`, `marca_id`, `ubicacion_id`, `estado_id`).

The model has `@Transient` fields with `@JsonProperty` annotations that receive the IDs from JSON, but JPA doesn't automatically map these to the `@ManyToOne` entity relations.

## Root Cause
In `Equipo.java`:
- Fields like `modeloId`, `tipoId`, `marcaId`, `ubicacionId`, `estadoId` are marked `@Transient` and `@JsonIgnore` on getters
- Jackson populates these transient fields when deserializing JSON
- But JPA only persists the actual `@ManyToOne` fields (`modelo`, `tipo`, `marca`, `ubicacion`, `estadoEquipo`)
- If the controller/service doesn't map the IDs to entities before calling `save()`, the relations remain null

## Solution
Add mapping logic in your `EquipoService` or `EquipoController` BEFORE saving the entity.

### Example Code (EquipoService.java)

```java
package com.example.InventarioPlus.service;

import com.example.InventarioPlus.model.*;
import com.example.InventarioPlus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EquipoService {

    @Autowired
    private EquipoRepository equipoRepository;
    
    @Autowired
    private ModeloRepository modeloRepository;
    
    @Autowired
    private TipoEquipoRepository tipoEquipoRepository;
    
    @Autowired
    private MarcaRepository marcaRepository;
    
    @Autowired
    private UbicacionRepository ubicacionRepository;
    
    @Autowired
    private EstadosEquipoRepository estadosEquipoRepository;

    /**
     * Create a new Equipo
     */
    @Transactional
    public Equipo crearEquipo(Equipo incoming) {
        // Set creation/update timestamps
        incoming.setFechaCreacion(LocalDateTime.now());
        incoming.setFechaActualizacion(LocalDateTime.now());
        
        // Map transient IDs to entity relations
        resolveRelations(incoming);
        
        return equipoRepository.save(incoming);
    }

    /**
     * Update an existing Equipo
     */
    @Transactional
    public Equipo actualizarEquipo(Long id, Equipo incoming) {
        Equipo existing = equipoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipo not found with id: " + id));
        
        // Update scalar fields
        existing.setNombre(incoming.getNombre());
        existing.setCodigo(incoming.getCodigo());
        existing.setDescripcion(incoming.getDescripcion());
        existing.setNumeroSerie(incoming.getNumeroSerie());
        existing.setNumeroSerial(incoming.getNumeroSerial());
        existing.setActivo(incoming.getActivo());
        existing.setRequiereInspeccion(incoming.getRequiereInspeccion());
        existing.setRequiereEspecialista(incoming.getRequiereEspecialista());
        existing.setFechaAdquisicion(incoming.getFechaAdquisicion());
        existing.setValorEstimado(incoming.getValorEstimado());
        existing.setCostoCreacion(incoming.getCostoCreacion());
        existing.setCostoDia(incoming.getCostoDia());
        existing.setImagenUrl(incoming.getImagenUrl());
        
        // Update timestamp
        existing.setFechaActualizacion(LocalDateTime.now());
        
        // Map transient IDs from incoming to entity relations on existing
        resolveRelations(incoming);
        existing.setModelo(incoming.getModelo());
        existing.setTipo(incoming.getTipo());
        existing.setMarca(incoming.getMarca());
        existing.setUbicacion(incoming.getUbicacion());
        existing.setEstadoEquipo(incoming.getEstadoEquipo());
        
        return equipoRepository.save(existing);
    }

    /**
     * Map transient ID fields to actual entity relations
     */
    private void resolveRelations(Equipo equipo) {
        // Modelo
        if (equipo.getModeloId() != null) {
            modeloRepository.findById(equipo.getModeloId())
                .ifPresent(equipo::setModelo);
        }
        
        // Tipo
        if (equipo.getTipoId() != null) {
            tipoEquipoRepository.findById(equipo.getTipoId())
                .ifPresent(equipo::setTipo);
        }
        
        // Marca
        if (equipo.getMarcaId() != null) {
            marcaRepository.findById(equipo.getMarcaId())
                .ifPresent(equipo::setMarca);
        }
        
        // Ubicacion
        if (equipo.getUbicacionId() != null) {
            ubicacionRepository.findById(equipo.getUbicacionId())
                .ifPresent(equipo::setUbicacion);
        }
        
        // EstadoEquipo
        if (equipo.getEstadoId() != null) {
            estadosEquipoRepository.findById(equipo.getEstadoId())
                .ifPresent(equipo::setEstadoEquipo);
        }
    }
}
```

### Alternative: Use EntityManager.getReference() (more efficient)

If you want to avoid loading the entire related entity (lazy proxy):

```java
@Autowired
private EntityManager entityManager;

private void resolveRelations(Equipo equipo) {
    if (equipo.getModeloId() != null) {
        equipo.setModelo(entityManager.getReference(Modelo.class, equipo.getModeloId()));
    }
    
    if (equipo.getTipoId() != null) {
        equipo.setTipo(entityManager.getReference(TipoEquipo.class, equipo.getTipoId()));
    }
    
    if (equipo.getMarcaId() != null) {
        equipo.setMarca(entityManager.getReference(Marca.class, equipo.getMarcaId()));
    }
    
    if (equipo.getUbicacionId() != null) {
        equipo.setUbicacion(entityManager.getReference(Ubicacion.class, equipo.getUbicacionId()));
    }
    
    if (equipo.getEstadoId() != null) {
        equipo.setEstadoEquipo(entityManager.getReference(EstadosEquipo.class, equipo.getEstadoId()));
    }
}
```

## Controller Example

If you prefer to do this in the controller:

```java
@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    @Autowired
    private EquipoService equipoService;

    @PostMapping
    public ResponseEntity<Equipo> crearEquipo(@RequestBody Equipo equipo) {
        Equipo saved = equipoService.crearEquipo(equipo);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipo> actualizarEquipo(
            @PathVariable Long id,
            @RequestBody Equipo equipo) {
        Equipo updated = equipoService.actualizarEquipo(id, equipo);
        return ResponseEntity.ok(updated);
    }
}
```

## Expected Behavior After Fix

When the frontend sends:
```json
{
  "nombre": "Impresora Acer IdeaPad 3",
  "codigo": "EQ-IMP-123",
  "marca_id": 5,
  "modelo_id": 12,
  "tipo_id": 3,
  "ubicacion_id": 2,
  "estado_id": 1,
  "activo": true,
  "requiere_inspeccion": false
}
```

The backend should save and return:
```json
{
  "id": 24,
  "nombre": "Impresora Acer IdeaPad 3",
  "codigo": "EQ-IMP-123",
  "activo": true,
  "requiereInspeccion": false,
  "modelo": {
    "id": 12,
    "nombre": "IdeaPad 3",
    ...
  },
  "tipo": {
    "id": 3,
    "nombre": "Impresora",
    ...
  },
  "marca": {
    "id": 5,
    "nombre": "Acer",
    ...
  },
  "ubicacion": {
    "id": 2,
    "nombre": "Taller 2",
    ...
  },
  "estadoEquipo": {
    "id": 1,
    "codigo": "DISPONIBLE",
    ...
  }
}
```

## Additional Notes

1. **Validation**: Consider adding validation to ensure that the referenced IDs actually exist before attempting to set them.

2. **Error Handling**: Return meaningful error messages if an ID is invalid:
```java
if (equipo.getModeloId() != null) {
    Modelo modelo = modeloRepository.findById(equipo.getModeloId())
        .orElseThrow(() -> new RuntimeException("Modelo not found: " + equipo.getModeloId()));
    equipo.setModelo(modelo);
}
```

3. **DTO Pattern (Best Practice)**: Consider using a separate DTO class for incoming requests instead of using the entity directly:
```java
public class EquipoDTO {
    private String nombre;
    private String codigo;
    private Long modeloId;
    private Long tipoId;
    // ... other fields
}
```

Then convert DTO → Entity in the service layer. This keeps the API contract clean and separate from the JPA entity model.

## Testing

After applying these changes:

1. Create a new equipo via POST `/api/equipos` with the IDs
2. Verify the response includes populated relations (not null)
3. Check the database to confirm foreign keys are set
4. Update an equipo via PUT `/api/equipos/{id}` and verify relations update correctly

---
**Frontend changes have been applied** to send all required fields including:
- `codigo`
- `descripcion`
- `fecha_adquisicion`
- `valor_estimado`
- `costo_creacion`
- `costo_dia`

The backend must now implement the relation mapping as described above.
