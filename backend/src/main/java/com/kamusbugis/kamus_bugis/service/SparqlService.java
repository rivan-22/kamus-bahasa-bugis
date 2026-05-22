package com.kamusbugis.kamus_bugis.service;

import org.apache.jena.query.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SparqlService {

    /**
     * SPARQL endpoint URL – dikonfigurasi via application.properties.
     * Saat berjalan di Docker: http://fuseki:3030/bugis/sparql
     * Saat development lokal:  http://localhost:3030/bugis/sparql
     */
    @Value("${fuseki.sparql.endpoint}")
    private String fusekiUrl;

    private static final String PREFIX =
        "PREFIX bugis: <http://example.org/bugis#>\n" +
        "PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>\n";

    public List<Map<String, String>> query(String sparql) {
        List<Map<String, String>> results = new ArrayList<>();

        try (QueryExecution qe = QueryExecutionFactory
                .sparqlService(fusekiUrl, PREFIX + sparql)) {

            ResultSet rs = qe.execSelect();
            while (rs.hasNext()) {
                QuerySolution sol = rs.nextSolution();
                Map<String, String> row = new HashMap<>();

                Iterator<String> vars = sol.varNames();
                while (vars.hasNext()) {
                    String var = vars.next();
                    var node = sol.get(var);
                    if (node != null) {
                        String val = node.toString();
                        if (val.contains("#")) {
                            val = val.substring(val.lastIndexOf("#") + 1);
                        }
                        row.put(var, val);
                    }
                }
                results.add(row);
            }
        } catch (Exception e) {
            System.err.println("SPARQL Error: " + e.getMessage());
        }
        return results;
    }
}
