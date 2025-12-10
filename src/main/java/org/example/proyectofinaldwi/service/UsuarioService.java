package org.example.proyectofinaldwi.service;

import org.example.proyectofinaldwi.model.Role;
import org.example.proyectofinaldwi.model.Usuario;
import org.example.proyectofinaldwi.repository.RoleRepository;
import org.example.proyectofinaldwi.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> findByDni(String dni) {
        return usuarioRepository.findByDni(dni);
    }

    public Usuario save(Usuario usuario) {
        // Si es un nuevo usuario (sin ID), establecer valores por defecto
        if (usuario.getUsuarioId() == null) {
            if (usuario.getEstado() == null || usuario.getEstado().trim().isEmpty()) {
                usuario.setEstado("Activo");
            }
            if (usuario.getFechaRegistro() == null) {
                usuario.setFechaRegistro(java.time.LocalDateTime.now());
            }
            // Encriptar contraseña si viene en texto plano
            if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
                usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            }
            // Asignar rol desde la base de datos
            if (usuario.getRole() != null && usuario.getRole().getName() != null) {
                Role role = roleRepository.findByName(usuario.getRole().getName())
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + usuario.getRole().getName()));
                usuario.setRole(role);
            } else {
                // Si no se especifica rol, asignar USER por defecto
                Role defaultRole = roleRepository.findByName("USER")
                        .orElseThrow(() -> new RuntimeException("Rol USER no encontrado en la base de datos"));
                usuario.setRole(defaultRole);
            }
        }
        return usuarioRepository.save(usuario);
    }

    public Usuario update(Long id, Usuario usuario) {
        // Buscar el usuario existente
        Usuario usuarioExistente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        // Actualizar solo los campos que pueden ser modificados
        if (usuario.getNombres() != null) {
            usuarioExistente.setNombres(usuario.getNombres());
        }
        if (usuario.getApellidos() != null) {
            usuarioExistente.setApellidos(usuario.getApellidos());
        }
        if (usuario.getEmail() != null) {
            usuarioExistente.setEmail(usuario.getEmail());
        }
        if (usuario.getTelefono() != null) {
            usuarioExistente.setTelefono(usuario.getTelefono());
        }
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            // Si se envía una nueva contraseña, encriptarla
            usuarioExistente.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        if (usuario.getEstado() != null) {
            usuarioExistente.setEstado(usuario.getEstado());
        }
        if (usuario.getRole() != null && usuario.getRole().getName() != null) {
            // Buscar el rol en la base de datos
            Role role = roleRepository.findByName(usuario.getRole().getName())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + usuario.getRole().getName()));
            usuarioExistente.setRole(role);
        }

        // NO actualizar: dni, fechaRegistro (son inmutables)

        return usuarioRepository.save(usuarioExistente);
    }

    public void deleteById(Long id) {
        usuarioRepository.deleteById(id);
    }

}
