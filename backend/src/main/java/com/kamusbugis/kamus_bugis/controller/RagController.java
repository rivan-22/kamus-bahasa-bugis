package com.kamusbugis.kamus_bugis.controller;

import com.kamusbugis.kamus_bugis.service.RagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller untuk endpoint RAG (Tanya AI).
 * POST /api/tanya
 */
@RestController
@RequestMapping("/api")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    /**
     * Endpoint untuk menerima pertanyaan dan mengembalikan jawaban AI.
     *
     * Request Body:  { "pertanyaan": "Apa arti kata siri'?" }
     * Response:      { "jawaban": "...", "konteks": [...] }
     */
    @PostMapping("/tanya")
    public ResponseEntity<Map<String, Object>> tanya(@RequestBody Map<String, String> request) {
        String pertanyaan = request.get("pertanyaan");

        if (pertanyaan == null || pertanyaan.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "jawaban", "Parameter 'pertanyaan' tidak boleh kosong.",
                "konteks", java.util.List.of()
            ));
        }

        Map<String, Object> hasil = ragService.tanya(pertanyaan);
        return ResponseEntity.ok(hasil);
    }
}
