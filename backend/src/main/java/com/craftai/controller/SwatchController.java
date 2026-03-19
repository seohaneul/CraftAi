package com.craftai.controller;

import com.craftai.repository.LeatherSwatchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/swatches")
@CrossOrigin(origins = "*")
public class SwatchController {
    private final LeatherSwatchRepository repository;

    public SwatchController(LeatherSwatchRepository repo) { this.repository = repo; }

    @GetMapping("/{adminId}")
    public ResponseEntity<?> getSwatches(@PathVariable String adminId) {
        return ResponseEntity.ok(repository.findByAdminIdOrderByRegistrationDateDesc(adminId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSwatch(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
