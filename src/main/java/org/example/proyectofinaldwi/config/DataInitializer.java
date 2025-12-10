package org.example.proyectofinaldwi.config;

import org.example.proyectofinaldwi.model.Role;
import org.example.proyectofinaldwi.model.Usuario;
import org.example.proyectofinaldwi.repository.RoleRepository;
import org.example.proyectofinaldwi.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                          UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Crear roles si no existen
        Role adminRole;
        if (roleRepository.findByName("ADMIN").isEmpty()) {
            adminRole = roleRepository.save(new Role("ADMIN"));
        } else {
            adminRole = roleRepository.findByName("ADMIN").get();
        }

        Role userRole;
        if (roleRepository.findByName("USER").isEmpty()) {
            userRole = roleRepository.save(new Role("USER"));
        } else {
            userRole = roleRepository.findByName("USER").get();
        }

        // Crear usuario ADMIN por defecto si no existe
        if (!usuarioRepository.existsByDni("admin001")) {
            Usuario admin = new Usuario();
            admin.setDni("admin001");
            admin.setNombres("Administrador");
            admin.setApellidos("Sistema");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@cineapp.com");
            admin.setTelefono("999999999");
            admin.setEstado("Activo");
            admin.setFechaRegistro(LocalDateTime.now());
            admin.setRole(adminRole);

            usuarioRepository.save(admin);

            System.out.println("========================================");
            System.out.println("✅ Usuario ADMIN creado exitosamente");
            System.out.println("========================================");
            System.out.println("DNI: admin001");
            System.out.println("Password: admin123");
            System.out.println("Email: admin@cineapp.com");
            System.out.println("========================================");
        }
    }
}
