package org.example.proyectofinaldwi.controller;

import org.example.proyectofinaldwi.model.Usuario;
import org.example.proyectofinaldwi.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede ver todos los usuarios
    public List<Usuario> getAllUsuarios() {
        return usuarioService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')") // ADMIN o USER pueden ver un usuario específico
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long id) {
        return usuarioService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dni/{dni}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')") // ADMIN o USER pueden buscar por DNI
    public ResponseEntity<Usuario> getUsuarioByDni(@PathVariable String dni) {
        return usuarioService.findByDni(dni)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede crear usuarios directamente
    public ResponseEntity<?> createUsuario(@RequestBody Usuario usuario) {
        if (usuario.getNombres() == null || usuario.getNombres().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El campo 'codigoEntrada' es obligatorio");
        }
        if (usuario.getApellidos() == null || usuario.getApellidos().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El campo 'apellido' es obligatorio");
        }
        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El campo 'password' es obligatorio");
        }
        if (usuario.getDni() == null || usuario.getDni().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El campo 'dni' es obligatorio");
        }

        return ResponseEntity.ok(usuarioService.save(usuario));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')") // ADMIN o USER pueden actualizar
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        if (usuarioService.findById(id).isPresent()) {
            return ResponseEntity.ok(usuarioService.update(id, usuario));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede eliminar usuarios
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        if (usuarioService.findById(id).isPresent()) {
            usuarioService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}
