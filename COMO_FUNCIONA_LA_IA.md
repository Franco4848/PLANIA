# 🤖 Cómo funciona la IA en PLANIA

## 📊 Flujo completo explicado

### 1. **Usuario configura y envía prompt**
```
Frontend → POST /ia/itinerario
{
  "prompt": "Itinerario de 3 días con cafeterías",
  "userPosition": { "lat": -34.6037, "lng": -58.3816 },
  "filtros": {
    "tipos": ["cafetería"],
    "presupuesto": { "min": 0, "max": 50000 },
    "dias": 3
  }
}
```

### 2. **Groq genera itinerario (IA inventa todo)**

**Lo que hace Groq:**
- ✅ Genera nombres genéricos de lugares ("Café moderno", "Cafetería artesanal")
- ✅ Inventa horarios realistas ("10:00-12:00")
- ✅ **INVENTA precios** basándose en el tipo y presupuesto
- ✅ Crea descripciones ("Ambiente acogedor con café de especialidad")
- ✅ Organiza por días y temas

**Ejemplo de salida de Groq:**
```json
{
  "dias": [
    {
      "dia": 1,
      "tema": "Cafés de especialidad",
      "actividades": [
        {
          "tipo": "cafetería",
          "nombre": "Café Moderno",
          "horario": "10:00-12:00",
          "presupuesto_estimado": 3000,
          "descripcion": "Café de especialidad con ambiente acogedor"
        },
        {
          "tipo": "cafetería",
          "nombre": "Cafetería Artesanal",
          "horario": "14:00-16:00",
          "presupuesto_estimado": 2500,
          "descripcion": "Repostería casera y café orgánico"
        }
      ]
    }
  ],
  "presupuesto_total": 15000,
  "recomendaciones": ["Llevar efectivo", "Reservar con anticipación"]
}
```

### 3. **Backend enriquece con datos REALES de Google Places**

Para cada actividad que Groq inventó:

```typescript
// Busca lugares reales del mismo tipo cerca del usuario
const lugaresReales = await buscarEnGooglePlaces(
  userPosition.lat,
  userPosition.lng,
  "cafetería"  // El tipo que Groq sugirió
);

// Selecciona un lugar REAL que no se haya usado antes
// Reemplaza el nombre inventado por el nombre real
```

**Lo que Google Places proporciona:**
- ✅ Nombre real del lugar
- ✅ Dirección real
- ✅ Rating (⭐)
- ✅ Coordenadas GPS exactas
- ❌ **NO proporciona precios** (se mantienen los de Groq)

**Resultado final:**
```json
{
  "tipo": "cafetería",
  "nombre": "Café Moderno",              // ← Inventado por Groq
  "nombreReal": "Lattente Café",         // ← Real de Google Places
  "direccion": "Av. Corrientes 1234",    // ← Real
  "rating": 4.7,                         // ← Real
  "coordenadas": { "lat": -34.6, "lng": -58.4 },  // ← Real
  "horario": "10:00-12:00",              // ← Inventado por Groq
  "presupuesto_estimado": 3000,          // ← Inventado por Groq
  "dia": 1
}
```

---

## 🔍 Limitaciones actuales y soluciones

### ❌ **Problema 1: Lugares repetidos**

**Causa:** Google Places devuelve los mismos lugares en el mismo orden cada vez.

**Ejemplo:**
```
Actividad 1: "cafetería" → Google devuelve [A, B, C, D]
Actividad 2: "cafetería" → Google devuelve [A, B, C, D]
Actividad 3: "cafetería" → Google devuelve [A, B, C, D]

Antes: Siempre tomaba A, A, A
Ahora: Toma A, B, C (evita duplicados)
```

**✅ Solución implementada:**
```typescript
const lugaresUsados = new Set<string>();

// Para cada actividad, busca el primer lugar NO usado
for (const lugar of lugaresReales) {
  if (!lugaresUsados.has(lugar.nombre)) {
    lugarReal = lugar;
    lugaresUsados.add(lugar.nombre);
    break;
  }
}
```

**Limitación:** Si pides más actividades que lugares disponibles, se repetirán.

---

### ❌ **Problema 2: Búsqueda limitada por ubicación**

**Causa:** Google Places busca en un **radio de 3 km** desde tu ubicación.

```typescript
// En actividades.service.ts
const radius = 3000; // 3 km
```

**Consecuencias:**
- Si estás en una zona con pocas cafeterías, siempre verás las mismas
- Si estás en el centro, hay más variedad

**✅ Soluciones posibles:**

1. **Aumentar el radio** (puede traer lugares muy lejanos):
```typescript
const radius = 5000; // 5 km
```

2. **Búsqueda por nombre** (más preciso pero más lento):
```typescript
// En lugar de buscar por tipo, buscar por nombre sugerido por Groq
const query = `${actividad.nombre} ${actividad.tipo}`;
// Buscar "Café Moderno cafetería" en Google Places
```

3. **Paginación de resultados** (obtener más lugares):
```typescript
// Actualmente solo toma la primera página (20 resultados)
// Podría obtener hasta 60 resultados (3 páginas)
```

---

