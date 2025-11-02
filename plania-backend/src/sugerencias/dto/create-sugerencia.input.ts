import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateSugerenciaInput {
  @Field()
  mensaje: string;
}
