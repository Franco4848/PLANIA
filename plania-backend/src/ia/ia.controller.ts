import { Controller, Post, Body } from '@nestjs/common';
import { IaService } from './ia.service';

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('recomendar')
  async recomendar(@Body() body: {
    lat: string;
    lng: string;
    intereses: string[];
    hora: string;
  }) {
    return { respuesta: await this.iaService.generarRecomendaciones(body) };
  }
}
