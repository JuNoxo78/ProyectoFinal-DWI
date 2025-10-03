package org.example.proyectofinaldwi.service;

import org.example.proyectofinaldwi.model.Entrada;
import org.example.proyectofinaldwi.model.Reserva;
import org.example.proyectofinaldwi.repository.ReservaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;

    public ReservaService(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    public List<Reserva> findAll() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> findById(Long id) {
        return reservaRepository.findById(id);
    }

    public Reserva save(Reserva reserva) {
        // Precio por defecto de cada entrada
        BigDecimal precioPorEntrada = new BigDecimal("15.00");

        // Calcular el precio total automáticamente
        BigDecimal precioTotal = precioPorEntrada.multiply(BigDecimal.valueOf(reserva.getCantidadEntradas()));
        reserva.setPrecioTotal(precioTotal);

        return reservaRepository.save(reserva);
    }

    public Reserva update(Long id, Reserva reserva) {
        reserva.setReservaId(id);
        return reservaRepository.save(reserva);
    }

    public void deleteById(Long id) {
        reservaRepository.deleteById(id);
    }
}
