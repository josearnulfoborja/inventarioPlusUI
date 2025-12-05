# 🔐 Problema: Contraseña sin Encriptar

## 📋 Diagnóstico del Problema

El usuario **"Mario"** (ID: 11) tiene su contraseña almacenada en **texto plano** (`Secret123`) en la base de datos, mientras que todos los demás usuarios tienen sus contraseñas correctamente hasheadas con **BCrypt**.

### Estado Actual en Base de Datos:

| ID | Username | Password | Estado |
|----|----------|----------|--------|
| 1 | admin | `$2a$10$...` | ✅ Hasheada |
| 2 | jperez | `$2a$10$...` | ✅ Hasheada |
| 3 | ctecnico | `$2a$10$...` | ✅ Hasheada |
| 11 | mario | `Secret123` | ❌ **Texto plano** |

## 🎯 Causa Raíz

El **backend Java** NO está hasheando las contraseñas correctamente en uno de estos escenarios:

1. ❌ El método `crearUsuario()` no hashea la contraseña antes de guardar
2. ❌ El método `actualizarUsuario()` no hashea cuando se actualiza la contraseña
3. ❌ Falta la configuración de BCrypt o está mal implementada

## ✅ Soluciones

### Solución 1: Arreglar el Script SQL (Temporal)

Ejecuta este script SQL para corregir la contraseña de Mario:

```bash
# Ubicación del archivo
db/fix_mario_password.sql
```

Este script actualiza la contraseña de "Mario" para que esté hasheada con BCrypt (mantiene la contraseña "Secret123" pero ahora encriptada).

### Solución 2: Corregir el Backend Java (DEFINITIVA)

**Debes modificar el backend Java** para asegurar que TODAS las contraseñas se hasheen automáticamente.

#### ⭐ TU ARCHIVO ACTUAL: `UsuarioService.java`

**Ubicación:** `com.example.InventarioPlus.service.UsuarioService`

Tu código actual NO hashea las contraseñas. Aquí está la corrección:

```java
package com.example.InventarioPlus.service;

import com.example.InventarioPlus.model.Usuario;
import com.example.InventarioPlus.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder; // ⭐ AGREGAR ESTO

    // ⭐ MODIFICAR: Inyectar PasswordEncoder
    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Listar todos los usuarios
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // Obtener usuario por ID
    public Optional<Usuario> obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    // ⭐ MODIFICAR: Hashear contraseña antes de guardar
    public Usuario guardarUsuario(Usuario usuario) {
        // Si es un usuario nuevo O si se está actualizando la contraseña
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            // Verificar si la contraseña ya está hasheada (empieza con $2a$ o $2b$)
            if (!usuario.getPassword().startsWith("$2a$") && !usuario.getPassword().startsWith("$2b$")) {
                // Si NO está hasheada, hashearla ahora
                usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            }
        } else if (usuario.getIdUsuario() == null) {
            // Si es usuario nuevo y no tiene contraseña, lanzar error
            throw new IllegalArgumentException("La contraseña es requerida para crear un nuevo usuario");
        }
        // Si es actualización y password está vacío, se mantiene la contraseña actual
        
        return usuarioRepository.save(usuario);
    }

    // Eliminar usuario por ID
    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }
}
```

#### ✅ Tu SecurityConfig.java ya está correcto

Ya tienes el `PasswordEncoder` bean definido en tu `SecurityConfig.java`:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

**No necesitas modificar este archivo.** Solo necesitas inyectar el `PasswordEncoder` en `UsuarioService`.

## 🔍 Verificación

Después de implementar los cambios:

1. **Crear un nuevo usuario de prueba** desde el frontend
2. **Revisar en la base de datos** que la contraseña esté hasheada:

```sql
SELECT id_usuario, username, 
       CASE 
           WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' THEN 'HASHEADO ✓'
           ELSE 'TEXTO PLANO ✗'
       END AS estado_password
FROM usuarios
ORDER BY id_usuario DESC
LIMIT 5;
```

3. **Intentar iniciar sesión** con el usuario creado para confirmar que funciona

## 📝 Checklist de Implementación

- [ ] ✅ Ejecutar `db/fix_mario_password.sql` para corregir usuario existente
- [ ] ✅ Modificar `UsuarioService.java` en el backend para hashear contraseñas
- [ ] ✅ Agregar `BCryptPasswordEncoder` bean si no existe
- [ ] ✅ Reiniciar el backend
- [ ] ✅ Crear usuario de prueba desde el frontend
- [ ] ✅ Verificar en BD que la contraseña esté hasheada
- [ ] ✅ Probar login con usuario nuevo
- [ ] ✅ Probar login con usuario "mario" (contraseña: Secret123)

## 🚨 Importante

- **BCrypt** es un hash de una sola vía (no se puede desencriptar)
- Cada vez que hasheas la misma contraseña, el resultado es diferente (por el salt)
- El login funciona porque BCrypt compara el hash, no el texto plano
- **NUNCA** almacenes contraseñas en texto plano

## 📚 Referencias

- [BCrypt Online Generator](https://bcrypt-generator.com/) - Para generar hashes manualmente
- [Spring Security BCrypt](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html#authentication-password-storage-bcrypt)
