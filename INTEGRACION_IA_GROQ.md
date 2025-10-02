# Integración de IA con Groq - PLANIA

## 📋 Resumen

Se ha implementado un sistema completo de generación de itinerarios usando **Groq LLM** con el modelo `llama-3.3-70b-versatile`. El flujo permite al usuario:

1. Seleccionar filtros visuales (tipos de lugares, presupuesto, días)
2. Describir su viaje ideal en lenguaje natural
3. Obtener un itinerario estructurado con lugares reales de Google Places
4. Visualizar la ruta en el mapa interactivo
5. Regenerar con filtros ajustados

---

## 🏗️ Arquitectura

### Backend (NestJS)

```
plania-backend/src/ia/
├── dto/
│   └── generar-itinerario.dto.ts    # Validación de entrada
├── ia.controller.ts                 # POST /ia/itinerario
├── ia.service.ts                    # Lógica de Groq + enriquecimiento
└── ia.module.ts                     # Módulo NestJS
```

**Flujo del backend:**
1. Recibe `{ prompt, userPosition, filtros }` del frontend
2. Construye system prompt con restricciones (tipos, presupuesto, días)
3. Llama a Groq para generar itinerario en JSON
4. Para cada actividad, busca lugares reales en Google Places
5. Construye `rutaDatos` con `destino` y `waypoints` para el mapa
6. Devuelve JSON enriquecido

### Frontend (React + Vite)

```
plania-project/src/
├── services/
│   └── ia.js                        # fetch a /ia/itinerario
├── components/
│   ├── ChatIA.jsx                   # Filtros + input de chat
│   └── ItinerarioPanel.jsx          # Visualización por días
└── App.jsx                          # Integración con Mapa.jsx
```

**Flujo del frontend:**
1. Usuario configura filtros y escribe prompt
2. `ChatIA` llama a `generarItinerario()`
3. Resultado se pasa a `ItinerarioPanel` (lista de actividades)
4. Simultáneamente, `rutaDatos` se pasa a `Mapa.jsx` para dibujar ruta
5. Botón "Regenerar" limpia estado y vuelve al chat

---

## 🔧 Configuración

### 1. Variables de entorno (Backend)

Crea `plania-backend/.env`:

```env
GOOGLE_PLACES_API_KEY=tu_google_places_api_key
GROQ_API_KEY=tu_groq_api_key
```

**Obtener API Keys:**
- **Google Places**: https://console.cloud.google.com/apis/credentials
- **Groq**: https://console.groq.com/keys (gratis, sin tarjeta)

### 2. Instalar dependencias

```bash
# Backend
cd plania-backend
npm install

# Frontend (ya instalado)
cd ../plania-project
npm install
```

### 3. Iniciar servicios

```bash
# Terminal 1: Backend
cd plania-backend
npm run start:dev

# Terminal 2: Frontend
cd plania-project
npm run dev
```

---

## 🎯 Uso

### Ejemplo de interacción

1. **Abrir pestaña "IA"** en la navbar
2. **Configurar filtros:**
   - Días: `3`
   - Presupuesto: `$50,000`
   - Tipos: ✅ Museos, ✅ Restaurantes, ✅ Parques
3. **Escribir prompt:**
   ```
   Quiero un itinerario cultural y relajado, con buena gastronomía
   y espacios al aire libre. Prefiero actividades por la mañana.
   ```
4. **Click "Generar itinerario"**
5. **Resultado:**
   - Panel con 3 días de actividades
   - Mapa con ruta dibujada
   - Presupuesto total y recomendaciones

### Refinamiento

- Click en **"🔄 Regenerar"** → Vuelve al chat
- Ajusta filtros (ej: quitar Museos, agregar Cines)
- Mismo prompt, nueva llamada con filtros actualizados

---

## 📡 API Endpoint

### `POST /ia/itinerario`

**Request:**
```json
{
  "prompt": "Itinerario de 3 días en Buenos Aires, cultural y relajado",
  "userPosition": {
    "lat": -34.6037,
    "lng": -58.3816
  },
  "filtros": {
    "tipos": ["museo", "restaurante", "parque"],
    "presupuesto": {
      "min": 0,
      "max": 50000
    },
    "dias": 3
  }
}
```

