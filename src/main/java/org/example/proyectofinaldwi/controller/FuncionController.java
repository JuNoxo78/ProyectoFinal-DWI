package org.example.proyectofinaldwi.controller;

import org.example.proyectofinaldwi.model.Funcion;
import org.example.proyectofinaldwi.service.FuncionService;
import org.example.proyectofinaldwi.service.PeliculaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/funciones")
public class FuncionController {

    private final FuncionService funcionService;
    private final PeliculaService peliculaService;

    public FuncionController(FuncionService funcionService, PeliculaService peliculaService) {
        this.funcionService = funcionService;
        this.peliculaService = peliculaService;
    }

    @GetMapping
    public List<Map<String, Object>> getAllFunciones() {
        return funcionService.findAll().stream()
                .map(this::funcionToMap)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getFuncionById(@PathVariable Long id) {
        return funcionService.findById(id)
                .map(this::funcionToMap)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> funcionToMap(Funcion funcion) {
        Map<String, Object> map = new HashMap<>();
        map.put("funcionId", funcion.getFuncionId());
        map.put("fecha", funcion.getFecha());
        map.put("horario", funcion.getHorario());
        map.put("numeroSala", funcion.getNumeroSala());
        map.put("peliculaId", funcion.getPeliculaId());

        // Cargar película si existe
        peliculaService.findById(funcion.getPeliculaId()).ifPresent(pelicula -> {
            Map<String, Object> peliculaMap = new HashMap<>();
            peliculaMap.put("peliculaId", pelicula.getPeliculaId());
            peliculaMap.put("nombre", pelicula.getNombre());
            map.put("pelicula", peliculaMap);
        });

        return map;
    }

    @PostMapping
    public ResponseEntity<?> createFuncion(@RequestBody Funcion funcion) {
        if (funcion.getFecha() == null) {
            return ResponseEntity.badRequest().body("El campo 'fecha' es obligatorio");
        }
        if (funcion.getHorario() == null) {
            return ResponseEntity.badRequest().body("El campo 'horario' es obligatorio");
        }
        if (funcion.getNumeroSala() == null) {
            return ResponseEntity.badRequest().body("El campo 'numeroSala' es obligatorio");
        }
        if (funcion.getPeliculaId() == null) {
            return ResponseEntity.badRequest().body("El campo 'peliculaId' es obligatorio");
        }

        return ResponseEntity.ok(funcionService.save(funcion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Funcion> updateFuncion(@PathVariable Long id, @RequestBody Funcion funcion) {
        if (funcionService.findById(id).isPresent()) {
            return ResponseEntity.ok(funcionService.update(id, funcion));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuncion(@PathVariable Long id) {
        if (funcionService.findById(id).isPresent()) {
            funcionService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}