### ❌ **Problema 3: Precios inventados**

**Causa:** Google Places API no proporciona precios de lugares.

**Alternativas:**

1. **Mantener precios de Groq** (actual)
   - ✅ Rápido
   - ❌ No son reales

2. **Scraping de sitios web** (complejo y lento)
   - Buscar en TripAdvisor, Google Maps web, etc.
   - ❌ Viola términos de servicio
   - ❌ Muy lento

3. **Base de datos propia**
   - Usuarios reportan precios
   - ✅ Datos reales
   - ❌ Requiere mucho trabajo inicial

4. **Rangos de precio de Google** (limitado)
   - Google Places tiene `price_level` (0-4)
   - 0 = Gratis, 1 = $, 2 = $$, 3 = $$$, 4 = $$$$
   - Groq podría usar esto para estimar mejor

---

## 📋 Logging detallado implementado

Ahora cuando generes un itinerario, verás en la consola del backend:

```
🔑 API Key detectada (primeros 10 caracteres): gsk_abc123...
🔑 Longitud de la API Key: 56
✅ Groq SDK inicializado correctamente

📝 Generando itinerario con: { prompt: "...", filtros: {...} }
✅ Itinerario generado por Groq

🔍 Iniciando enriquecimiento con Google Places...
📋 Itinerario generado por Groq: {
  "dias": [
    {
      "dia": 1,
      "tema": "Cafés de especialidad",
      "actividades": [...]
    }
  ],
  "presupuesto_total": 15000
}

📅 Procesando Día 1 - Cafés de especialidad

  🎯 Actividad: Café Moderno (cafetería)
     Horario: 10:00-12:00
     Presupuesto estimado: $3000
     ✅ Encontrados 25 lugares de tipo "cafetería"
     ✨ Lugar seleccionado: Lattente Café (⭐ 4.7)

  🎯 Actividad: Cafetería Artesanal (cafetería)
     Horario: 14:00-16:00
     Presupuesto estimado: $2500
     ✅ Encontrados 25 lugares de tipo "cafetería"
     ✨ Lugar seleccionado: Full City Coffee (⭐ 4.6)

✅ Enriquecimiento completado. Total de lugares: 6
📍 Lugares únicos usados: 6
```

---

## 🚀 Mejoras sugeridas

### Corto plazo (fácil)

1. **Aumentar radio de búsqueda**
```typescript
// actividades.service.ts, línea 21
const radius = 5000; // De 3km a 5km
```

2. **Obtener más resultados de Google**
```typescript
// Procesar hasta 3 páginas (60 lugares en lugar de 20)
while (pagetoken && attempts < 3) { // Cambiar de 1 a 3
```

3. **Usar price_level de Google**
```typescript
// Ajustar presupuestos de Groq según price_level
if (lugar.price_level) {
  presupuesto_estimado = lugar.price_level * 5000; // $, $$, $$$, $$$$
}
```

### Mediano plazo (moderado)

1. **Búsqueda por nombre + tipo**
   - Groq sugiere "Café Tortoni"
   - Backend busca específicamente "Café Tortoni" en Google
   - Si no existe, busca por tipo

2. **Caché de lugares**
   - Guardar lugares ya buscados en memoria
   - Evitar llamadas repetidas a Google Places

3. **Filtro de distancia en frontend**
   - Usuario elige: "Cerca (3km)", "Medio (5km)", "Lejos (10km)"

### Largo plazo (complejo)

1. **Base de datos de lugares**
   - Guardar lugares visitados
   - Usuarios agregan precios reales
   - Sistema de ratings propio

2. **IA contextual avanzada**
   - Groq recibe lista de lugares reales disponibles
   - Genera itinerario solo con lugares que existen
   - Más preciso pero más lento

---

## 🧪 Cómo probar el logging

1. **Inicia el backend en modo dev:**
```bash
cd plania-backend
npm run start:dev
```

2. **Genera un itinerario desde el frontend**

3. **Observa la consola del backend** para ver:
   - Qué generó Groq (JSON completo)
   - Cuántos lugares encontró Google para cada tipo
   - Qué lugares seleccionó (evitando duplicados)
   - Cuántos lugares únicos usó en total

4. **Experimenta con diferentes prompts:**
   - "Solo cafeterías" → Verás si se repiten
   - "Museos y parques" → Más variedad
   - "3 días de restaurantes" → Verás el límite de lugares disponibles

---

## 📊 Resumen de qué es real vs inventado

| Dato | Fuente | ¿Es real? |
|------|--------|-----------|
| Nombre del lugar | Google Places | ✅ Real |
| Dirección | Google Places | ✅ Real |
| Rating (⭐) | Google Places | ✅ Real |
| Coordenadas GPS | Google Places | ✅ Real |
| Horario de visita | Groq (IA) | ❌ Inventado |
| Precio | Groq (IA) | ❌ Inventado |
| Descripción | Groq (IA) | ❌ Inventada |
| Tema del día | Groq (IA) | ❌ Inventado |
| Recomendaciones | Groq (IA) | ❌ Inventadas |

**Conclusión:** Los lugares son reales y visitables, pero horarios y precios son estimaciones de la IA.
