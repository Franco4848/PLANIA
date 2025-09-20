import { Controller, Get, Query } from '@nestjs/common';
import { ActividadesService } from './actividades.service';

@Controller('actividades')
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  @Get('buscar')
  async buscar(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('tipo') tipo: string,
  ) {
    const lugares = await this.actividadesService.buscarEnGooglePlaces(lat, lng, tipo);

    return lugares
      .map((lugar) => {
        if (!lugar) return null;

        return {
          nombre: lugar.nombre,
          direccion: lugar.direccion,
          rating: lugar.rating,
          coordenadas: lugar.coordenadas,
          categoria: traducirCategoria(lugar.tipos?.[0]) ?? 'otro' // 👈 agregado
        };
      })
      .filter(Boolean);
  }
}

// 🔠 Traductor simple de categorías de Google a español
function traducirCategoria(tipo: string | undefined): string {
  const mapa: Record<string, string> = {
    cafe: 'cafeteria',
    restaurant: 'restaurante',
    museum: 'museo',
    park: 'parque',
    art_gallery: 'galería',
    movie_theater: 'cine',
    tourist_attraction: 'atracción',
    winery: 'bodega',
    lodging: 'alojamiento'
  };

  return tipo ? mapa[tipo] ?? tipo : 'otro';
}
