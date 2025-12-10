package org.example.proyectofinaldwi.repository;

import org.example.proyectofinaldwi.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
    Optional<Usuario> findByDni(String dni);
    boolean existsByDni(String dni);
    boolean existsByEmail(String email);
}
