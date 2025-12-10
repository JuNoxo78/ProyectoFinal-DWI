package org.example.proyectofinaldwi.controller;

import org.example.proyectofinaldwi.model.Pelicula;
import org.example.proyectofinaldwi.service.PeliculaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/peliculas")
public class PeliculaController {

    private final PeliculaService peliculaService;

    public PeliculaController(PeliculaService peliculaService) {
        this.peliculaService = peliculaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')") // Usuarios autenticados pueden ver películas
    public List<Pelicula> getAllPeliculas() {
        return peliculaService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')") // Usuarios autenticados pueden ver una película
    public ResponseEntity<Pelicula> getPeliculaById(@PathVariable Long id) {
        return peliculaService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede crear películas
    public ResponseEntity<?> createPelicula(@RequestBody Pelicula pelicula) {
        if (pelicula.getNombre() == null || pelicula.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El campo 'nombre' es obligatorio");
        }

        return ResponseEntity.ok(peliculaService.save(pelicula));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede actualizar películas
    public ResponseEntity<Pelicula> updatePelicula(@PathVariable Long id, @RequestBody Pelicula pelicula) {
        if (peliculaService.findById(id).isPresent()) {
            return ResponseEntity.ok(peliculaService.update(id, pelicula));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede eliminar películas
    public ResponseEntity<Void> deletePelicula(@PathVariable Long id) {
        if (peliculaService.findById(id).isPresent()) {
            peliculaService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}
