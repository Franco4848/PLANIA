import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RutaDocument = Ruta & Document;

@Schema()
export class Ruta {
  @Prop({ required: true })
  usuario: string;

  @Prop({ required: true, type: Object })
  destino: {
    lat: number;
    lng: number;
  };

  @Prop({ required: true, type: [Object] })
  waypoints: {
    location: {
      lat: number;
      lng: number;
    };
    stopover: boolean;
  }[];

  @Prop({ default: Date.now })
  fecha: Date;
}

export const RutaSchema = SchemaFactory.createForClass(Ruta);
