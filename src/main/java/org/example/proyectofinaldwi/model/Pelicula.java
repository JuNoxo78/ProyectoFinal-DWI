package org.example.proyectofinaldwi.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "pelicula")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pelicula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pelicula_id")
    private Long peliculaId;

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "duracion")
    private Integer duracion; // duración en minutos

    @Column(name = "genero", length = 100)
    private String genero;

    @Column(name = "clasificacion", length = 10)
    private String clasificacion; // Ej: "PG-13", "R", "G", etc.

    @Column(name = "url_portada", length = 500)
    private String urlPortada;  // ← URL de la imagen

    // Relación uno a muchos con Función
    @OneToMany(mappedBy = "pelicula", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Funcion> funciones;
}
