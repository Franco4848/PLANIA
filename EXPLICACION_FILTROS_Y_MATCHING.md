# 🔍 Cómo funciona el matching de filtros + chat

## 📊 Flujo completo de filtros a lugares

### 1. **Usuario configura filtros en el frontend**

```javascript
// ChatIA.jsx
const [filtros, setFiltros] = useState({
  tipos: ['cafetería', 'restaurante'],  // Seleccionados por el usuario
  presupuesto: { min: 0, max: 50000 },
  dias: 3
});
```

### 2. **Usuario escribe prompt**

```
"Quiero un itinerario relajado con buena gastronomía"
```

### 3. **Frontend envía TODO al backend**

```javascript
POST /ia/itinerario
{
  "prompt": "Quiero un itinerario relajado con buena gastronomía",
  "userPosition": { "lat": -34.6037, "lng": -58.3816 },
  "filtros": {
    "tipos": ["cafetería", "restaurante"],
    "presupuesto": { "min": 0, "max": 50000 },
    "dias": 3
  }
}
```

---

## 🤖 Cómo Groq interpreta los filtros

### Paso 1: Backend construye el system prompt

```typescript
// ia.service.ts - línea 78-117
const tiposPermitidos = filtros.tipos?.length
  ? filtros.tipos.join(', ')  // "cafetería, restaurante"
  : 'museo, restaurante, parque, cafetería, galería, cine, atracción turística';

const systemPrompt = `Eres un asistente experto en planificación de viajes.

RESTRICCIONES:
- Días: ${filtros.dias}                                    // 3
- Tipos de lugares permitidos: ${tiposPermitidos}          // "cafetería, restaurante"
- Presupuesto total: $${filtros.presupuesto.min} - $${filtros.presupuesto.max}  // $0 - $50000

FORMATO DE SALIDA (JSON válido):
{
  "dias": [
    {
      "dia": 1,
      "tema": "Cultura y arte",
      "actividades": [
        {
          "tipo": "cafetería",  // ← DEBE ser uno de los tipos permitidos
          "nombre": "Café Moderno",
          "horario": "10:00-12:00",
          "presupuesto_estimado": 3000
        }
      ]
    }
  ],
  "presupuesto_total": 45000
}

REGLAS:
1. Solo usa tipos de la lista permitida
2. Respeta el presupuesto total
...
`;
```

**Groq recibe:**
- Tipos permitidos: `"cafetería, restaurante"`
- Presupuesto: `$0 - $50000`
- Días: `3`
- Prompt del usuario: `"Quiero un itinerario relajado con buena gastronomía"`

**Groq interpreta:**
- "relajado" → Sugiere cafeterías (ambiente tranquilo)
- "buena gastronomía" → Sugiere restaurantes
- Solo puede usar tipos: `cafetería` o `restaurante` (los filtros limitan)
- Distribuye en 3 días
- Suma de presupuestos ≤ $50,000

---

## 🔗 Matching: Groq → Google Places

### Paso 2: Groq genera actividades

```json
{
  "dias": [
    {
      "dia": 1,
      "actividades": [
        { "tipo": "cafetería", "nombre": "Café Moderno", ... },
        { "tipo": "restaurante", "nombre": "Restaurante Gourmet", ... }
      ]
    }
  ]
}
```

### Paso 3: Backend busca lugares REALES en Google Places

Para cada actividad:

```typescript
// ia.service.ts - línea 176-181
const lugaresReales = await this.actividadesService.buscarEnGooglePlaces(
  userPosition.lat.toString(),    // -34.6037
  userPosition.lng.toString(),    // -58.3816
  actividad.tipo,                 // "cafetería"
);
```

**¿Qué hace `buscarEnGooglePlaces`?**

```typescript
// actividades.service.ts - línea 24-34
const tipoTraducido: Record<string, string> = {
  'cafetería': 'cafe',           // ← Traduce español → inglés de Google
  'restaurante': 'restaurant',
  'museo': 'museum',
  'parque': 'park',
  ...
};

const tipoGoogle = tipoTraducido[tipo] || tipo;  // "cafetería" → "cafe"
```

**Luego llama a Google Places API:**

```
GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
  ?location=-34.6037,-58.3816
  &radius=6000                    // 6 km
  &type=cafe                      // Tipo traducido
  &key=GOOGLE_API_KEY
```

**Google responde con lugares reales:**

```json
{
  "results": [
    {
      "name": "Lattente Café",
      "vicinity": "Av. Corrientes 1234",
      "rating": 4.7,
      "price_level": 2,  // $$ (moderado)
      "geometry": {
        "location": { "lat": -34.6, "lng": -58.4 }
      }
    },
    {
      "name": "Full City Coffee",
      "vicinity": "Av. Santa Fe 5678",
      "rating": 4.6,
      "price_level": 3,  // $$$ (caro)
      ...
    }
  ]
}
```

### Paso 4: Backend selecciona lugar sin duplicados

