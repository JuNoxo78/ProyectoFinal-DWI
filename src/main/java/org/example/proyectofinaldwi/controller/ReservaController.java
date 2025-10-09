package org.example.proyectofinaldwi.controller;

import org.example.proyectofinaldwi.model.Reserva;
import org.example.proyectofinaldwi.service.ReservaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public List<Reserva> getAllReservas() {
        return reservaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> getReservaById(@PathVariable Long id) {
        return reservaService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createReserva(@RequestBody Reserva reserva) {
        if (reserva.getCantidadEntradas() == null) {
            return ResponseEntity.badRequest().body("El campo 'cantidadEntradas' es obligatorio");
        }
        if (reserva.getCantidadEntradas() > 5) {
            return ResponseEntity.badRequest().body("No se pueden reservar más de 5 entradas por reserva");
        }
        if (reserva.getUsuarioId() == null) {
            return ResponseEntity.badRequest().body("El campo 'usuarioId' es obligatorio");
        }
        if (reserva.getFuncionId() == null) {
            return ResponseEntity.badRequest().body("El campo 'funcionId' es obligatorio");
        }
        if (reserva.getFechaCompra() == null) {
            return ResponseEntity.badRequest().body("El campo 'fechaCompra' es obligatorio");
        }

        return ResponseEntity.ok(reservaService.save(reserva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reserva> updateReserva(@PathVariable Long id, @RequestBody Reserva reserva) {

        if (reservaService.findById(id).isPresent()) {
            return ResponseEntity.ok(reservaService.update(id, reserva));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReserva(@PathVariable Long id) {
        if (reservaService.findById(id).isPresent()) {
            reservaService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}
