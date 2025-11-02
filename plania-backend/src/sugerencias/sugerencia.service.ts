import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sugerencia, SugerenciaDocument } from './dto/schema/sugerencia.schema';

@Injectable()
export class SugerenciaService {
  constructor(
    @InjectModel(Sugerencia.name)
    private readonly model: Model<SugerenciaDocument>
  ) {}

  async crear(mensaje: string, emailAutor: string): Promise<Sugerencia> {
    return this.model.create({ mensaje, emailAutor });
  }

  async listarTodas(): Promise<Sugerencia[]> {
    return this.model.find().exec();
  }
}
