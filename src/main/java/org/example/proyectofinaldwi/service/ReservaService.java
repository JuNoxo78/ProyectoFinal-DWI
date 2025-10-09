package org.example.proyectofinaldwi.service;

import jakarta.transaction.Transactional;
import org.example.proyectofinaldwi.model.Reserva;
import org.example.proyectofinaldwi.model.Entrada;
import org.example.proyectofinaldwi.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final EntradaService entradaService;

    public ReservaService(ReservaRepository reservaRepository, EntradaService entradaService) {
        this.reservaRepository = reservaRepository;
        this.entradaService = entradaService;
    }

    public List<Reserva> findAll() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> findById(Long id) {
        return reservaRepository.findById(id);
    }

    @Transactional
    // Importe @Transactional, para asegurar que la creación de la reserva y sus entradas se revierta, si en algún punto hay un fallo
    public Reserva save(Reserva reserva) {
        // Precio por defecto de cada entrada
        BigDecimal precioPorEntrada = new BigDecimal("15.00");

        // Calcular el precio total automáticamente
        BigDecimal precioTotal = precioPorEntrada.multiply(BigDecimal.valueOf(reserva.getCantidadEntradas()));
        reserva.setPrecioTotal(precioTotal);

        Reserva reservaGuardada = reservaRepository.save(reserva);

        int cantidadEntradas = reservaGuardada.getCantidadEntradas();
        List<Entrada> entradasReservadas = entradaService.findByReservaId(reservaGuardada.getReservaId());

        if (entradasReservadas.isEmpty()) {
            for (int i = 0; i < cantidadEntradas; i++) {
                Entrada entrada = new Entrada();
                entrada.setReservaId(reservaGuardada.getReservaId());
                entradaService.save(entrada);
            }
        }

        return reservaGuardada;
    }

    public Reserva update(Long id, Reserva reserva) {
        reserva.setReservaId(id);
        return reservaRepository.save(reserva);
    }

    public void deleteById(Long id) {
        reservaRepository.deleteById(id);
    }
}
