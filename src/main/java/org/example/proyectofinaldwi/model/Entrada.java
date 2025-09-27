package org.example.proyectofinaldwi.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "entradas")
public class Entrada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private long idUsuario;

    @Column(nullable = false)
    private String codigoEntrada;

    @Column(nullable = false)
    private String pelicula;

    @Column(nullable = false)
    private LocalTime horario;

    @Column(nullable = false)
    private LocalDateTime fechaCompra;

    @Column(nullable = false)
    private String estado;

    private String metodoPago;
}
