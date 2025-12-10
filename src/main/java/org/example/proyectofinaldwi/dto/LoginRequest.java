package org.example.proyectofinaldwi.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LoginRequest {
    private String dni;
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String dni, String password) {
        this.dni = dni;
        this.password = password;
    }

}