```typescript
// ia.service.ts - línea 186-201
const lugaresUsados = new Set<string>();

for (const lugar of lugaresReales) {
  if (!lugaresUsados.has(lugar.nombre)) {
    lugarReal = lugar;
    lugaresUsados.add(lugar.nombre);  // Marca como usado
    break;
  }
}
```

**Primera actividad:** Toma "Lattente Café" → Agrega al Set  
**Segunda actividad:** Salta "Lattente Café" (ya usado) → Toma "Full City Coffee"

### Paso 5: Ajusta precio con price_level

```typescript
// ia.service.ts - línea 159-194
private calcularPrecioRealista(tipo, priceLevel, precioGroq) {
  const rangos = {
    'cafetería': [0, 2000, 3500, 5000, 8000],  // 0-4
    'restaurante': [0, 5000, 10000, 15000, 25000],
    ...
  };
  
  const precioBase = rangos[tipo][priceLevel];  // cafetería + price_level 2 = $3500
  const variacion = precioBase * 0.2;           // ±20% = ±700
  const precioFinal = precioBase + random(-700, +700);  // $2800 - $4200
  
  return precioFinal;
}
```

**Ejemplo:**
- Groq estimó: `$3000`
- Google dice: `price_level = 2` ($$)
- Rango para cafetería nivel 2: `$3500`
- Con variación aleatoria: `$3200` (más realista)

---

## 📋 Resumen del matching

```
┌─────────────────────────────────────────────────────────────────┐
│ FILTROS DEL USUARIO                                             │
├─────────────────────────────────────────────────────────────────┤
│ tipos: ["cafetería", "restaurante"]                             │
│ presupuesto: $0 - $50,000                                       │
│ dias: 3                                                         │
│ prompt: "Itinerario relajado con buena gastronomía"            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ GROQ (IA) - Genera itinerario                                   │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Solo usa tipos permitidos: cafetería, restaurante            │
│ ✅ Respeta presupuesto total ≤ $50,000                          │
│ ✅ Distribuye en 3 días                                         │
│ ✅ Interpreta "relajado" → cafeterías tranquilas                │
│ ✅ Interpreta "buena gastronomía" → restaurantes de calidad     │
│                                                                 │
│ Salida:                                                         │
│ {                                                               │
│   "dias": [                                                     │
│     {                                                           │
│       "dia": 1,                                                 │
│       "actividades": [                                          │
│         { "tipo": "cafetería", "nombre": "Café Moderno" },      │
│         { "tipo": "restaurante", "nombre": "Rest. Gourmet" }    │
│       ]                                                         │
│     }                                                           │
│   ]                                                             │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND - Enriquece con Google Places                           │
├─────────────────────────────────────────────────────────────────┤
│ Para cada actividad:                                            │
│   1. Traduce tipo: "cafetería" → "cafe"                         │
│   2. Busca en Google: type=cafe, radius=6km                     │
│   3. Obtiene lugares reales con coordenadas                     │
│   4. Selecciona uno que NO esté usado                           │
│   5. Ajusta precio con price_level de Google                    │
│                                                                 │
│ Resultado:                                                      │
│ {                                                               │
│   "tipo": "cafetería",                                          │
│   "nombre": "Café Moderno",           // ← Inventado por Groq   │
│   "nombreReal": "Lattente Café",      // ← Real de Google       │
│   "direccion": "Av. Corrientes 1234", // ← Real                 │
│   "rating": 4.7,                      // ← Real                 │
│   "coordenadas": {...},               // ← Real                 │
│   "presupuesto_estimado": 3200,       // ← Ajustado con price_level │
│   "horario": "10:00-12:00"            // ← Inventado por Groq   │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Cómo ver el JSON que devuelve Groq

### Opción 1: Consola del backend (RECOMENDADO)

Ya está implementado con logging detallado:

```bash
# Inicia el backend
cd plania-backend
npm run start:dev

# Genera un itinerario desde el frontend
# Verás en la consola:
```

```
📝 Generando itinerario con: {
  prompt: "Itinerario relajado con buena gastronomía",
  filtros: { tipos: ["cafetería", "restaurante"], ... }
}

✅ Itinerario generado por Groq

🔍 Iniciando enriquecimiento con Google Places...
📋 Itinerario generado por Groq: {
  "dias": [
    {
      "dia": 1,
      "tema": "Gastronomía relajada",
      "actividades": [
        {
          "tipo": "cafetería",
          "nombre": "Café Moderno",
          "horario": "10:00-12:00",
          "presupuesto_estimado": 3000,
          "descripcion": "Ambiente acogedor con café de especialidad"
        },
        {
          "tipo": "restaurante",
          "nombre": "Restaurante Gourmet",
          "horario": "13:00-15:00",
          "presupuesto_estimado": 12000,
          "descripcion": "Cocina de autor con ingredientes locales"
        }
      ]
    },
    {
      "dia": 2,
      ...
    }
  ],
  "presupuesto_total": 45000
}

