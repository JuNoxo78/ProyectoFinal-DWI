package org.example.proyectofinaldwi.service;

import org.example.proyectofinaldwi.model.Entrada;
import org.example.proyectofinaldwi.repository.EntradaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
        return entradaRepository.save(entrada);
    }

    public Entrada update(Long id, Entrada entrada) {
        entrada.setId(id);
        return entradaRepository.save(entrada);
    }

    public void deleteById(Long id) {
        entradaRepository.deleteById(id);
    }
}