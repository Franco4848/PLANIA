import { Injectable } from '@nestjs/common';
import axios from 'axios';

type LugarSeleccionado = {
  nombre: string;
  categoria: string;
  coordenadas: { lat: number; lng: number };
};

@Injectable()
export class IaService {
  async generarRecomendaciones(data: {
    lat: string;
    lng: string;
    intereses: string[];
    presupuesto: number;
    personas: number;
    dias: number;
  }): Promise<{ respuesta: string; lugares: LugarSeleccionado[] }> {
    if (
      typeof data.presupuesto !== 'number' || isNaN(data.presupuesto) ||
      typeof data.personas !== 'number' || data.personas < 1 || data.personas > 4 ||
      typeof data.dias !== 'number' || data.dias < 1 || data.dias > 3
    ) {
      throw new Error('Datos inválidos: revisá presupuesto, personas (1–4) y días (1–3)');
    }

    console.log('Recibido:', {
      lat: data.lat,
      lng: data.lng,
      intereses: data.intereses,
      presupuesto: data.presupuesto,
      personas: data.personas,
      dias: data.dias
    });

    try {
      const clima = await this.obtenerClima(data.lat, data.lng);
      console.log('Clima:', clima);

      const lugares = await this.obtenerUnaActividadPorTipo(data.lat, data.lng, data.intereses);
      console.log('Lugares seleccionados:', lugares);

      const nombresParaPrompt = lugares.map((l, i) => `${i + 1}. ${l.nombre} (${l.categoria})`);

      const formatoDias = Array.from({ length: data.dias }, (_, i) => {
        return `📅 Día ${i + 1}:\n1. Nombre (categoría) - Costo estimado: $X USD - [Una frase breve en español]`;
      }).join('\n\n');

      const cierre = `
No escribas ningún otro bloque. No escribas “Día ${data.dias + 1}” ni actividades adicionales. Finalizá el texto después del último punto del Día ${data.dias}.
`.trim();

      const prompt = `
Ubicación: ${data.lat}, ${data.lng}, clima: ${clima.descripcion}, ${clima.temperatura}°C.
Intereses: ${data.intereses.join(', ')}.
Presupuesto: $${data.presupuesto} USD.
Grupo: ${data.personas} persona${data.personas > 1 ? 's' : ''}.
Duración: ${data.dias} día${data.dias > 1 ? 's' : ''}.

Actividades cercanas:
${nombresParaPrompt.join('\n')}

Distribuí todas las actividades en ${data.dias} día${data.dias > 1 ? 's' : ''}, de forma equitativa. No sobrecargues ni vacíes ningún día. Si hay 6 actividades y 3 días, repartí 2 por día. Si hay 5 y 2 días, repartí 3 y 2. Si es solo 1 día, incluí al menos 4 actividades.

Usá solo el encabezado “Día X:” para cada día. No agregues subtítulos como “actividades”, “plan”, “itinerario”, etc.

Formato:

${formatoDias}

${cierre}

Reglas:
- No repitas actividades en distintos días.
- No incluyas actividades fuera de los ${data.dias} día${data.dias > 1 ? 's' : ''}.
- No hagas introducciones ni resúmenes.
- No uses gentilicios ni nombres de países o zonas. Ej: no digas “chileno”, “mexicano”, “argentino”.
- Siempre indicá un costo estimado en dólares, incluso si es $0 USD.
- Si la categoría es "parque", asumí que es gratis salvo que se indique lo contrario.
`.trim();

      const start = Date.now();

      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'phi4-mini',
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 260
        }
      });

      const duration = (Date.now() - start) / 1000;
      console.log(`⏱️ Tiempo de respuesta IA (phi4-mini): ${duration.toFixed(2)} segundos`);

      const texto = typeof response.data.response === 'string'
        ? response.data.response
        : '[Respuesta no disponible]';

      console.log('🧠 Respuesta IA:', texto);

      return {
        respuesta: texto,
        lugares
      };
    } catch (error) {
      console.error('❌ Error IA:', error.response?.data || error.message);
      throw new Error('Error al generar recomendaciones');
    }
  }

  async generarActividadExtra(data: {
    lat: string;
    lng: string;
    intereses: string[];
    actividadesActuales: string[];
  }): Promise<{ respuesta: string; lugar: LugarSeleccionado }> {
    const clima = await this.obtenerClima(data.lat, data.lng);
    const candidatos = await this.obtenerUnaActividadPorTipo(data.lat, data.lng, data.intereses);

    const nuevos = candidatos.filter(
      (l) => !data.actividadesActuales.includes(l.nombre)
    );

    if (nuevos.length === 0) {
      console.log('⚠️ Candidatos:', candidatos.map(c => c.nombre));
      console.log('🗂️ Ya usados:', data.actividadesActuales);
      throw new Error('No se encontraron actividades nuevas para sugerir');
    }

    const elegido = nuevos[0];

    const prompt = `
Ubicación: ${data.lat}, ${data.lng}, clima: ${clima.descripcion}, ${clima.temperatura}°C.
Intereses: ${data.intereses.join(', ')}.
Ya visitó: ${data.actividadesActuales.join(', ')}.

Sugerí una nueva actividad cercana que no repita las anteriores.
Usá este formato:
Nombre (categoría)
Costo estimado: $X USD
Descripción: [una frase breve en español]
`.trim();

    const start = Date.now();

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'phi4-mini',
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 250
      }
    });

    const duration = (Date.now() - start) / 1000;
    console.log(`⏱️ Tiempo de respuesta IA (phi4-mini): ${duration.toFixed(2)} segundos`);

    const texto = typeof response.data.response === 'string'
      ? response.data.response
      : '[Respuesta no disponible]';

    return {
      respuesta: texto,
      lugar: elegido
    };
  }

  async obtenerClima(lat: string, lng: string): Promise<{ descripcion: string; temperatura: number; humedad: number }> {
    const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code`);
    const clima = res.data.current;

    return {
      descripcion: this.traducirClima(clima.weather_code),
      temperatura: clima.temperature_2m,
      humedad: clima.relative_humidity_2m,
    };
  }

  traducirClima(codigo: number): string {
    const mapa: Record<number, string> = {
      0: 'cielo despejado',
      1: 'mayormente despejado',
      2: 'parcialmente nublado',
      3: 'nublado',
      45: 'niebla',
      61: 'lluvia ligera',
      63: 'lluvia moderada',
      65: 'lluvia intensa',
    };
    return mapa[codigo] || 'condición desconocida';
  }

  async obtenerUnaActividadPorTipo(lat: string, lng: string, intereses: string[]): Promise<LugarSeleccionado[]> {
    const seleccionados: LugarSeleccionado[] = [];

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    for (const tipo of intereses) {
      const res = await axios.get(`http://localhost:3000/actividades/buscar?lat=${lat}&lng=${lng}&tipo=${tipo}`);
      const lugares = res.data;

      const ordenados = lugares
        .filter((l: any) => l.coordenadas?.lat && l.coordenadas?.lng)
        .map((l: any) => ({
          nombre: l.nombre,
          categoria: l.categoria,
          coordenadas: l.coordenadas,
          distancia: this.calcularDistancia(latNum, lngNum, l.coordenadas.lat, l.coordenadas.lng)
        }))
        .sort((a, b) => a.distancia - b.distancia);

      const top2 = ordenados.slice(0, 2);
      for (const lugar of top2) {
        seleccionados.push({
          nombre: lugar.nombre,
          categoria: lugar.categoria,
          coordenadas: lugar.coordenadas
        });
      }
    }

    return seleccionados;
  }

  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
