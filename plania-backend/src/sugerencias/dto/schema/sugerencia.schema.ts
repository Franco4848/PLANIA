import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

export type SugerenciaDocument = Sugerencia & Document;

@Schema()
@ObjectType()
export class Sugerencia {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true })
  @Field()
  mensaje: string;

  @Prop({ required: true })
  @Field()
  emailAutor: string;
}

export const SugerenciaSchema = SchemaFactory.createForClass(Sugerencia);
