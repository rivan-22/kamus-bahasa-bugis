package com.kamusbugis.kamus_bugis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * RagService — Retrieval-Augmented Generation untuk Kamus Bugis.
 *
 * Alur:
 * 1. Ekstrak kata kunci dari pertanyaan pengguna
 * 2. Query SPARQL ke Fuseki untuk mengambil data relevan
 * 3. Bangun string konteks dari hasil SPARQL
 * 4. Kirim ke Groq API (OpenAI-compatible) dengan system instruction + konteks
 * 5. Return jawaban
 */
@Service
public class RagService {

    private final SparqlService sparqlService;
    private final RestClient groqRestClient;
    private final String modelName;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_INSTRUCTION = """
        Kamu adalah seorang ahli bahasa Bugis dan pakar linguistik Austronesia yang sangat berpengetahuan.
        
        Tugas utamamu:
        - Menjawab pertanyaan tentang bahasa Bugis, aksara Lontaraq, kosakata, tata bahasa, etimologi, dan budaya Bugis.
        - Gunakan data dari KONTEKS KAMUS yang diberikan sebagai sumber utama jawaban.
        - Jika data konteks tersedia, SELALU sertakan informasi dari konteks tersebut dalam jawabanmu.
        - Jika data konteks tidak tersedia atau pertanyaan memerlukan pengetahuan tambahan, kamu boleh menjawab dengan pengetahuan umummu tentang bahasa Bugis.
        - Jawab SELALU dalam Bahasa Indonesia.
        - Jika pertanyaan TIDAK berkaitan dengan bahasa Bugis, aksara Lontaraq, atau budaya Bugis, tolak dengan sopan dan arahkan kembali ke topik kamus Bugis.
        
        Format jawaban:
        - Gunakan penjelasan yang jelas dan terstruktur.
        - Sertakan aksara Lontaraq jika relevan.
        - Sertakan contoh kalimat jika tersedia.
        - Sebutkan sinonim/antonim jika ada dalam konteks.
        """;

