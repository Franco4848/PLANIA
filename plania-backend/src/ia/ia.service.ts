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
  }): Promise<{ respuesta: string; lugares: LugarSeleccionado[] }> {
    if (typeof data.presupuesto !== 'number' || isNaN(data.presupuesto)) {
      throw new Error('Presupuesto inválido: debe ser un número');
    }

    console.log('Recibido:', {
      lat: data.lat,
      lng: data.lng,
      intereses: data.intereses,
      presupuesto: data.presupuesto
    });

    try {
      const clima = await this.obtenerClima(data.lat, data.lng);
      console.log('Clima:', clima);

      const lugares = await this.obtenerUnaActividadPorTipo(data.lat, data.lng, data.intereses);
      console.log('Lugares seleccionados:', lugares);

      const nombresParaPrompt = lugares.map((l, i) => `${i + 1}. ${l.nombre} (${l.categoria})`);

      const prompt = `
Estás ayudando a un usuario ubicado en ${data.lat}, ${data.lng}, con clima ${clima.descripcion} y ${clima.temperatura}°C.
Tiene interés en: ${data.intereses.join(', ')}.
Presupuesto disponible: $${data.presupuesto} USD.

Actividades cercanas disponibles:
${nombresParaPrompt.join('\n')}

Generá una lista numerada con:
- Un costo estimado en USD por actividad
- Una frase breve que justifique por qué es adecuada
Asegurate de que las actividades recomendadas estén dentro del presupuesto disponible.
Incluí el costo estimado en formato "$X USD" al comienzo de cada línea.
`.trim();

      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'mistral',
        prompt,
        stream: false
      });

      const texto = typeof response.data.response === 'string'
        ? response.data.response
        : '[Respuesta no disponible]';

      console.log('🧠 Respuesta IA:', texto);
      
      return {
      respuesta: response.data.response, // ✅ solo el string
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
El usuario ya visitó: ${data.actividadesActuales.join(', ')}.
Está en ${data.lat}, ${data.lng}, con clima ${clima.descripcion} y ${clima.temperatura}°C.
Tiene interés en: ${data.intereses.join(', ')}.
Sugerí una nueva actividad cercana que no repita las anteriores.
Estimá un costo aproximado en USD y justificá en una sola frase clara.
`.trim();

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt,
      stream: false
    });

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
