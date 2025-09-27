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

    private String pelicula;

    private LocalTime horario;

    private LocalDateTime fechaCompra;

    private String estado;

    private String metodoPago;
}
