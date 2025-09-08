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
        };
      })
      .filter(Boolean);
  }
}