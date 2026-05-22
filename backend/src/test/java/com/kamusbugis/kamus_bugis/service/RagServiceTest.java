package com.kamusbugis.kamus_bugis.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit test untuk RagService.
 * Menggunakan mock untuk SparqlService dan Groq RestClient.
 */
@ExtendWith(MockitoExtension.class)
class RagServiceTest {

    @Mock
    private SparqlService sparqlService;

    @Mock
    private RestClient groqRestClient;

    private RagService ragService;

    @BeforeEach
    void setUp() {
        ragService = new RagService(sparqlService, groqRestClient, "llama-3.3-70b-versatile");
    }

    // ── Test ekstrakKataKunci ──────────────────────────────────────────────────

    @Test
    @DisplayName("Ekstrak kata kunci dari pertanyaan sederhana")
    void testEkstrakKataKunci_simple() {
        List<String> hasil = ragService.ekstrakKataKunci("Apa arti kata siri' dalam bahasa Bugis?");
        assertTrue(hasil.contains("siri'"));
    }

    @Test
    @DisplayName("Ekstrak kata dalam tanda kutip (diprioritaskan)")
    void testEkstrakKataKunci_quoted() {
        List<String> hasil = ragService.ekstrakKataKunci("Jelaskan makna \"pesse\" dalam konteks budaya");
        assertEquals("pesse", hasil.get(0));
    }

    @Test
    @DisplayName("Hapus stop words dari hasil ekstraksi")
    void testEkstrakKataKunci_stopWordsRemoved() {
        List<String> hasil = ragService.ekstrakKataKunci("Apa itu kata dalam bahasa Bugis");
        assertFalse(hasil.contains("apa"));
        assertFalse(hasil.contains("itu"));
        assertFalse(hasil.contains("kata"));
        assertFalse(hasil.contains("dalam"));
        assertFalse(hasil.contains("bahasa"));
        assertFalse(hasil.contains("bugis"));
    }

    @Test
    @DisplayName("Pertanyaan kosong menghasilkan list kosong")
    void testEkstrakKataKunci_empty() {
        List<String> hasil = ragService.ekstrakKataKunci("");
        assertTrue(hasil.isEmpty());
    }

    @Test
    @DisplayName("Limit maksimal 5 kata kunci")
    void testEkstrakKataKunci_limit() {
        List<String> hasil = ragService.ekstrakKataKunci(
            "warani lempu' macca getteng siri' pesse ade' tongeng");
        assertTrue(hasil.size() <= 5);
    }

    // ── Test bangunKonteks ─────────────────────────────────────────────────────

    @Test
    @DisplayName("Bangun konteks dari data SPARQL yang lengkap")
    void testBangunKonteks_full() {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("latin", "siri'");
        row.put("lontaraq", "\u1A14\u1A17\u1A11\u1A17");
        row.put("maknaId", "rasa harga diri");
        row.put("maknaEn", "sense of honor");
        row.put("fonetik", "/\u02C8si.ri\u0294/");
        row.put("contoh", "Tau makkeda siri'");
        row.put("sinonim", "pesse, ade'");
        row.put("antonim", "nrellung");

        String konteks = ragService.bangunKonteks(List.of(row));

        assertTrue(konteks.contains("Kata: siri'"));
        assertTrue(konteks.contains("Aksara Lontaraq:"));
        assertTrue(konteks.contains("Makna (ID): rasa harga diri"));
        assertTrue(konteks.contains("Makna (EN): sense of honor"));
        assertTrue(konteks.contains("Contoh: Tau makkeda siri'"));
        assertTrue(konteks.contains("Sinonim: pesse, ade'"));
        assertTrue(konteks.contains("Antonim: nrellung"));
    }

    @Test
    @DisplayName("Bangun konteks dengan data kosong")
    void testBangunKonteks_empty() {
        String konteks = ragService.bangunKonteks(List.of());
        assertTrue(konteks.contains("Tidak ada data"));
    }

    @Test
    @DisplayName("Bangun konteks null menghasilkan pesan default")
    void testBangunKonteks_null() {
        String konteks = ragService.bangunKonteks(null);
        assertTrue(konteks.contains("Tidak ada data"));
    }

    @Test
    @DisplayName("Bangun konteks menghilangkan duplikat berdasarkan latin")
    void testBangunKonteks_deduplicate() {
        Map<String, String> row1 = new HashMap<>(Map.of("latin", "siri'", "maknaId", "harga diri"));
        Map<String, String> row2 = new HashMap<>(Map.of("latin", "siri'", "maknaId", "malu"));

        String konteks = ragService.bangunKonteks(List.of(row1, row2));

        // Hanya satu "Kata: siri'" karena deduplikasi
        int count = konteks.split("Kata: siri'").length - 1;
        assertEquals(1, count);
    }

    // ── Test tanya (integration mock) ──────────────────────────────────────────

    @Test
    @DisplayName("Pertanyaan null menghasilkan pesan default")
    void testTanya_null() {
        Map<String, Object> result = ragService.tanya(null);
        assertEquals("Silakan masukkan pertanyaan Anda tentang bahasa Bugis.", result.get("jawaban"));
        assertTrue(((List<?>) result.get("konteks")).isEmpty());
    }

    @Test
    @DisplayName("Pertanyaan blank menghasilkan pesan default")
    void testTanya_blank() {
        Map<String, Object> result = ragService.tanya("   ");
        assertEquals("Silakan masukkan pertanyaan Anda tentang bahasa Bugis.", result.get("jawaban"));
    }

    @Test
    @DisplayName("SPARQL mengembalikan data, konteks tidak kosong")
    void testTanya_withSparqlData() {
        // Mock SPARQL mengembalikan data
        Map<String, String> mockRow = new HashMap<>();
        mockRow.put("latin", "warani");
        mockRow.put("lontaraq", "\u1A13\u1A11\u1A0A\u1A17");
        mockRow.put("maknaId", "berani");

        when(sparqlService.query(anyString()))
            .thenReturn(List.of(mockRow))   // query utama
            .thenReturn(List.of())          // sinonim
            .thenReturn(List.of());         // antonim

        // Groq client mock — RestClient.post() chain will fail gracefully
        // RagService catches exceptions and returns error message
        Map<String, Object> result = ragService.tanya("Apa arti warani?");

        // Konteks harus berisi data dari SPARQL
        List<?> konteks = (List<?>) result.get("konteks");
        assertFalse(konteks.isEmpty());
        assertTrue(result.containsKey("jawaban"));
    }

    @Test
    @DisplayName("SPARQL tidak menemukan data, fallback via makna")
    void testTanya_sparqlEmpty_fallbackMakna() {
        Map<String, String> mockRow = new HashMap<>();
        mockRow.put("latin", "lempu'");
        mockRow.put("maknaId", "jujur");

        when(sparqlService.query(anyString()))
            .thenReturn(List.of())           // query utama kosong
            .thenReturn(List.of(mockRow));   // fallback via makna

        Map<String, Object> result = ragService.tanya("Apa kata Bugis untuk jujur?");

        List<?> konteks = (List<?>) result.get("konteks");
        assertFalse(konteks.isEmpty());
    }
}