📅 Procesando Día 1 - Gastronomía relajada

  🎯 Actividad: Café Moderno (cafetería)
     Horario: 10:00-12:00
     Presupuesto estimado: $3000
     ✅ Encontrados 25 lugares de tipo "cafetería"
     ✨ Lugar seleccionado: Lattente Café (⭐ 4.7)
     💰 Precio: Groq estimó $3000, ajustado a $3200 (price_level: 2)

  🎯 Actividad: Restaurante Gourmet (restaurante)
     Horario: 13:00-15:00
     Presupuesto estimado: $12000
     ✅ Encontrados 30 lugares de tipo "restaurante"
     ✨ Lugar seleccionado: Don Julio (⭐ 4.8)
     💰 Precio: Groq estimó $12000, ajustado a $14500 (price_level: 3)

✅ Enriquecimiento completado. Total de lugares: 6
📍 Lugares únicos usados: 6
💵 Presupuesto total ajustado: $42700
```

### Opción 2: Guardar JSON en archivo (para análisis)

Puedes agregar esto temporalmente en `ia.service.ts`:

```typescript
// Después de línea 52
const itinerarioGroq = await this.llamarGroq(prompt, filtros);

// Agregar:
const fs = require('fs');
fs.writeFileSync(
  'itinerario-groq-debug.json',
  JSON.stringify(itinerarioGroq, null, 2)
);
console.log('📄 JSON guardado en: itinerario-groq-debug.json');
```

---

## 🎯 Casos de uso del matching

### Caso 1: Filtros restrictivos

**Input:**
```javascript
filtros: { tipos: ["museo"], presupuesto: { max: 10000 }, dias: 1 }
prompt: "Día cultural"
```

**Groq genera:**
```json
{
  "dias": [
    {
      "dia": 1,
      "actividades": [
        { "tipo": "museo", "nombre": "Museo de Arte", ... },
        { "tipo": "museo", "nombre": "Museo de Historia", ... }
      ]
    }
  ]
}
```

**Backend busca:**
- Solo en Google Places con `type=museum`
- Radio 6km desde ubicación
- Evita duplicados

### Caso 2: Filtros amplios

**Input:**
```javascript
filtros: { tipos: [], presupuesto: { max: 100000 }, dias: 3 }
prompt: "Itinerario variado"
```

**Groq genera:**
```json
{
  "dias": [
    {
      "dia": 1,
      "actividades": [
        { "tipo": "museo", ... },
        { "tipo": "restaurante", ... },
        { "tipo": "parque", ... }
      ]
    }
  ]
}
```

**Backend busca:**
- En múltiples tipos de Google Places
- Mayor variedad de lugares

---

## 🐛 Debugging: ¿Por qué se repiten lugares?

### Problema común:

```
Día 1: Lattente Café
Día 2: Lattente Café  ← Repetido
Día 3: Lattente Café  ← Repetido
```

### Causas posibles:

1. **Pocos lugares disponibles en la zona**
   ```
   ✅ Encontrados 3 lugares de tipo "cafetería"
   ⚠️  Todos los lugares ya fueron usados, repitiendo: Lattente Café
   ```
   
   **Solución:** Aumentar radio de búsqueda o cambiar ubicación

2. **Filtros muy restrictivos**
   ```
   filtros: { tipos: ["cafetería"], presupuesto: { max: 5000 } }
   ```
   
   **Solución:** Ampliar tipos o presupuesto

3. **Ubicación sin resultados**
   ```
   ❌ No se encontraron lugares de tipo "cafetería"
   ```
   
   **Solución:** Verificar ubicación del usuario

---

## 📊 Métricas útiles del logging

Al final de cada generación verás:

```
✅ Enriquecimiento completado. Total de lugares: 9
📍 Lugares únicos usados: 7
💵 Presupuesto total ajustado: $52,300
```

- **Total de lugares:** Actividades generadas por Groq
- **Lugares únicos:** Cuántos NO se repitieron
- **Presupuesto ajustado:** Con precios realistas de price_level

**Ideal:** `Lugares únicos = Total de lugares` (sin repeticiones)

---

## 🚀 Tips para mejores resultados

1. **Prompts específicos:**
   ```
   ❌ "Itinerario de 3 días"
   ✅ "Itinerario de 3 días con cafeterías por la mañana y restaurantes al mediodía"
   ```

2. **Filtros balanceados:**
   ```
   ❌ tipos: ["museo"]  // Muy restrictivo
   ✅ tipos: ["museo", "galería", "parque"]  // Más variedad
   ```

3. **Presupuesto realista:**
   ```
   ❌ presupuesto: { max: 5000 }  // Muy bajo para 3 días
   ✅ presupuesto: { max: 50000 }  // Razonable
   ```

4. **Ubicación céntrica:**
   - Más lugares disponibles en zonas urbanas
   - Radio de 6km cubre más opciones
