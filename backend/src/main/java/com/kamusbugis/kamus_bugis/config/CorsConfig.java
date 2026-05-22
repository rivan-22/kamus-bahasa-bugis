package com.kamusbugis.kamus_bugis.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                    // Development lokal
                    "http://localhost:*",
                    "http://127.0.0.1:*",
                    // Vercel preview & production deployments
                    "https://*.vercel.app",
                    // Custom domain production (ganti sesuai domain Anda)
                    "https://kamusbugis.com",
                    "https://www.kamusbugis.com",
                    "https://api.kamusbugis.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}