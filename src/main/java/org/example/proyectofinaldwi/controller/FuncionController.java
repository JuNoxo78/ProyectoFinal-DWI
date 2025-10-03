package org.example.proyectofinaldwi.controller;

import org.example.proyectofinaldwi.model.Funcion;
import org.example.proyectofinaldwi.service.FuncionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funciones")
public class FuncionController {

    private final FuncionService funcionService;

    public FuncionController(FuncionService funcionService) {
        this.funcionService = funcionService;
    }

    @GetMapping
    public List<Funcion> getAllFunciones() {
        return funcionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Funcion> getFuncionById(@PathVariable Long id) {
        return funcionService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
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
