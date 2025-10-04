import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { IaService } from './ia.service';
import { GenerarItinerarioDto } from './dto/generar-itinerario.dto';
import { ItinerarioResponseDto } from './dto/itinerario-response.dto';

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('itinerario')
  async generarItinerario(@Body() dto: GenerarItinerarioDto): Promise<ItinerarioResponseDto> {
    try {
      return await this.iaService.generarItinerario(dto);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al generar itinerario';
      console.error('❌ Error en controller:', errorMessage);
      
      // Devolver error más descriptivo
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessage,
          error: 'IA Service Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
