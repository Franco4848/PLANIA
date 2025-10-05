import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

interface LugarGoogle {
  name: string;
  vicinity: string;
  rating?: number;
  types?: string[];
  price_level?: number; // 0-4: Gratis, $, $$, $$$, $$$$
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
    const radius = 6000; // 🔽 radio de 6 km
    const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

    const keyword= encodeURIComponent(`${tipo || ''}`.trim());

    const tipoTraducido: Record<string, string> = {
      cafetería: 'cafe',
      restaurante: 'restaurant',
      museo: 'museum',
      parque: 'park',
      galería: 'art_gallery',
      cine: 'movie_theater',
      atracción: 'tourist_attraction',
      plaza: 'park',
      bodega: 'winery',
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
      'winery',
    ];
    
    const tiposExcluidos = [
      'school',
      'store',
      'supermarket',
      'bank',
      'hospital',
    ];
    
    const tiposAConsultar =
      tipo === 'todas' ? tiposTuristicos : [tipoTraducido[tipo] || tipo];

    const allResults: LugarGoogle[] = [];

    for (const tipoGoogle of tiposAConsultar) {
      let pagetoken = '';
      let attempts = 0;

      do {
        const url = pagetoken
          ? `${baseUrl}?pagetoken=${pagetoken}&key=${apiKey}`
          : `${baseUrl}?location=${lat},${lng}&radius=${radius}&type=${tipoGoogle}&key=${apiKey}&keyword=${keyword}`;

        const response = await fetch(url);
        const data = (await response.json()) as {
          results: LugarGoogle[];
          next_page_token?: string;
        };

        if (data.results?.length) {
          allResults.push(...data.results);
        }

        pagetoken = data.next_page_token || '';
        attempts++;

        if (pagetoken) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } while (pagetoken && attempts < 5);
    }

    return allResults
      .filter((lugar) => {
        const tipos = lugar.types ?? [];
        return !tipos.some((t) => tiposExcluidos.includes(t));
      })
      .map((lugar) => {
        const coordenadas = lugar.geometry?.location;
        if (
          !coordenadas ||
          typeof coordenadas.lat !== 'number' ||
          typeof coordenadas.lng !== 'number'
        ) {
          return null;
        }

        return {
          nombre: lugar.name,
          direccion: lugar.vicinity,
          rating: lugar.rating ?? 'Sin rating',
          tipos: lugar.types ?? [],
          price_level: lugar.price_level, // Agregar price_level
          coordenadas,
        };
      })
      .filter(Boolean);
  }
}
