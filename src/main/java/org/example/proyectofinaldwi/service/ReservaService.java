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

        for (int i = 0; i < cantidadEntradas; i++) {
            Entrada entrada = new Entrada();
            entrada.setReservaId(reservaGuardada.getReservaId());
            entradaService.save(entrada);
        }

        return reservaGuardada;
    }

    @Transactional
    public Reserva update(Long id, Reserva reserva) {
        // 1. Buscar la reserva existente en la base de datos
        Reserva reservaExistente = reservaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));

        // 2. Actualizar solo los campos necesarios (NO el ID)
        reservaExistente.setFuncionId(reserva.getFuncionId());
        reservaExistente.setUsuarioId(reserva.getUsuarioId());
        reservaExistente.setCantidadEntradas(reserva.getCantidadEntradas());
        reservaExistente.setFechaCompra(reserva.getFechaCompra());
        reservaExistente.setMetodoPago(reserva.getMetodoPago());

        // 3. Calcular el precio total
        BigDecimal precioPorEntrada = new BigDecimal("15.00");
        BigDecimal precioTotal = precioPorEntrada.multiply(BigDecimal.valueOf(reserva.getCantidadEntradas()));
        reservaExistente.setPrecioTotal(precioTotal);

        int cantidadEntradas = reservaExistente.getCantidadEntradas();
        System.out.println("Actualizando reserva ID: " + id);

        // 4. Obtener las entradas actuales
        List<Entrada> entradasReservadas = entradaService.findByReservaId(id);
        System.out.println("Entradas actuales: " + entradasReservadas.size());
        System.out.println("Cantidad solicitada: " + cantidadEntradas);

        // 5. Ajustar la cantidad de entradas
        if (entradasReservadas.size() < cantidadEntradas) {
            // Crear nuevas entradas
            int entradasACrear = cantidadEntradas - entradasReservadas.size();
            System.out.println("Creando " + entradasACrear + " entradas");

            for (int i = 0; i < entradasACrear; i++) {
                Entrada entrada = new Entrada();
                entrada.setReservaId(id); // Usar el ID directamente, no el de reserva
                entrada.setPrecio(precioPorEntrada);
                entradaService.save(entrada);
            }
        } else if (entradasReservadas.size() > cantidadEntradas) {
            // Eliminar entradas sobrantes
            int entradasAEliminar = entradasReservadas.size() - cantidadEntradas;
            System.out.println("Eliminando " + entradasAEliminar + " entradas");

            for (int i = 0; i < entradasAEliminar; i++) {
                Entrada entradaAEliminar = entradasReservadas.get(i);
                entradaService.deleteById(entradaAEliminar.getEntradaId());
            }
        }

        // 6. Guardar la reserva actualizada
        return reservaRepository.save(reservaExistente);
    }

    public void deleteById(Long id) {
        // Eliminar las entradas asociadas primero
        List<Entrada> entradasReservadas = entradaService.findByReservaId(id);
        for (Entrada entrada : entradasReservadas) {
            entradaService.deleteById(entrada.getEntradaId());
        }
        reservaRepository.deleteById(id);
    }
}
