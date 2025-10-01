import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class IaService {
  async generarRecomendaciones(data: {
    lat: string;
    lng: string;
    intereses: string[];
    hora: string;
  }): Promise<string> {
    console.log('Recibido:', data);

    try {
      const clima = await this.obtenerClima(data.lat, data.lng);
      console.log('Clima:', clima);

      const lugares = await this.obtenerUnaActividadPorTipo(data.lat, data.lng, data.intereses);
      console.log('Lugares seleccionados:', lugares);

      const prompt = `El usuario está en las coordenadas ${data.lat}, ${data.lng}. Tiene interés en: ${data.intereses.join(', ')}.
El clima actual es ${clima.descripcion}, con ${clima.temperatura}°C y ${clima.humedad}% de humedad.
La hora actual es ${data.hora}.
Estas son 3 actividades cercanas, una por cada tipo de interés: ${lugares.join(', ')}.
Justificá por qué cada una es adecuada para el usuario en este momento.`;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Respuesta IA:', response.data);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error IA:', error.response?.data || error.message);
      throw new Error('Error al generar recomendaciones');
    }
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

  async obtenerUnaActividadPorTipo(lat: string, lng: string, intereses: string[]): Promise<string[]> {
    const seleccionados: string[] = [];

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
          distancia: this.calcularDistancia(latNum, lngNum, l.coordenadas.lat, l.coordenadas.lng)
        }))
        .sort((a, b) => a.distancia - b.distancia);

      if (ordenados.length > 0) {
        const elegido = ordenados[0];
        seleccionados.push(`${elegido.nombre} (${elegido.categoria})`);
      }
    }

    return seleccionados;
  }

  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
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
