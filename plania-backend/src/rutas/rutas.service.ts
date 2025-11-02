import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ruta, RutaDocument } from './dto/schema/rutas.schema';
import { CreateRutaDto } from './dto/create-ruta.dto';

@Injectable()
export class RutasService {
  constructor(@InjectModel(Ruta.name) private rutaModel: Model<RutaDocument>) {}

  async guardarRuta(userId: string, dto: CreateRutaDto) {
    const nueva = new this.rutaModel({
      usuario: userId,
      destino: dto.destino,
      waypoints: dto.waypoints,
      fecha: new Date()
    });
    return nueva.save();
  }

  async obtenerRutasDelUsuario(userId: string) {
    return this.rutaModel.find({ usuario: userId }).sort({ fecha: -1 }).exec();
  }

  async eliminarRutaDelUsuario(userId: string, rutaId: string) {
    return this.rutaModel.deleteOne({ _id: rutaId, usuario: userId }).exec();
  }
}
