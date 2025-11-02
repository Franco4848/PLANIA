import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SugerenciaResolver } from './sugerencia.resolver';
import { SugerenciaService } from './sugerencia.service';
import { Sugerencia, SugerenciaSchema } from './dto/schema/sugerencia.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sugerencia.name, schema: SugerenciaSchema },
    ]),
  ],
  providers: [SugerenciaResolver, SugerenciaService],
})
export class SugerenciaModule {}
