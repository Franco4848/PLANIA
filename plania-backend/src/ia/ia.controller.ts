import { Controller, Post, Body } from '@nestjs/common';
import { IaService } from './ia.service';

export class RecomendacionDTO {
  lat: string;
  lng: string;
  intereses: string[];
  presupuesto: number; 
  personas: number;    
  dias: number;        
}

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('recomendar')
  async recomendar(@Body() body: RecomendacionDTO) {
    return await this.iaService.generarRecomendaciones(body);
  }

  @Post('recomendar-extra')
  async recomendarExtra(@Body() body: {
    lat: string;
    lng: string;
    intereses: string[];
    actividadesActuales: string[];
  }) {
    return await this.iaService.generarActividadExtra(body);
  }
}