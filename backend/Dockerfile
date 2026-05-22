# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Install Maven (since .mvn/wrapper/ might be missing)
RUN apk add --no-cache maven

# Copy POM and source
COPY pom.xml ./
COPY src ./src

# Build (will download dependencies during this step)
RUN mvn package -DskipTests -B -Dmaven.wagon.http.ssl.insecure=true

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="kamus-bugis"
LABEL description="Kamus Bugis Spring Boot Backend"

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar
RUN chown spring:spring app.jar

USER spring

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD wget -qO- http://localhost:8080/actuator/health || \
        wget -qO- http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
