/*
 * ARCHIVO CORREGIDO - UsuarioService.java
 * 
 * INSTRUCCIONES:
 * 1. Abre tu archivo: com.example.InventarioPlus.service.UsuarioService
 * 2. Reemplaza TODO el contenido con este código
 * 3. Guarda el archivo
 * 4. Reinicia tu aplicación Spring Boot
 * 5. Prueba creando un nuevo usuario desde el frontend
 */

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
    private final PasswordEncoder passwordEncoder; // ⭐ NUEVA LÍNEA

    // ⭐ MODIFICADO: Constructor ahora inyecta PasswordEncoder
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

    // ⭐ MODIFICADO: Ahora hashea la contraseña antes de guardar
    public Usuario guardarUsuario(Usuario usuario) {
        // Verificar si se está proporcionando una contraseña
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            
            // Verificar si la contraseña ya está hasheada (empieza con $2a$ o $2b$)
            // Esto previene hashear dos veces la misma contraseña
            boolean yaEstaHasheada = usuario.getPassword().startsWith("$2a$") || 
                                     usuario.getPassword().startsWith("$2b$");
            
            if (!yaEstaHasheada) {
                // Si NO está hasheada, hashearla ahora con BCrypt
                String passwordHasheada = passwordEncoder.encode(usuario.getPassword());
                usuario.setPassword(passwordHasheada);
                
                System.out.println("✅ Contraseña hasheada correctamente para usuario: " + usuario.getUsername());
            } else {
                System.out.println("ℹ️ La contraseña ya estaba hasheada para usuario: " + usuario.getUsername());
            }
            
        } else {
            // Si es un usuario nuevo (sin ID) y no tiene contraseña, lanzar error
            if (usuario.getIdUsuario() == null) {
                throw new IllegalArgumentException("La contraseña es requerida para crear un nuevo usuario");
            }
            // Si es una actualización y password está vacío/null, 
            // mantener la contraseña actual (no se modifica en la BD)
            System.out.println("ℹ️ Actualizando usuario sin cambiar contraseña: " + usuario.getUsername());
        }
        
        return usuarioRepository.save(usuario);
    }

    // Eliminar usuario por ID
    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }
}
