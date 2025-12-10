package org.example.proyectofinaldwi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Habilita @PreAuthorize, @Secured, etc.
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/index", "/index.html").permitAll() // Página de inicio
                        .requestMatchers("/login", "/register", "/peliculas", "/pelicula-detalle").permitAll() // Páginas de autenticación y películas
                        .requestMatchers("/admin/**").permitAll() // Páginas de administración (la autenticación se maneja en frontend)
                        .requestMatchers("/css/**", "/js/**", "/img/**", "/images/**", "/uploads/**").permitAll() // Recursos estáticos e imágenes subidas
                        .requestMatchers("/api/auth/**").permitAll() // Endpoints de autenticación
                        .requestMatchers("/api/peliculas", "/api/peliculas/**", "/api/funciones", "/api/funciones/**").permitAll() // API de películas y funciones accesible públicamente
                        .requestMatchers("/api/admin/**").hasRole("ADMIN") // API de admin requiere rol ADMIN
                        .requestMatchers("/api/**").authenticated() // Otras APIs requieren autenticación
                        .anyRequest().permitAll() // Permitir acceso a páginas HTML (la protección se hace en frontend)
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
