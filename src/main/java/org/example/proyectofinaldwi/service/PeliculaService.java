package org.example.proyectofinaldwi.service;

import org.example.proyectofinaldwi.model.Pelicula;
import org.example.proyectofinaldwi.repository.PeliculaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PeliculaService {

    private final PeliculaRepository peliculaRepository;

    public PeliculaService(PeliculaRepository entradaRepository) {
        this.peliculaRepository = entradaRepository;
    }

    public List<Pelicula> findAll() {
        return peliculaRepository.findAll();
    }

    public Optional<Pelicula> findById(Long id) {
        return peliculaRepository.findById(id);
    }

    public Pelicula save(Pelicula pelicula) {
        return peliculaRepository.save(pelicula);
    }

    public Pelicula update(Long id, Pelicula pelicula) {
        pelicula.setPeliculaId(id);
        return peliculaRepository.save(pelicula);
    }

    public void deleteById(Long id) {
        peliculaRepository.deleteById(id);
    }
}
