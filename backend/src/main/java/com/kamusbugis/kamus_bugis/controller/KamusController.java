package com.kamusbugis.kamus_bugis.controller;

import com.kamusbugis.kamus_bugis.service.SparqlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class KamusController {

    @Autowired
    private SparqlService sparqlService;

    // GET /api/cari?q=tanah
    @GetMapping("/cari")
    public ResponseEntity<?> cari(@RequestParam String q) {
        String sparql = """
            SELECT ?id ?lontaraq ?latin ?makna WHERE {
              ?id bugis:aksaraLontaraq ?lontaraq ;
                  bugis:bentukLatin    ?latin ;
                  bugis:maknaIndonesia ?makna .
              FILTER(CONTAINS(LCASE(?makna), LCASE("%s")))
            }
            ORDER BY ?latin
            LIMIT 20
            """.formatted(q);
        
        return ResponseEntity.ok(sparqlService.query(sparql));
    }

    // GET /api/kata/tana
    @GetMapping("/kata/{id}")
    public ResponseEntity<?> detail(@PathVariable String id) {
        String sparql = """
            SELECT ?properti ?nilai WHERE {
              bugis:%s ?properti ?nilai .
            }
            """.formatted(id);
        
        return ResponseEntity.ok(sparqlService.query(sparql));
    }

    // GET /api/sinonim/pinasa
    @GetMapping("/sinonim/{id}")
    public ResponseEntity<?> sinonim(@PathVariable String id) {
        String sparql = """
            SELECT ?sinonim ?lontaraq ?latin WHERE {
              bugis:%s bugis:sinonimDari ?s .
              ?s bugis:aksaraLontaraq ?lontaraq ;
                 bugis:bentukLatin    ?latin .
              BIND(STRAFTER(STR(?s), "#") AS ?sinonim)
            }
            """.formatted(id);
        
        return ResponseEntity.ok(sparqlService.query(sparql));
    }

    // GET /api/antonim/malomo
    @GetMapping("/antonim/{id}")
    public ResponseEntity<?> antonim(@PathVariable String id) {
        String sparql = """
            SELECT ?antonim ?lontaraq ?latin WHERE {
              bugis:%s bugis:antonimDari ?a .
              ?a bugis:aksaraLontaraq ?lontaraq ;
                 bugis:bentukLatin    ?latin .
              BIND(STRAFTER(STR(?a), "#") AS ?antonim)
            }
            """.formatted(id);
        
        return ResponseEntity.ok(sparqlService.query(sparql));
    }

    // GET /api/graf/pinasa
    @GetMapping("/graf/{id}")
    public ResponseEntity<?> graf(@PathVariable String id) {
        String sparql = """
            SELECT ?relasi ?ke ?labelKe WHERE {
              bugis:%s ?relasi ?ke .
              ?ke bugis:bentukLatin ?labelKe .
              FILTER(?relasi IN (
                bugis:sinonimDari,
                bugis:antonimDari,
                bugis:diturunkanDari,
                bugis:berkaitanDengan
              ))
            }
            """.formatted(id);
        
        return ResponseEntity.ok(sparqlService.query(sparql));
    }

    // GET /api/semua?page=0
    @GetMapping("/semua")
    public ResponseEntity<?> semua(
            @RequestParam(defaultValue = "0") int page) {
        int limit = 20;
        int offset = page * limit;
        String sparql = """
            SELECT ?latin ?lontaraq ?makna ?tipe WHERE {
              ?kata rdf:type ?tipe ;
                    bugis:bentukLatin    ?latin ;
                    bugis:aksaraLontaraq ?lontaraq ;
                    bugis:maknaIndonesia ?makna .
              FILTER(?tipe IN (
                bugis:Nomina, bugis:Verba,
                bugis:Adjektiva, bugis:Frasa
              ))
            }
            ORDER BY ?latin
            LIMIT %d OFFSET %d
            """.formatted(limit, offset);
        
        return ResponseEntity.ok(sparqlService.query(sparql));
    }
}