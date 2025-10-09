package org.example.proyectofinaldwi.repository;

import org.example.proyectofinaldwi.model.Entrada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntradaRepository extends JpaRepository<Entrada,Long> {
    boolean existsByCodigoEntrada(String codigoEntrada);
    // Nuevo método para buscar entradas por reservaId
    java.util.List<Entrada> findByReserva_ReservaId(Long reservaId);
}
