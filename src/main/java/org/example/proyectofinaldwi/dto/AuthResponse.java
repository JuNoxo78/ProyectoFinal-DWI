package org.example.proyectofinaldwi.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthResponse {
    private String token;
    private String dni;
    private String role;

    public AuthResponse() {
    }

    public AuthResponse(String token, String dni, String role) {
        this.token = token;
        this.dni = dni;
        this.role = role;
    }

}