    public RagService(SparqlService sparqlService,
                      @Qualifier("groqRestClient") RestClient groqRestClient,
                      @Qualifier("groqModelName") String modelName) {
        this.sparqlService = sparqlService;
        this.groqRestClient = groqRestClient;
        this.modelName = modelName;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Proses pertanyaan pengguna dengan RAG pipeline.
     *
     * @param pertanyaan Pertanyaan dari pengguna
     * @return Map berisi "jawaban" dan "konteks" (list kata yang ditemukan)
     */
    public Map<String, Object> tanya(String pertanyaan) {
        if (pertanyaan == null || pertanyaan.isBlank()) {
            return Map.of(
                "jawaban", "Silakan masukkan pertanyaan Anda tentang bahasa Bugis.",
                "konteks", List.of()
            );
        }

        // 1. Ekstrak kata kunci
        List<String> kataKunci = ekstrakKataKunci(pertanyaan);

        // 2. Query SPARQL untuk setiap kata kunci
        List<Map<String, String>> konteksData = new ArrayList<>();
        for (String kata : kataKunci) {
            List<Map<String, String>> hasil = cariKataLengkap(kata);
            konteksData.addAll(hasil);
        }

        // Jika tidak ditemukan via kata kunci spesifik, coba pencarian umum
        if (konteksData.isEmpty() && !kataKunci.isEmpty()) {
            for (String kata : kataKunci) {
                List<Map<String, String>> hasilMakna = cariViaMakna(kata);
                konteksData.addAll(hasilMakna);
            }
        }

        // 3. Bangun konteks string
        String konteksString = bangunKonteks(konteksData);

        // 4. Kirim ke Groq
        String jawaban = kirimKeGroq(pertanyaan, konteksString);

        // 5. Return
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("jawaban", jawaban);
        response.put("konteks", konteksData);
        return response;
    }

    // ── Ekstrak kata kunci ───────────────────────────────────────────────────────

    /**
     * Ekstrak kata kunci dari pertanyaan pengguna.
     * Menghapus stop words Bahasa Indonesia dan mengambil kata bermakna.
     */
    List<String> ekstrakKataKunci(String pertanyaan) {
        Set<String> stopWords = Set.of(
            "apa", "itu", "ini", "yang", "dan", "atau", "dari", "untuk",
            "dengan", "di", "ke", "pada", "adalah", "dalam", "bahasa",
            "bugis", "kata", "arti", "artinya", "makna", "maknanya",
            "bagaimana", "mengapa", "kenapa", "berapa", "siapa", "dimana",
            "jelaskan", "sebutkan", "contoh", "contohnya", "cara", "bisa",
            "apakah", "tolong", "mau", "saya", "kamu", "dia", "mereka",
            "lontaraq", "aksara", "tulisan", "buatkan", "berikan", "coba"
        );

        String cleaned = pertanyaan.toLowerCase()
            .replaceAll("[^a-zA-Z\\s']", " ")
            .trim();

        List<String> hasil = Arrays.stream(cleaned.split("\\s+"))
            .filter(w -> !w.isBlank())
            .filter(w -> w.length() > 2)
            .filter(w -> !stopWords.contains(w))
            .distinct()
            .limit(5)
            .collect(Collectors.toList());

        // Coba juga ekstrak kata dalam tanda kutip
        Pattern quotedPattern = Pattern.compile("[\"'\u201c\u201d\u2018\u2019]([^\"'\u201c\u201d\u2018\u2019]+)[\"'\u201c\u201d\u2018\u2019]");
        Matcher matcher = quotedPattern.matcher(pertanyaan);
        while (matcher.find()) {
            String quoted = matcher.group(1).trim();
            if (!quoted.isBlank() && !hasil.contains(quoted.toLowerCase())) {
                hasil.add(0, quoted.toLowerCase());
            }
        }

        return hasil;
    }

    // ── SPARQL Queries ────────────────────────────────────────────────────────────

    /**
     * Cari kata lengkap beserta properti, sinonim, dan antonim.
     */
    private List<Map<String, String>> cariKataLengkap(String kata) {
        String sparqlUtama = """
            SELECT ?latin ?lontaraq ?maknaId ?maknaEn ?fonetik ?contoh ?domain WHERE {
              ?kata bugis:bentukLatin ?latin .
              FILTER(LCASE(?latin) = LCASE("%s"))
              OPTIONAL { ?kata bugis:aksaraLontaraq ?lontaraq }
              OPTIONAL { ?kata bugis:maknaIndonesia ?maknaId }
              OPTIONAL { ?kata bugis:maknaInggris ?maknaEn }
              OPTIONAL { ?kata bugis:fonetik ?fonetik }
              OPTIONAL { ?kata bugis:contohKalimat ?contoh }
              OPTIONAL { ?kata bugis:termasukDomain ?domainUri . BIND(STRAFTER(STR(?domainUri), "#") AS ?domain) }
            }
            LIMIT 5
            """.formatted(escapeSparql(kata));

        List<Map<String, String>> hasil = sparqlService.query(sparqlUtama);

        if (!hasil.isEmpty()) {
            String sparqlSinonim = """
                SELECT ?sinonim WHERE {
                  ?kata bugis:bentukLatin ?latin .
                  FILTER(LCASE(?latin) = LCASE("%s"))
                  ?kata bugis:sinonimDari ?s .
                  ?s bugis:bentukLatin ?sinonim .
                }
                LIMIT 10
                """.formatted(escapeSparql(kata));

            List<Map<String, String>> sinonimResult = sparqlService.query(sparqlSinonim);
            String sinonimStr = sinonimResult.stream()
                .map(m -> m.getOrDefault("sinonim", ""))
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(", "));

            String sparqlAntonim = """
                SELECT ?antonim WHERE {
                  ?kata bugis:bentukLatin ?latin .
                  FILTER(LCASE(?latin) = LCASE("%s"))
                  ?kata bugis:antonimDari ?a .
                  ?a bugis:bentukLatin ?antonim .
                }
                LIMIT 10
                """.formatted(escapeSparql(kata));

            List<Map<String, String>> antonimResult = sparqlService.query(sparqlAntonim);
            String antonimStr = antonimResult.stream()
                .map(m -> m.getOrDefault("antonim", ""))
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(", "));

            for (Map<String, String> row : hasil) {
                if (!sinonimStr.isBlank()) row.put("sinonim", sinonimStr);
                if (!antonimStr.isBlank()) row.put("antonim", antonimStr);
            }
        }

