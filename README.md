## PLANIA – Planificador de actividades turísticas

PLANIA es una aplicación web que ayuda a turistas a planificar recorridos personalizados según su ubicación, intereses, clima, presupuesto, cantidad de personas y días disponibles.

El sistema incorpora una inteligencia artificial local (Ollama con modelo phi4-mini) que recomienda actividades relevantes y genera un itinerario visualizable y editable. El usuario puede ver la ruta en el mapa, ajustar su experiencia y recibir sugerencias dinámicas adaptadas a su perfil.

Además, el rol de administrador incluye herramientas para gestionar usuarios y revisar sugerencias enviadas por los turistas, facilitando la mejora continua del sistema.

## Problemática

Organizar actividades turísticas suele ser un proceso engorroso, especialmente en destinos desconocidos. Los viajeros pierden tiempo buscando recomendaciones locales, enfrentan información dispersa y no siempre logran una experiencia personalizada.

PLANIA resuelve esta problemática ofreciendo:

    - Ubicación en tiempo real del turista.

    - Recomendaciones inteligentes basadas en IA.

    - Actividades filtradas por clima, ubicación, intereses y preferencias.

    - Itinerario adaptable.

    - Visualización de rutas en mapa.

## Integrantes

Aguilera Rafael
Alvarez Franco
Cañas Tamara
Gonzalez Nicolas

## Tecnologías utilizadas

- Frontend: React.js
- Backend: Node.js + Express 
- APIs externas: Google Places (actividades cercanas al turista), Open-meteo (Clima actual en donde se encuentre)
- API: GraphQL (con Apollo Server)
- Testing:
    -Frontend: Vitest + React Testing Library

    -Backend: Supertest + Jest
- Control de versiones: Git + GitHub

## Herramientas utilizadas

- Base de datos: MongoDB (Compass)
- Inteligencia Artificial: Ollama con modelo phi4-mini (de forma local). phi4-mini es una inteligencia artificial desarrollada por Microsoft el cual esta lo mas optimizada posible para que pueda ser utilizada sin consumir demasiados recursos

## Instalación de la Inteligencia Artificial local (Ollama y modelo phi4-mini)

- Instalar Ollama: https://ollama.com/download
- Instalar siguiendo los pasos del instalador
- Una vez instalado abrir Ollama y buscar en la sección "Find model..." phi4-mini
- Enviar un mensaje cualquiera (Ej: Hola), comenzará la descarga del modelo una vez finalizado cerrar Ollama.

## Creación de archivo .env (Backend - plania-backend)

GOOGLE_PLACES_API_KEY= ingresa tu API key (Google)
MONGO_URI=mongodb://localhost... tu ruta de conexión MongoDB
JWT_SECRET= asigna una clave privada
PORT= asigna un puerto


##  Instalación del backend 

- Entrar al directorio del backend: cd plania-backend
- Instalar dependencias: npm install
- Levantar el servidor de desarrollo: npm run start:dev

## Creación de archivo .env (Frontend - plania-project)

VITE_GOOGLE_MAPS_API_KEY= Ingresa tu API key (Google)

## Instalación del frontend

- Entrar al directorio del frontend: cd plania-project
- Instalar dependencias: npm install
- Levantar el servidor de desarrollo: npm run dev

## Testing

- Backend:
    - Framework: Jest
    - Librería de testing de endpoints: Supertest
    - Cobertura: Pruebas unitarias y e2e
    - Instalación de herramientas de testing:
        npm install --save-dev jest supertest
    - Ejecución:
        - cd plania-backend
        - npm install --save-dev jest supertest
        - npm run test (unitarios)
        - npm run test:e2e (e2e)

- Frontend: 
    - Framework: Vitest
    - Librería de testing: React Testing Library
    - Entorno simulado: jsdom
    - Instalación de herramientas de testing:
        npm install --save-dev vitest @testing-library/react jsdom
    - Ejecución: 
     - cd plania-project
     - npm run test

# Endpoints REST implementados

- POST /api/login Autentica al usuario y devuelve un JWT válido.
- POST /api/register Registra un nuevo usuario en la base de datos.
- GET /users Lista todos los usuarios JWT + Rol admin
- GET /users/:id Obtiene un usuario por ID JWT
- PUT /users/:id Actualiza los datos de un usuario	JWT
- DELETE /users/:id	Elimina un usuario por ID	JWT + Rol admin
- GET /actividades/buscar Busca actividades turísticas en base a coordenadas y tipo de lugar.
- POST	/ia/recomendar Genera un plan turístico completo según ubicación, clima, intereses y preferencias.
- POST /rutas/guardar Guarda una nueva ruta para el usuario autenticado	JWT
- GET /rutas/mias Lista todas las rutas guardadas por el usuario JWT
- DELETE /rutas/:id	Elimina una ruta específica del usuario	JWT


- GET /api/test/ping Verifica que el servidor esté activo.
- GET /api/test/protected

## API GraphQL

funcionalidad de sugerencias de actividades que permite a los usuarios colaborar con el sistema proponiendo nuevas ideas o problemas que surjan para poder enriquecer el sistema.

- Usuario:

    Puede enviar sugerencias desde la interfaz principal.

    Las sugerencias incluyen el mensaje y el correo del usuario que la realizo.

- Administrador:

    Accede a un panel de gestión donde puede visualizar todas las sugerencias enviadas por los usuarios.

- Implementación técnica:

    GraphQL se utiliza para manejar las operaciones de envío y revisión de sugerencias:

    mutation createSuggestion para el usuario

    query getAllSuggestions para el administrador

    Las sugerencias se almacenan en MongoDB.    

Todas las dependencias necesarias para GraphQL (Apollo Server, NestJS GraphQL, etc.) están incluidas en el package.json. Solo necesitás ejecutar npm install para tener el entorno listo.

## Decisiones de diseño

- Se eligió GraphQL para permitir consultas precisas y flexibles entre frontend y backend.
- Se implementó Ollama localmente para evitar dependencias externas y garantizar rendimiento en dispositivos modestos.
- El sistema de sugerencias permite colaboración entre usuarios y administradores.
- Se priorizó una experiencia de usuario clara e intuitiva.
