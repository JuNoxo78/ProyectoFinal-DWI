package org.example.proyectofinaldwi.controller;

import org.example.proyectofinaldwi.model.Entrada;
import org.example.proyectofinaldwi.service.EntradaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/entradas")
public class EntradaController {

    private final EntradaService entradaService;

    public EntradaController(EntradaService entradaService) {
        this.entradaService = entradaService;
    }

    @GetMapping
    public List<Entrada> getAllEntradas() {
        return entradaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Entrada> getEntradaById(@PathVariable Long id) {
        return entradaService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createEntrada(@RequestBody Entrada entrada) {
        if (entrada.getReservaId() == null) {
            return ResponseEntity.badRequest().body("El campo 'reservaId' es obligatorio");
        }
        if (entrada.getPrecio() != null && entrada.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("El precio debe ser mayor a 0");
        }

        return ResponseEntity.ok(entradaService.save(entrada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Entrada> updateEntrada(@PathVariable Long id, @RequestBody Entrada entrada) {
        if (entradaService.findById(id).isPresent()) {
            return ResponseEntity.ok(entradaService.update(id, entrada));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntrada(@PathVariable Long id) {
        if (entradaService.findById(id).isPresent()) {
            entradaService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
