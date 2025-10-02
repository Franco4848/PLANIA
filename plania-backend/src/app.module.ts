import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActividadesModule } from './actividades/actividades.module';
import { IaModule } from './ia/ia.module';

@Module({
  imports: [ActividadesModule, IaModule], 
  providers: [AppService],
})
export class AppModule {}