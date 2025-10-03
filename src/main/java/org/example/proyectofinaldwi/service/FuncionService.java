package org.example.proyectofinaldwi.service;

import org.example.proyectofinaldwi.model.Funcion;
import org.example.proyectofinaldwi.repository.FuncionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FuncionService {

    private final FuncionRepository funcionRepository;

    public FuncionService(FuncionRepository funcionRepository) {
        this.funcionRepository = funcionRepository;
    }

    public List<Funcion> findAll() {
        return funcionRepository.findAll();
    }

    public Optional<Funcion> findById(Long id) {
        return funcionRepository.findById(id);
    }

    public Funcion save(Funcion funcion) {
        return funcionRepository.save(funcion);
    }

    public Funcion update(Long id, Funcion funcion) {
        funcion.setFuncionId(id);
        return funcionRepository.save(funcion);
    }

    public void deleteById(Long id) {
        funcionRepository.deleteById(id);
    }
}
