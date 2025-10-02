import { Module } from '@nestjs/common';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { ActividadesModule } from '../actividades/actividades.module';

@Module({
  imports: [ActividadesModule],
  controllers: [IaController],
  providers: [IaService],
})
export class IaModule {}
