#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Kamus Bugis – Fuseki Entrypoint
# Handles:
#   1. First-run dataset creation (TDB2)
#   2. Auto-load of all .ttl files from /data/
#   3. Start Fuseki server
# ─────────────────────────────────────────────────────────────────────────────

FUSEKI_HOME="${FUSEKI_HOME:-/opt/fuseki}"
FUSEKI_BASE="${FUSEKI_BASE:-/fuseki}"
DATASET="${FUSEKI_DATASET:-bugis}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"

DB_DIR="${FUSEKI_BASE}/databases/${DATASET}"
CONFIG_FILE="${FUSEKI_BASE}/configuration/${DATASET}.ttl"
MARKER_FILE="${DB_DIR}/.initialized"

echo "============================================="
echo "  Apache Jena Fuseki – Kamus Bugis"
echo "  Dataset : ${DATASET}"
echo "  DB Dir  : ${DB_DIR}"
echo "============================================="

# ── 1. Write Fuseki shiro config ────────────────────────────────────────────────
SHIRO_FILE="${FUSEKI_BASE}/shiro.ini"
if [ ! -f "${SHIRO_FILE}" ]; then
    echo "[INFO] Creating shiro.ini with admin password..."
    mkdir -p "${FUSEKI_BASE}"
    cat > "${SHIRO_FILE}" <<EOF
[main]
# Fuseki shiro configuration
ssl.enabled = false

[users]
admin = ${ADMIN_PASSWORD}

[roles]
admin = *

[urls]
/\$/** = anon
/\$/ping = anon
/\$/datasets/** = admin
/** = anon
EOF
fi

# ── 2. Write dataset configuration (TDB2) ────────────────────────────────────
if [ ! -f "${CONFIG_FILE}" ]; then
    echo "[INFO] Creating TDB2 dataset config for '${DATASET}'..."
    mkdir -p "${FUSEKI_BASE}/configuration"
    cat > "${CONFIG_FILE}" <<EOF
@prefix :        <#> .
@prefix fuseki:  <http://jena.apache.org/fuseki#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix tdb2:    <http://jena.apache.org/2016/tdb#> .
@prefix ja:      <http://jena.hpl.hp.com/2005/11/Assembler#> .

:service_${DATASET} rdf:type fuseki:Service ;
    fuseki:name "${DATASET}" ;
    fuseki:endpoint [ fuseki:operation fuseki:query ;  fuseki:name "sparql" ] ;
    fuseki:endpoint [ fuseki:operation fuseki:query ;  fuseki:name "query"  ] ;
    fuseki:endpoint [ fuseki:operation fuseki:update ; fuseki:name "update" ] ;
    fuseki:endpoint [ fuseki:operation fuseki:gsp-r ;  fuseki:name "get"    ] ;
    fuseki:endpoint [ fuseki:operation fuseki:gsp-rw ; fuseki:name "data"   ] ;
    fuseki:endpoint [ fuseki:operation fuseki:upload ; fuseki:name "upload" ] ;
    fuseki:dataset :dataset_${DATASET} .

:dataset_${DATASET} rdf:type tdb2:DatasetTDB2 ;
    tdb2:location "${DB_DIR}" .
EOF
fi

# ── 3. First-run: load all .ttl files into TDB2 ───────────────────────────────
if [ ! -f "${MARKER_FILE}" ]; then
    echo "[INFO] First run detected – loading .ttl data into TDB2..."
    mkdir -p "${DB_DIR}"
    
    # Try tdb2.tdbloader if available
    TDBLOADER="${FUSEKI_HOME}/tdb2.tdbloader"
    if [ ! -f "${TDBLOADER}" ]; then
        TDBLOADER=$(find "${FUSEKI_HOME}" -name "tdb2.tdbloader" 2>/dev/null | head -1)
    fi

    if [ -z "${TDBLOADER}" ] || [ ! -f "${TDBLOADER}" ]; then
        echo "[INFO] tdb2.tdbloader not found; data will be loaded via Fuseki HTTP after start."
        LOAD_VIA_HTTP=true
    else
        LOAD_VIA_HTTP=false
        echo "[INFO] Using TDB2 loader: ${TDBLOADER}"

        # Load ontology files first
        if [ -d /data/ontologi ]; then
            for TTL_FILE in /data/ontologi/*.ttl; do
                [ -f "${TTL_FILE}" ] || continue
                echo "[INFO] Loading ontology: ${TTL_FILE}"
                "${TDBLOADER}" --loc "${DB_DIR}" "${TTL_FILE}" || true
            done
        fi

        # Load RDF data files
        if [ -d /data/rdf ]; then
            for TTL_FILE in /data/rdf/*.ttl; do
                [ -f "${TTL_FILE}" ] || continue
                echo "[INFO] Loading data: ${TTL_FILE}"
                "${TDBLOADER}" --loc "${DB_DIR}" "${TTL_FILE}" || true
            done
        fi

        touch "${MARKER_FILE}"
        echo "[INFO] TDB2 data loading complete."
    fi
else
    echo "[INFO] Database already initialized – skipping data load."
    LOAD_VIA_HTTP=false
fi

# ── 4. Start Fuseki server ────────────────────────────────────────────────────
echo "[INFO] Starting Apache Jena Fuseki..."

# Start Fuseki - Fuseki 4.x compatible (minimal args)
# Set FUSEKI_BASE via environment variable instead of command line
export FUSEKI_BASE="${FUSEKI_BASE}"

exec "${FUSEKI_HOME}/fuseki-server" \
    --port=3030 \
    --config="${CONFIG_FILE}"
        [ -f "${TTL_FILE}" ] || continue
        echo "[INFO] Uploading data via HTTP: ${TTL_FILE}"
        curl -s -X POST \
            "http://localhost:3030/${DATASET}/data" \
            --data-binary "@${TTL_FILE}" \
            -H "Content-Type: text/turtle" \
            -u "admin:${ADMIN_PASSWORD}"
    done

    touch "${MARKER_FILE}"
    echo "[INFO] HTTP data loading complete. Marker written."

    # Hand off to foreground
    wait ${FUSEKI_PID}
else
    # Normal foreground start
    exec "${FUSEKI_HOME}/fuseki-server" \
        --port=3030 \
        --passwd="${SHIRO_FILE}" \
        --config="${CONFIG_FILE}" \
        --base="${FUSEKI_BASE}"
fi
