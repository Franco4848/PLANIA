# PLANIA – Itinerario Turístico Inteligente

PLANIA es una aplicación web que permite a turistas planificar recorridos de actividades personalizados según su ubicación, intereses, clima y tiempo disponible. El sistema integra lógica de recomendación contextual y visualización dinámica en mapa, ofreciendo una experiencia adaptada y funcional.

# Integrantes
Aguilera Rafael
Alvarez Franco
Cañas Tamara
Gonzalez Nicolas

# Tecnologías utilizadas
- Frontend: React.js
- Backend: Node.js + Express (NestJS en refactor)
- APIs externas: Google Places, Open-meteo
- Control de versiones: Git + GitHub

#  Instalación del backend 

- cd plania-backend
- npm install
- .env: VITE_GOOGLE_MAPS_API_KEY=tu_api_key
- npm run start:dev

# Instalación del frontend
- cd plania-project
- npm install
- .env: VITE_GOOGLE_MAPS_API_KEY=tu_api_key 
- npm run dev