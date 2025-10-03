package org.example.proyectofinaldwi.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "funciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Funcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "funcion_id")
    private Long funcionId;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "horario", nullable = false)
    private LocalTime horario;

    @Column(name = "numero_sala", nullable = false)
    private Integer numeroSala;

    @Column(name = "pelicula_id", nullable = false)
    private Long peliculaId;

    // Relación muchos a uno con Película
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pelicula_id", insertable = false, updatable = false)
    private Pelicula pelicula;

    // Relación uno a muchos con Reserva
    @OneToMany(mappedBy = "funcion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Reserva> reservas;
}
