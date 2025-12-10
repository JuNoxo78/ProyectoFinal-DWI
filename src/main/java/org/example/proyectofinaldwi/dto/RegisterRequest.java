package org.example.proyectofinaldwi.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterRequest {
    private String dni;
    private String nombres;
    private String apellidos;
    private String password;
    private String email;
    private String telefono;

    public RegisterRequest() {
    }

    public RegisterRequest(String dni, String nombres, String apellidos, String password, String email, String telefono) {
        this.dni = dni;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.password = password;
        this.email = email;
        this.telefono = telefono;
    }

}
