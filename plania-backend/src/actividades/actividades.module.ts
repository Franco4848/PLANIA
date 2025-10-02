import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActividadesService } from './actividades.service';
import { ActividadesController } from './actividades.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [ActividadesService],
  controllers: [ActividadesController],
  exports: [ActividadesService],
})
export class ActividadesModule {}