package org.example.proyectofinaldwi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "entradas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Entrada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "entrada_id")
    private Long entradaId;

    @Column(name = "reserva_id", nullable = false)
    private Long reservaId;

    @Column(name = "codigo_entrada", nullable = false, unique = true)
    private String codigoEntrada;

    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "codigo_butaca", nullable = false)
    private String codigoButaca;

    // Relación muchos a uno con Reserva
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id", insertable = false, updatable = false)
    @JsonIgnore
    private Reserva reserva;
}
