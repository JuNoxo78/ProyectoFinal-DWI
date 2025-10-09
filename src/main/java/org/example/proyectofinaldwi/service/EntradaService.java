package org.example.proyectofinaldwi.service;

import org.example.proyectofinaldwi.model.Entrada;
import org.example.proyectofinaldwi.repository.EntradaRepository;
import org.hibernate.service.spi.InjectService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EntradaService {

    private final EntradaRepository entradaRepository;

    public EntradaService(EntradaRepository entradaRepository) {
        this.entradaRepository = entradaRepository;
    }

    public List<Entrada> findAll() {
        return entradaRepository.findAll();
    }

    public Optional<Entrada> findById(Long id) {
        return entradaRepository.findById(id);
    }

    public Entrada save(Entrada entrada) {
        if (entrada.getCodigoEntrada() == null || entrada.getCodigoEntrada().trim().isEmpty()) {
            entrada.setCodigoEntrada(generarCodigoUnico());
        }

        if (entrada.getPrecio() == null) {
            entrada.setPrecio(new BigDecimal("15.00"));
        }

        return entradaRepository.save(entrada);
    }

    private String generarCodigoUnico() {
        String codigo;
        do {
            codigo = "ENT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (entradaRepository.existsByCodigoEntrada(codigo)); // Verificar unicidad

        return codigo;
    }

    public Entrada update(Long id, Entrada entrada) {
        entrada.setEntradaId(id);
        return entradaRepository.save(entrada);
    }

    public void deleteById(Long id) {
        entradaRepository.deleteById(id);
    }

    public List<Entrada> findByReservaId(Long reservaId) {
        return entradaRepository.findByReserva_ReservaId(reservaId);
    }
}