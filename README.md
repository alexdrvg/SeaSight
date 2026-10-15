# SeaSight — Collaborative Marine Incident & Beach Monitoring Platform

> SeaSight es una plataforma web colaborativa orientada a la geolocalización de incidencias costeras en tiempo real, consulta del estado de las playas y divulgación de la biodiversidad marina.

---

## 📌 About The Project

SeaSight resuelve la falta de información unificada y en tiempo real sobre el estado del litoral y la seguridad marítima. A través de un mapa interactivo alimentado por la comunidad y respaldado por datos oficiales y caché distribuida, los usuarios pueden reportar avisos geolocalizados (medusas, vertidos, objetos a la deriva, emergencias), consultar el estado de las banderas y verificar información ambiental relevante.

### Key Features

- 🗺️ **Interactive Real-Time Map:** Visualización y filtrado de incidencias geolocalizadas mediante mapas dinámicos.
- 🚨 **Community Alert System:** Publicación de avisos con categorización, descripción e imágenes adjuntas.
- 🛡️ **Crowdsourced Validation & Fallback:** Sistema de validación comunitaria y estrategia de contingencia (Pla B) con almacenamiento en la red Edge para asegurar la continuidad del servicio si las APIs externas caen.
- 🏖️ **Beach Live Status:** Consulta de banderas oficiales, avisos institucionales y condiciones del entorno marítimo.
- 🪸 **Marine Biodiversity Catalog:** Ficha pedagógica de flora y fauna marina (medusas, especies protegidas) asociada a cada playa.
- 🔍 **Smart Geocoding & Beach Resolution:** Buscador inteligente con sugerencias automáticas de playas concretas dentro de un municipio.
- ⚙️ **Admin Dashboard:** Panel de moderación para gestión de incidencias e información oficial.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Language:** React.js + TypeScript (`.tsx`)
- **HTTP Client (API Integration):** Fetch API / Axios
- **UI & Icons:** Tailwind CSS, Lucide Icons, FontAwesome / Custom SVGs (medusas, banderas, marcadores vectoriales)

### Mapping & Geospatial Services
- **Map Rendering Library:** Leaflet.js (`react-leaflet`)
- **Map Tile Providers:** OpenStreetMap (Base Layer), OpenSeaMap (Marine Navigation Layer)
- **Geocoding API:** Nominatim API (Search & Reverse Geocoding con cabecera `User-Agent`)

### External Data APIs
- **Official Beach Status:** Generalitat de Catalunya (Socrata API)
- **Marine Weather & Conditions:** Open-Meteo Marine API (Waves, Wind, Water Temp)
- **Biodiversity & Species Catalog:** iNaturalist API & GBIF API (Avistamientos y fauna marina)

### Serverless Backend & Database (Edge Architecture)
- **Runtime Environment:** Cloudflare Pages & Cloudflare Workers (TypeScript)
- **Database:** Cloudflare D1 (Serverless SQLite at the Edge)
- **Caching & Fallback Strategy (Pla B):** Almacenamiento local e histórico en D1 para consulta de datos cuando las APIs externas no respondan.

### Developer Tools & Agile Planning
- **UI/UX Prototyping:** Penpot
- **API Testing & Documentation:** Postman
- **Version Control:** Git & GitHub
- **Project Management:** GitHub Projects (Scrum Kanban)

---

## 📐 Architecture & Agile Planning

The project development follows the Scrum methodology, split into 4 two-week sprints.

- **Edge Architecture:** Enfoque *Serverless/Frontend-Centric* en React TSX apoyado por Cloudflare Workers para actuar como proxy middleware y gestionar el estado de contingencia.
- **Database Design (D1 SQLite):** Esquema relacional ligero optimizado para la caché de datos oficiales (`beaches_cache`) y la gestión de reportes comunitarios de incidencias (`community_reports`).
- **Project Board:** Planificación y seguimiento del proyecto disponible en GitHub Projects.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18+ y `npm`
- **Cloudflare Wrangler CLI:** Para gestión local y despliegue en Cloudflare D1 / Workers (`npm i -g wrangler`)

### Installation & Setup

- **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/seasight-app.git](https://github.com/tu-usuario/seasight-app.git)