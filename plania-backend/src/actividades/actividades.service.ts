import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

interface LugarGoogle {
  name: string;
  vicinity: string;
  rating?: number;
  types?: string[];
  place_id?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

@Injectable()
export class ActividadesService {
  async buscarEnGooglePlaces(lat: string, lng: string, tipo: string) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error('Falta GOOGLE_PLACES_API_KEY en las variables de entorno');
    }

    const radius = 3000;
    const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

    const tipoTraducido: Record<string, string> = {
      'cafetería': 'cafe',
      'restaurante': 'restaurant',
      'museo': 'museum',
      'parque': 'park',
      'galería': 'art_gallery',
      'cine': 'movie_theater',
      'atracción': 'tourist_attraction',
      'plaza': 'park',
      'bodega': 'winery'
    };

    const tiposTuristicos = [
      'cafe',
      'restaurant',
      'museum',
      'park',
      'art_gallery',
      'movie_theater',
      'tourist_attraction',
      'lodging',
      'winery'
    ];

    const tiposExcluidos = ['school', 'store', 'supermarket', 'bank', 'hospital'];

    const tiposAConsultar = tipo === 'todas'
      ? tiposTuristicos
      : [tipoTraducido[tipo] || tipo];

    let allResults: LugarGoogle[] = [];

    for (const tipoGoogle of tiposAConsultar) {
      let pagetoken = '';
      let attempts = 0;

      do {
        const url = pagetoken
          ? `${baseUrl}?pagetoken=${pagetoken}&key=${apiKey}`
          : `${baseUrl}?location=${lat},${lng}&radius=${radius}&type=${tipoGoogle}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json() as { results: LugarGoogle[], next_page_token?: string };

        if (data.results?.length) {
          allResults.push(...data.results);
        }

        pagetoken = data.next_page_token || '';
        attempts++;

        if (pagetoken) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } while (pagetoken && attempts < 3);
    }

    const lugaresFiltrados = allResults
      .filter((lugar) => {
        const tipos = lugar.types ?? [];
        return !tipos.some((t) => tiposExcluidos.includes(t));
      })
      .map(async (lugar) => {
        const coordenadas = lugar.geometry?.location;
        if (
          !coordenadas ||
          typeof coordenadas.lat !== 'number' ||
          typeof coordenadas.lng !== 'number' ||
          !lugar.place_id
        ) {
          return null;
        }

        const detalles = await this.obtenerDetallesLugar(lugar.place_id, apiKey);

        return {
          nombre: lugar.name,
          direccion: lugar.vicinity,
          rating: lugar.rating ?? 'Sin rating',
          tipos: lugar.types ?? [],
          coordenadas,
          telefono: detalles.telefono ?? null,
          horarios: detalles.horarios ?? []
        };
      });

    return (await Promise.all(lugaresFiltrados)).filter(Boolean);
  }

  async obtenerDetallesLugar(placeId: string, apiKey: string) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,opening_hours&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const telefono = data.result?.formatted_phone_number ?? null;
    const horariosEn = data.result?.opening_hours?.weekday_text ?? [];

    const traduccionDias: Record<string, string> = {
      'Monday': 'Lunes',
      'Tuesday': 'Martes',
      'Wednesday': 'Miércoles',
      'Thursday': 'Jueves',
      'Friday': 'Viernes',
      'Saturday': 'Sábado',
      'Sunday': 'Domingo'
    };

    const horariosEs = horariosEn.map((linea: string) => {
      const [diaEn, resto] = linea.split(': ');
      const diaEs = traduccionDias[diaEn] ?? diaEn;

      if (!resto) return diaEs;

      const texto = resto
        .replace('Closed', 'Cerrado')
        .replace('Open 24 hours', 'Abierto 24 horas')
        .replace(/AM|PM/g, '')
        .replace(/\u202f/g, '') // elimina espacios finos

      return `${diaEs}: ${texto.trim()}`;
    });

    return {
      telefono,
      horarios: horariosEs
    };
  }
}