**Response:**
```json
{
  "itinerario": {
    "dias": [
      {
        "dia": 1,
        "tema": "Arte y cultura",
        "actividades": [
          {
            "tipo": "museo",
            "nombre": "Museo de arte moderno",
            "horario": "10:00-13:00",
            "presupuesto_estimado": 5000,
            "descripcion": "Colección de arte latinoamericano"
          }
        ]
      }
    ],
    "presupuesto_total": 45000,
    "recomendaciones": ["Llevar calzado cómodo", "Reservar con anticipación"]
  },
  "lugares": [
    {
      "tipo": "museo",
      "nombre": "Museo de arte moderno",
      "nombreReal": "MALBA - Museo de Arte Latinoamericano",
      "direccion": "Av. Figueroa Alcorta 3415",
      "rating": 4.7,
      "coordenadas": { "lat": -34.5771, "lng": -58.4054 },
      "horario": "10:00-13:00",
      "presupuesto_estimado": 5000,
      "dia": 1
    }
  ],
  "destino": { "lat": -34.5771, "lng": -58.4054 },
  "waypoints": [
    { "location": { "lat": -34.5771, "lng": -58.4054 }, "stopover": true }
  ],
  "presupuesto_total": 45000,
  "recomendaciones": ["Llevar calzado cómodo"]
}
```

---

## 🧪 Pruebas

### Prompt de ejemplo 1: Viaje familiar
```
Itinerario de 2 días para familia con niños, presupuesto moderado.
Queremos parques, actividades al aire libre y lugares para comer.
```

### Prompt de ejemplo 2: Viaje cultural
```
3 días enfocados en museos, galerías de arte y buena gastronomía.
Presupuesto alto, preferencia por lugares con historia.
```

### Prompt de ejemplo 3: Viaje económico
```
1 día con presupuesto bajo, actividades gratuitas o baratas.
Parques, plazas y cafeterías económicas.
```

---

## 🔍 Detalles técnicos

### System Prompt de Groq

El backend construye dinámicamente un system prompt que:
- Restringe tipos de lugares según filtros
- Establece límite de presupuesto
- Define cantidad de días
- Exige formato JSON estricto (sin markdown)
- Sugiere 3-5 actividades por día

### Enriquecimiento con Google Places

Para cada actividad sugerida por Groq:
1. Se busca en Google Places por `tipo` y `userPosition`
2. Se toma el primer resultado (mejor rating)
3. Se agregan coordenadas reales, dirección, rating
4. Si no se encuentra, se mantiene sugerencia de IA con `coordenadas: null`

### Integración con Mapa.jsx

`Mapa.jsx` ya estaba preparado para recibir `rutaDatos`:
```javascript
useEffect(() => {
  if (!userPosition || !rutaDatos) return;
  
  const { destino, waypoints } = rutaDatos;
  // Calcula ruta con Google Directions API
}, [rutaDatos, userPosition]);
```

---

## 🚀 Próximas mejoras

- [ ] Guardar itinerarios en base de datos
- [ ] Compartir itinerarios por link
- [ ] Exportar a PDF
- [ ] Modo "editar actividad" (cambiar horario, eliminar, reordenar)
- [ ] Integración con clima para sugerencias dinámicas
- [ ] Historial de prompts para regenerar rápido
- [ ] Soporte multiidioma

---

## 🐛 Troubleshooting

### Error: "La IA no generó un JSON válido"
- **Causa**: Groq devolvió texto con markdown o formato incorrecto
- **Solución**: El service ya limpia markdown automáticamente. Si persiste, revisar `temperature` (actualmente 0.7)

### Error: "No se encontraron lugares"
- **Causa**: Tipos de filtro muy restrictivos o ubicación sin resultados
- **Solución**: Ampliar tipos permitidos o ajustar radio de búsqueda en `actividades.service.ts` (actualmente 3km)

### Ruta no se dibuja en el mapa
- **Causa**: `coordenadas: null` en todos los lugares
- **Solución**: Verificar `GOOGLE_PLACES_API_KEY` y que tenga Places API habilitada

### Backend no inicia
- **Causa**: Falta `GROQ_API_KEY` en `.env`
- **Solución**: Crear `.env` basado en `.env.example` y agregar key válida

---

## 📝 Notas de implementación

- **Modelo usado**: `llama-3.3-70b-versatile` (rápido, gratuito, buen JSON)
- **Temperatura**: 0.7 (balance creatividad/precisión)
- **Max tokens**: 2048 (suficiente para 7 días con 5 actividades/día)
- **Radio de búsqueda**: 3km desde `userPosition`
- **Tipos soportados**: museo, restaurante, parque, cafetería, galería, cine

---

## 👤 Autor

Implementado para el proyecto PLANIA - Sistema de planificación de viajes con IA.
