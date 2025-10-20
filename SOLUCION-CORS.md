# 🔧 Solución al Error de CORS

## ❌ Error Actual
```
Access to fetch at 'http://localhost:8080/api/roles' from origin 'http://localhost:4200' 
has been blocked by CORS policy: Response to preflight request doesn't pass access 
control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solución

Este error ocurre porque tu **backend Spring Boot** no está configurado para aceptar peticiones desde tu **frontend Angular**.

---

## 📝 Paso 1: Configurar CORS en Spring Boot

### Opción A: Configuración Global (Recomendada)

1. **Crea el archivo** `CorsConfig.java` en tu proyecto Spring Boot:
   ```
   src/main/java/com/tuapp/config/CorsConfig.java
   ```

2. **Copia este código**:

```java
package com.tuapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

3. **Reinicia tu aplicación Spring Boot**

---

### Opción B: Anotación en el Controller (Más Rápida)

Agrega `@CrossOrigin` en tu `RolController`:

```java
package com.tuapp.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://localhost:4200")  // ← AGREGAR ESTA LÍNEA
public class RolController {

    @Autowired
    private RolService rolService;

    @GetMapping
    public List<Rol> listarRoles() {
        return rolService.listarRoles();
    }

    @GetMapping("/{id}")
    public Optional<Rol> obtenerRol(@PathVariable Integer id) {
        return rolService.obtenerRolPorId(id);
    }

    @PostMapping
    public Rol crearRol(@RequestBody Rol rol) {
        return rolService.guardarRol(rol);
    }

    @PutMapping("/{id}")
    public Rol actualizarRol(@PathVariable Integer id, @RequestBody Rol rol) {
        return rolService.obtenerRolPorId(id).map(r -> {
            r.setNombreRol(rol.getNombreRol());
            r.setDescripcion(rol.getDescripcion());
            return rolService.guardarRol(r);
        }).orElseThrow(() -> new RuntimeException("Rol no encontrado con id " + id));
    }

    @DeleteMapping("/{id}")
    public String eliminarRol(@PathVariable Integer id) {
        rolService.eliminarRol(id);
        return "Rol eliminado con éxito.";
    }
}
```

---

## 📝 Paso 2: Verificar que el Backend esté Corriendo

1. **Verifica que Spring Boot esté corriendo en puerto 8080**
2. **Prueba la API con curl o Postman**:
   ```bash
   curl http://localhost:8080/api/roles
   ```

3. Deberías ver una respuesta JSON con la lista de roles

---

## 📝 Paso 3: Actualizar el Wrapper de ApiResponse (IMPORTANTE)

Tu backend devuelve directamente el objeto, pero el frontend espera un wrapper con `success` y `data`.

### ⚠️ Problema Actual:

**Backend devuelve:**
```json
[
  { "id": 1, "nombreRol": "ADMIN", "descripcion": "..." },
  { "id": 2, "nombreRol": "USER", "descripcion": "..." }
]
```

**Frontend espera:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "nombreRol": "ADMIN", "descripcion": "..." },
    { "id": 2, "nombreRol": "USER", "descripcion": "..." }
  ]
}
```

### ✅ Solución:

#### Opción 1: Cambiar el Backend (Recomendada para API profesional)

Crea una clase `ApiResponse` en Spring Boot:

```java
package com.tuapp.dto;

public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    
    public ApiResponse(boolean success, T data) {
        this.success = success;
        this.data = data;
    }
    
    public ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }
    
    // Getters y Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
```

Actualiza tu `RolController`:

```java
@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://localhost:4200")
public class RolController {

    @Autowired
    private RolService rolService;

    @GetMapping
    public ApiResponse<List<Rol>> listarRoles() {
        return new ApiResponse<>(true, rolService.listarRoles());
    }

    @GetMapping("/{id}")
    public ApiResponse<Rol> obtenerRol(@PathVariable Integer id) {
        return rolService.obtenerRolPorId(id)
            .map(rol -> new ApiResponse<>(true, rol))
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
    }

    @PostMapping
    public ApiResponse<Rol> crearRol(@RequestBody Rol rol) {
        return new ApiResponse<>(true, rolService.guardarRol(rol));
    }

    @PutMapping("/{id}")
    public ApiResponse<Rol> actualizarRol(@PathVariable Integer id, @RequestBody Rol rol) {
        return rolService.obtenerRolPorId(id).map(r -> {
            r.setNombreRol(rol.getNombreRol());
            r.setDescripcion(rol.getDescripcion());
            return new ApiResponse<>(true, rolService.guardarRol(r));
        }).orElseThrow(() -> new RuntimeException("Rol no encontrado con id " + id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> eliminarRol(@PathVariable Integer id) {
        rolService.eliminarRol(id);
        return new ApiResponse<>(true, "Rol eliminado con éxito.");
    }
}
```

#### Opción 2: Cambiar el Frontend (Más rápido para probar)

Actualiza `rol.service.ts` para trabajar directamente con los datos sin wrapper:

```typescript
listarRoles(): Observable<Rol[]> {
    return this.apiService.get<Rol[]>(this.endpoint).pipe(
        map((response: any) => {
            // Si el backend devuelve ApiResponse
            if (response.success !== undefined) {
                return response.data;
            }
            // Si el backend devuelve directamente el array
            return response;
        })
    );
}
```

---

## 📝 Paso 4: Verificar en el Navegador

1. **Inicia el backend Spring Boot** (puerto 8080)
2. **Inicia el frontend Angular**:
   ```bash
   npm start
   ```
3. **Abre el navegador**: http://localhost:4200/roles
4. **Abre DevTools (F12)** → Pestaña **Network**
5. **Refresca la página**

Deberías ver:
- ✅ Petición a `http://localhost:8080/api/roles` con status 200
- ✅ Respuesta JSON con los roles
- ✅ Sin errores de CORS

---

## 🐛 Troubleshooting

### Error: "net::ERR_CONNECTION_REFUSED"
- ❌ El backend NO está corriendo
- ✅ Inicia tu aplicación Spring Boot

### Error: "404 Not Found"
- ❌ La ruta no existe en el backend
- ✅ Verifica que la ruta sea `/api/roles` (no `/roles`)

### Error: "CORS policy"
- ❌ CORS no está configurado
- ✅ Agrega `@CrossOrigin` o la clase `CorsConfig`

### Error: "Cannot read property 'data' of undefined"
- ❌ El backend no devuelve el formato esperado
- ✅ Usa `ApiResponse` wrapper en el backend

---

## 📊 Checklist Final

- [ ] CORS configurado en Spring Boot (`@CrossOrigin` o `CorsConfig`)
- [ ] Backend corriendo en puerto 8080
- [ ] Endpoint `/api/roles` responde correctamente
- [ ] Frontend espera el formato correcto (con o sin wrapper)
- [ ] Angular corriendo en puerto 4200
- [ ] DevTools muestra status 200 en las peticiones

---

## 🎯 Próximos Pasos

Una vez que funcione el listado de roles:

1. Probar crear un nuevo rol
2. Probar editar un rol
3. Probar eliminar un rol
4. Aplicar la misma configuración a los demás módulos (Clientes, Equipos, etc.)

---

¿Necesitas ayuda con algún paso específico? 🚀
