package org.example.proyectofinaldwi.controller;

import org.example.proyectofinaldwi.model.Usuario;
import org.example.proyectofinaldwi.service.UsuarioService;
import org.springframework.http.ResponseEntity;
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
    public List<Usuario> getAllUsuarios() {
        return usuarioService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long id) {
        return usuarioService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
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
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        if (usuarioService.findById(id).isPresent()) {
            return ResponseEntity.ok(usuarioService.update(id, usuario));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        if (usuarioService.findById(id).isPresent()) {
            usuarioService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}
