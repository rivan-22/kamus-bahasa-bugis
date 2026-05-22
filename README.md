# Kamus Bugis

A digital dictionary application for the Bugis language built with Semantic Web technology. The application features an AI-powered Q&A system using Groq API for intelligent querying about the Bugis language. It integrates Apache Jena Fuseki (RDF database), Spring Boot Backend, and React Frontend.

---

## Key Features

- **Dynamic Word Search**: Search Bugis words with Indonesian/English translations
- **Ask AI (RAG)**: AI-powered Q&A about the Bugis language using Groq API
- **Responsive Design**: Mobile-friendly and user-friendly interface
- **Semantic RDF**: Database using RDF for semantic search capabilities
- **Docker Ready**: Quick setup with Docker Compose

---

## Prerequisites

Before running the application, ensure you have installed:

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: Usually included with Docker Desktop
- **Git**: For cloning the repository

For local development without Docker:
- **Java 21+**: [Download JDK 21](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.8+**: Usually included with the backend
- **Node.js 18+** & **pnpm**: For frontend
- **Git**: Version control

### Verify Installation

```bash
# Check Docker
docker --version
docker-compose --version

# Check Java (if doing local development)
java -version

# Check Node & pnpm (if doing local development)
node --version
pnpm --version
```

---

## Quickstart - Running with Docker (Recommended)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/bugis-dictionary.git
cd bugis-dictionary
```

### 2. Setup Environment Variables

```bash
# Copy from template
cp .env.example .env
```

**Edit `.env` and adjust the values:**

```env
# Fuseki Configuration
FUSEKI_URL=http://fuseki:3030
FUSEKI_DATASET=bugis
ADMIN_PASSWORD=admin

# Groq AI API Key (required for Ask AI feature)
# Get it for free at: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Build & Run Docker Containers

```bash
# Build and run all services (Fuseki + Backend + Frontend)
docker-compose up --build

# Or run in background mode
docker-compose up -d --build
```

**Running services:**
- **Fuseki**: http://localhost:3030 (RDF Database)
- **Backend**: http://localhost:8080 (Spring Boot API)
- **Frontend**: http://localhost:5173 (React Dev Server) or http://localhost (Production)

### 4. Access the Application

```
Frontend: http://localhost:5173
Backend API: http://localhost:8080
Fuseki Admin: http://localhost:3030
```

### 5. Stop Containers

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (data will be deleted)
docker-compose down -v
```

---

## Local Development Setup (Without Docker)

For development with hot-reload, run services separately:

### A. Setup Fuseki (RDF Database)

```bash
# Option 1: Run with Docker (recommended)
docker run -d \
  -p 3030:3030 \
  -v $(pwd)/fuseki/run:/app/fuseki/run \
  --name kamus-bugis-fuseki \
  aksw/fuseki-vanilla:6.1.0

# Option 2: Install Fuseki locally from https://jena.apache.org/download/index.html
```

### B. Setup & Run Backend

```bash
cd backend

# Build project
./mvnw clean package -DskipTests

# Run Spring Boot
./mvnw spring-boot:run

# Backend running at: http://localhost:8080
```

**Backend environment variables** (`application.properties`):
```properties
fuseki.url=http://localhost:3030
fuseki.dataset=bugis
groq.api.key=${GROQ_API_KEY}
```

### C. Setup & Run Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Development server with hot-reload
pnpm dev

# Frontend at: http://localhost:5173
```

---

## 📂 Project Structure

```
bugis-dictionary/
├── backend/                    # Spring Boot Java Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/          # Source code
│   │   │   ├── resources/      # Config files (application.properties)
│   │   └── test/              # Test cases
│   ├── pom.xml                # Maven dependencies
│   ├── Dockerfile             # Docker image configuration
│   └── mvnw                   # Maven wrapper
│
├── frontend/                  # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── api/               # Backend API calls
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── package.json           # pnpm dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tsconfig.json          # TypeScript config
│   ├── index.html             # HTML entry
│   └── .env.local             # Local environment variables
│
├── fuseki/                    # Apache Jena Fuseki Configuration
│   └── run/                   # Fuseki data & configuration (generated)
│
├── docker-compose.yml         # Multi-container orchestration
├── .env.example               # Environment variables template
├── .env                       # Actual env vars (git-ignored)
└── README.md                  # Documentation (this file)
```

---

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=KamusControllerTest
```

### Frontend Testing

```bash
cd frontend

# Run Vitest (if configured)
pnpm test
```

---

## Troubleshooting

### 1. Backend cannot connect to Fuseki

**Problem**: `Connection refused` when backend starts
```
ERROR: java.net.ConnectException: Connection refused
```

**Solution**:
```bash
# Make sure Fuseki is running
docker ps | grep fuseki

# Check Fuseki health
curl http://localhost:3030/$/ping

# Restart services
docker-compose restart fuseki backend
```

### 2. Frontend blank / not loading

**Problem**: Empty page or 404 error
```bash
# Clear cache & rebuild
rm -rf frontend/node_modules frontend/dist
pnpm install
pnpm build

# Check VITE_API_BASE_URL in .env.local
cat frontend/.env.local
```

### 3. Groq AI not working

**Problem**: Ask AI feature error
```
ERROR: Groq API key not found
```

**Solution**:
```bash
# 1. Get free API key at https://console.groq.com/keys
# 2. Update .env
echo "GROQ_API_KEY=your_key_here" >> .env

# 3. Restart backend
docker-compose restart backend
```

### 4. Port already in use

**Problem**: `Port 3030 already in use`
```bash
# Kill process using the port
lsof -i :3030
kill -9 <PID>

# Or use a different port in docker-compose.yml
# Change "3030:3030" to "3031:3030"
```

### 5. Out of Memory (OOM)

**Problem**: Docker container crash with OOM
```bash
# Edit docker-compose.yml - increase Fuseki JVM memory
services:
  fuseki:
    environment:
      JVM_ARGS: "-Xmx4g -Xms1g"  # Increase from 2g to 4g
```

---

## Website Demo Documentation

### Demo Features & Flow

#### 1. **Landing Page / Home**
- Application introduction
- Quick search bar for direct search
- Featured words from dictionary
- Call-to-action to explore the dictionary

**Path**: `http://localhost:5173/`

#### 2. **Dictionary Browse**
- List of all words in database
- Filter by category/first letter
- Pagination for navigation
- Click to view details

**Path**: `http://localhost:5173/dictionary`

#### 3. **Search & Detail**
- Search bar with auto-complete
- Results display:
  - Word in Bugis language
  - Indonesian & English translations
  - Category/Part of Speech
  - Usage examples (if available)
  - Related words

**Path**: `http://localhost:5173/search?q=kalompoang`

#### 4. **Ask AI (Q&A with RAG)**
- Chat interface for asking about Bugis language
- Input questions in Indonesian/English/Bugis
- AI responds using Groq LLM + RAG from dictionary database
- Chat history saved

**Path**: `http://localhost:5173/tanya-ai`

**Example questions:**
- "What is the meaning of kalompoang in Bugis?"
- "Give me 5 Bugis words for 'house'"
- "How do I use the suffix -na in Bugis language?"

#### 5. **About Page**
- About the project
- Developer team
- Technologies used
- License information

**Path**: `http://localhost:5173/about`

### User Workflows

#### Workflow 1: Search for Specific Word
```
1. User opens homepage
2. Input word in search bar (e.g.: "kalompoang")
3. View search results with translations & details
4. Click related words to explore further
```

#### Workflow 2: Browse Dictionary
```
1. Click "Dictionary" or "Kamus" menu
2. View word list (sorted alphabetically)
3. Filter by first letter (A, B, C, etc.)
4. Click word to view full details
```

#### Workflow 3: Ask AI about Bugis Language
```
1. Open "Ask AI" page
2. Type question: "What's the difference between -na and -ku suffixes?"
3. AI responds with explanation + examples from database
4. Continue conversation with follow-up questions
```

### API Endpoints (for Developers)

#### Backend REST API

**Base URL**: `http://localhost:8080`

**Endpoints**:
```bash
# Search for word
GET /api/kamus/search?q=kalompoang

# Get all words
GET /api/kamus/all?page=0&size=20

# Get word details
GET /api/kamus/{id}

# Get words by category
GET /api/kamus/kategori/{kategori}

# Ask AI endpoint
POST /api/ai/tanya
Body: {
  "pertanyaan": "What does kalompoang mean?",
  "context": "chat_history"
}
```

#### SPARQL Endpoint (Fuseki)

**URL**: `http://localhost:3030/bugis/sparql`

**Example Query** (find all noun words):
```sparql
PREFIX kamus: <http://example.org/kamus/>
SELECT ?word ?meaning ?kategori
WHERE {
  ?word rdf:type kamus:Word ;
        kamus:meaning ?meaning ;
        kamus:kategori ?kategori ;
        FILTER REGEX(?kategori, "noun", "i")
}
LIMIT 50
```

---

## 📚 Additional Resources

- **Apache Jena Documentation**: https://jena.apache.org/documentation/
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React + TypeScript**: https://react.dev/
- **RDF & Semantic Web**: https://www.w3.org/RDF/
- **Groq AI**: https://console.groq.com/docs/

---