        return hasil;
    }

    /**
     * Cari kata via makna Indonesia (fallback jika bentukLatin tidak match).
     */
    private List<Map<String, String>> cariViaMakna(String kata) {
        String sparql = """
            SELECT ?latin ?lontaraq ?maknaId ?maknaEn ?fonetik ?contoh WHERE {
              ?kata bugis:bentukLatin ?latin ;
                    bugis:maknaIndonesia ?maknaId .
              FILTER(CONTAINS(LCASE(?maknaId), LCASE("%s")))
              OPTIONAL { ?kata bugis:aksaraLontaraq ?lontaraq }
              OPTIONAL { ?kata bugis:maknaInggris ?maknaEn }
              OPTIONAL { ?kata bugis:fonetik ?fonetik }
              OPTIONAL { ?kata bugis:contohKalimat ?contoh }
            }
            LIMIT 5
            """.formatted(escapeSparql(kata));

        return sparqlService.query(sparql);
    }

    // ── Bangun Konteks ────────────────────────────────────────────────────────────

    /**
     * Bangun string konteks dari hasil SPARQL untuk dikirim ke LLM.
     */
    String bangunKonteks(List<Map<String, String>> data) {
        if (data == null || data.isEmpty()) {
            return "[Tidak ada data yang ditemukan di kamus untuk kata kunci ini]";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("=== KONTEKS KAMUS BUGIS ===\n\n");

        Set<String> seen = new HashSet<>();
        for (Map<String, String> row : data) {
            String latin = row.getOrDefault("latin", "?");
            if (seen.contains(latin)) continue;
            seen.add(latin);

            sb.append("Kata: ").append(latin);
            appendIfPresent(sb, " | Aksara Lontaraq: ", row.get("lontaraq"));
            appendIfPresent(sb, " | Makna (ID): ", row.get("maknaId"));
            appendIfPresent(sb, " | Makna (EN): ", row.get("maknaEn"));
            appendIfPresent(sb, " | Fonetik: ", row.get("fonetik"));
            appendIfPresent(sb, " | Contoh: ", row.get("contoh"));
            appendIfPresent(sb, " | Sinonim: ", row.get("sinonim"));
            appendIfPresent(sb, " | Antonim: ", row.get("antonim"));
            appendIfPresent(sb, " | Domain: ", row.get("domain"));
            sb.append("\n");
        }

        return sb.toString().trim();
    }

    private void appendIfPresent(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append(label).append(value);
        }
    }

    // ── Kirim ke Groq API ─────────────────────────────────────────────────────────

    /**
     * Kirim pertanyaan + konteks ke Groq API (OpenAI-compatible) dan dapatkan jawaban.
     */
    private String kirimKeGroq(String pertanyaan, String konteks) {
        try {
            String userPrompt = """
                KONTEKS DATA KAMUS:
                %s
                
                PERTANYAAN PENGGUNA:
                %s
                
                Jawab pertanyaan di atas menggunakan konteks data kamus yang diberikan. \
                Jika konteks menyediakan informasi yang relevan, gunakan data tersebut. \
                Jika tidak, jawab berdasarkan pengetahuan umummu tentang bahasa Bugis.
                """.formatted(konteks, pertanyaan);

            // Build request body sesuai format OpenAI Chat Completions API
            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", modelName);
            requestBody.put("messages", List.of(
                Map.of("role", "system", "content", SYSTEM_INSTRUCTION),
                Map.of("role", "user", "content", userPrompt)
            ));
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 2048);
            requestBody.put("top_p", 0.9);

            String jsonBody = objectMapper.writeValueAsString(requestBody);

            // Kirim request ke Groq
            String responseJson = groqRestClient.post()
                .uri("/chat/completions")
                .body(jsonBody)
                .retrieve()
                .body(String.class);

            // Parse response
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                String text = choices.get(0).path("message").path("content").asText("");
                if (!text.isBlank()) {
                    return text;
                }
            }

            return "Maaf, saya tidak dapat menghasilkan jawaban saat ini.";

        } catch (Exception e) {
            System.err.println("Groq API Error: " + e.getMessage());
            e.printStackTrace();
            return "Maaf, terjadi kesalahan saat memproses pertanyaan Anda. " +
                   "Silakan coba lagi dalam beberapa saat.";
        }
    }

    // ── Utility ───────────────────────────────────────────────────────────────────

    /**
     * Escape karakter khusus untuk SPARQL string literal.
     */
    private String escapeSparql(String input) {
        if (input == null) return "";
        return input
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("'", "\\'")
            .replace("\n", "\\n")
            .replace("\r", "\\r");
    }
}
