package org.example.proyectofinaldwi.controller;

import org.example.proyectofinaldwi.model.Pelicula;
import org.example.proyectofinaldwi.service.PeliculaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/peliculas")
public class PeliculaController {

    private final PeliculaService peliculaService;

    public PeliculaController(PeliculaService peliculaService) {
        this.peliculaService = peliculaService;
    }

    @GetMapping
    public List<Pelicula> getAllPeliculas() {
        return peliculaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pelicula> getPeliculaById(@PathVariable Long id) {
        return peliculaService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPelicula(@RequestBody Pelicula pelicula) {
        if (pelicula.getNombre() == null || pelicula.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El campo 'nombre' es obligatorio");
        }

        return ResponseEntity.ok(peliculaService.save(pelicula));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pelicula> updatePelicula(@PathVariable Long id, @RequestBody Pelicula pelicula) {
        if (peliculaService.findById(id).isPresent()) {
            return ResponseEntity.ok(peliculaService.update(id, pelicula));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede eliminar películas
    public ResponseEntity<Void> deletePelicula(@PathVariable Long id) {
        if (peliculaService.findById(id).isPresent()) {
            peliculaService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Upload image from URL
    @PostMapping("/upload-from-url")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadImageFromUrl(@RequestBody Map<String, String> request) {
        try {
            String imageUrl = request.get("imageUrl");
            if (imageUrl == null || imageUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("URL de imagen es requerida");
            }

            // Create uploads directory in target/classes/static (accessible at runtime)
            Path uploadsDir = Paths.get("target/classes/static/uploads/peliculas");
            if (!Files.exists(uploadsDir)) {
                Files.createDirectories(uploadsDir);
            }

            // Also create in src for persistence (copied on next build)
            Path srcUploadsDir = Paths.get("src/main/resources/static/uploads/peliculas");
            if (!Files.exists(srcUploadsDir)) {
                Files.createDirectories(srcUploadsDir);
            }

            // Generate unique filename
            String fileExtension = getFileExtension(imageUrl);
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path targetPath = uploadsDir.resolve(fileName);
            Path srcPath = srcUploadsDir.resolve(fileName);

            // Download image from URL
            URL url = new URL(imageUrl);
            try (InputStream in = url.openStream()) {
                // Save to target (runtime accessible)
                Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Copy to src for persistence
            try (InputStream in = new URL(imageUrl).openStream()) {
                Files.copy(in, srcPath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Return the accessible path
            String accessiblePath = "/uploads/peliculas/" + fileName;
            Map<String, String> response = new HashMap<>();
            response.put("path", accessiblePath);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error al descargar la imagen: " + e.getMessage());
        }
    }

    // Upload image from file
    @PostMapping("/upload-from-file")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadImageFromFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Archivo vacío");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("El archivo debe ser una imagen");
            }

            // Validate file size (5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("La imagen no debe superar los 5MB");
            }

            // Create uploads directory in target/classes/static (accessible at runtime)
            Path uploadsDir = Paths.get("target/classes/static/uploads/peliculas");
            if (!Files.exists(uploadsDir)) {
                Files.createDirectories(uploadsDir);
            }

            // Also create in src for persistence
            Path srcUploadsDir = Paths.get("src/main/resources/static/uploads/peliculas");
            if (!Files.exists(srcUploadsDir)) {
                Files.createDirectories(srcUploadsDir);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path targetPath = uploadsDir.resolve(fileName);
            Path srcPath = srcUploadsDir.resolve(fileName);

            // Save file to target (runtime accessible)
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Copy to src for persistence
            Files.copy(Files.newInputStream(targetPath), srcPath, StandardCopyOption.REPLACE_EXISTING);

            // Return the accessible path
            String accessiblePath = "/uploads/peliculas/" + fileName;
            Map<String, String> response = new HashMap<>();
            response.put("path", accessiblePath);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error al subir la imagen: " + e.getMessage());
        }
    }

    // Helper method to get file extension from URL
    private String getFileExtension(String url) {
        String path = url.split("\\?")[0]; // Remove query parameters
        int lastDot = path.lastIndexOf('.');
        if (lastDot > 0 && lastDot < path.length() - 1) {
            return path.substring(lastDot);
        }
        return ".jpg"; // Default extension
    }

}
