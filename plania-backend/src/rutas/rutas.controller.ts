import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards
} from '@nestjs/common';
import { RutasService } from './rutas.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @UseGuards(JwtAuthGuard)
  @Post('guardar')
  guardarRuta(@Req() req, @Body() dto: CreateRutaDto) {
    const userId = req.user.sub;
    return this.rutasService.guardarRuta(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mias')
  obtenerRutas(@Req() req) {
    const userId = req.user.sub;
    return this.rutasService.obtenerRutasDelUsuario(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  eliminarRuta(@Req() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.rutasService.eliminarRutaDelUsuario(userId, id);
  }
}
