FROM eclipse-temurin:21-jdk-noble

# ── Metadata ────────────────────────────────────────────────────────────────
LABEL maintainer="kamus-bugis"
LABEL description="Apache Jena Fuseki with TDB2 persistent storage"

# ── Build args ───────────────────────────────────────────────────────────────
ARG FUSEKI_VERSION=apache-jena-fuseki-4.10.0
ARG FUSEKI_DOWNLOAD_BASE_URL=https://archive.apache.org/dist/jena/binaries/
ARG FUSEKI_ARCHIVE=${FUSEKI_VERSION}.tar.gz
ARG DOWNLOAD_DIR=/tmp/fuseki-download
ARG FUSEKI_HOME=/opt/fuseki

# ── Environment ──────────────────────────────────────────────────────────────
ENV FUSEKI_HOME=${FUSEKI_HOME}
ENV FUSEKI_BASE=/fuseki
ENV JAVA_OPTIONS="-Xmx2g -Xms512m"

# ── Install dependencies ──────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    bash \
    && rm -rf /var/lib/apt/lists/*

# ── Download Apache Jena Fuseki with retry ────────────────────────────────────
RUN mkdir -p "${DOWNLOAD_DIR}" "${FUSEKI_HOME}" && \
    wget --timeout=30 --tries=3 -O "${DOWNLOAD_DIR}/${FUSEKI_ARCHIVE}" "${FUSEKI_DOWNLOAD_BASE_URL}${FUSEKI_ARCHIVE}" && \
    tar xf "${DOWNLOAD_DIR}/${FUSEKI_ARCHIVE}" -C "${FUSEKI_HOME}" --strip-components=1 && \
    rm -rf "${DOWNLOAD_DIR}"

# ── Create runtime directories ────────────────────────────────────────────────
RUN mkdir -p \
    ${FUSEKI_BASE}/databases \
    ${FUSEKI_BASE}/configuration \
    ${FUSEKI_BASE}/logs \
    /data/rdf \
    /data/ontologi

# ── Copy data files ───────────────────────────────────────────────────────────
COPY rdf/       /data/rdf/
COPY ontologi/  /data/ontologi/

# ── Copy entrypoint ───────────────────────────────────────────────────────────
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# ── Create non-root user ──────────────────────────────────────────────────────
RUN groupadd -r fuseki && useradd -r -g fuseki fuseki && \
    chown -R fuseki:fuseki ${FUSEKI_HOME} ${FUSEKI_BASE} /data /entrypoint.sh

USER fuseki

# ── Expose Fuseki port ────────────────────────────────────────────────────────
EXPOSE 3030

# ── Entrypoint ─────────────────────────────────────────────────────────────────
ENTRYPOINT ["/entrypoint.sh"]

# ── Health check ──────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD wget -qO- http://localhost:3030/$/ping || exit 1

