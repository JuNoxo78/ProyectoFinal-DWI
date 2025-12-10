package org.example.proyectofinaldwi.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/index")
    public String indexAlternative() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/peliculas")
    public String peliculas() {
        return "peliculas";
    }

    @GetMapping("/pelicula-detalle")
    public String peliculaDetalle() {
        return "pelicula-detalle";
    }

    @GetMapping("/admin/redirect")
    public String adminRedirect() {
        return "redirect-admin";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "admin-dashboard";
    }
}

