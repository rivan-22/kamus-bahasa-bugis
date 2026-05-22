package com.kamusbugis.kamus_bugis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Konfigurasi Spring Bean untuk Groq AI API Client.
 * Groq menggunakan format OpenAI-compatible REST API.
 * API key dibaca dari environment variable GROQ_API_KEY.
 */
@Configuration
public class GeminiConfig {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    @Value("${groq.model}")
    private String modelName;

    /**
     * RestClient yang sudah dikonfigurasi dengan base URL dan Authorization header
     * untuk memanggil Groq API.
     */
    @Bean(name = "groqRestClient")
    public RestClient groqRestClient() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                "GROQ_API_KEY tidak dikonfigurasi. " +
                "Set environment variable GROQ_API_KEY dengan API key dari https://console.groq.com/keys"
            );
        }
        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean(name = "groqModelName")
    public String groqModelName() {
        return modelName;
    }
}
