# SeaSight — Collaborative Marine Incident & Beach Monitoring Platform

> **SeaSight** es una plataforma web colaborativa orientada a la geolocalización de incidencias costeras en tiempo real, consulta del estado de las playas y divulgación de la biodiversidad marina.

---

## 📌 About The Project

**SeaSight** resuelve la falta de información unificada y en tiempo real sobre el estado del litoral y la seguridad marítima. A través de un mapa interactivo alimentado por la comunidad y moderado por administradores, los usuarios pueden reportar avisos geolocalizados (medusas, vertidos, objetos a la deriva, emergencias), validar la veracidad de los reportes comunitarios y consultar información ambiental relevante.

### Key Features

- 🗺️ **Interactive Real-Time Map:** Visualización y filtrado de incidencias geolocalizadas mediante mapas dinámicos.
- 🚨 **Community Alert System:** Publicación de avisos con categorización, descripción e imágenes adjuntas.
- 🛡️ **Crowdsourced Validation ($N:M$ Relationship):** Sistema de votación comunitaria para marcar avisos falsos u obsoletos y mantener la calidad de la información.
- 🏖️ **Beach Live Status:** Consulta de banderas oficiales, avisos institucionales y condiciones del entorno.
- 🪸 **Marine Biodiversity Catalog:** Ficha pedagógica de flora y fauna marina asociada a cada playa.
- 🔐 **Role-Based Access Control (RBAC):** Autenticación segura mediante JWT y contraseñas cifradas con `bcrypt`.
- ⚙️ **Admin Dashboard:** Panel de moderación para gestión de incidencias e información oficial.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Language:** React.js + TypeScript
- **HTTP Client (API Integration):** Axios / Fetch API
- **UI & Icons:** Tailwind CSS / CSS3, Lucide Icons

### Mapping & Geospatial Services
- **Map Rendering Library:** Leaflet.js (`react-leaflet`)
- **Map Tile Providers:** OpenStreetMap (Base Layer), OpenSeaMap (Marine Navigation Layer)
- **Geocoding API:** Nominatim (Search & Reverse Geocoding)

### External Data APIs
- **Marine Weather & Conditions:** Open-Meteo Marine API (Waves, Wind, Water Temp)
- **Biodiversity & Species Catalog:** iNaturalist API / GBIF API

### Backend & Database
- **Framework:** Java (Spring Boot / REST API)
- **Database:** PostgreSQL / MySQL
- **Security & Auth:** Spring Security, JSON Web Tokens (JWT), Bcrypt password hashing

### Developer Tools & Agile Planning
- **API Testing & Documentation:** Postman
- **Version Control:** Git & GitHub
- **Project Management:** GitHub Projects (Scrum Kanban)

---

## 📐 Architecture & Agile Planning

The project development follows the **Scrum methodology**, split into 4 two-week sprints.
- **Database Design:** Esquema relacional de 5 tablas optimizado con tabla intermedia (`validar_alerta`) para gestionar la relación muchos a muchos ($N:M$) de validación comunitaria.
- **Project Board:** Planificación y seguimiento del proyecto disponible en [GitHub Projects](https://github.com/users/alexdruig/projects/1).

---

## 🚀 Getting Started

* **Node.js** (v18+) y **npm**
* **Java JDK** (v17+)
* **MySQL** o **PostgreSQL** en ejecución

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/seasight-app.git 
