package org.example.proyectofinaldwi.service;

import org.example.proyectofinaldwi.dto.AuthResponse;
import org.example.proyectofinaldwi.dto.LoginRequest;
import org.example.proyectofinaldwi.dto.RegisterRequest;
import org.example.proyectofinaldwi.model.Role;
import org.example.proyectofinaldwi.model.Usuario;
import org.example.proyectofinaldwi.repository.RoleRepository;
import org.example.proyectofinaldwi.repository.UsuarioRepository;
import org.example.proyectofinaldwi.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse login(LoginRequest request) {
        Usuario user = userRepository.findByDni(request.getDni())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtUtil.generateToken(user.getDni(), user.getRole().getName());

        return new AuthResponse(token, user.getDni(), user.getRole().getName());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByDni(request.getDni())) {
            throw new RuntimeException("El DNI ya existe");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya existe");
        }

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Role USER no encontrado"));

        Usuario user = new Usuario();
        user.setDni(request.getDni());
        user.setNombres(request.getNombres());
        user.setApellidos(request.getApellidos());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setTelefono(request.getTelefono());
        user.setEstado("Activo");
        user.setFechaRegistro(java.time.LocalDateTime.now());
        user.setRole(userRole);

        Usuario savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getDni(), savedUser.getRole().getName());

        return new AuthResponse(token, savedUser.getDni(), savedUser.getRole().getName());
    }
}
