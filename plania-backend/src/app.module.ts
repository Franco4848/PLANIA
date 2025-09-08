import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActividadesModule } from './actividades/actividades.module';

@Module({
  imports: [ActividadesModule], 
  providers: [AppService],
})
export class AppModule {}