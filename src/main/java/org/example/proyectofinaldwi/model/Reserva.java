package org.example.proyectofinaldwi.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reservas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reserva_id")
    private Long reservaId;

    @Column(name = "cantidad_entradas", nullable = false)
    private Integer cantidadEntradas;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "funcion_id", nullable = false)
    private Long funcionId;

    @Column(name = "fecha_compra", nullable = false)
    private LocalDateTime fechaCompra;

    @Column(name = "precio_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioTotal;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    // Relación muchos a uno con Usuario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", insertable = false, updatable = false)
    private Usuario usuario;

    // Relación muchos a uno con Funcion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funcion_id", insertable = false, updatable = false)
    private Funcion funcion;

    // Relación uno a muchos con Entrada
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id")
    private List<Entrada> entradas;
}
