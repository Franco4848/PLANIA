import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ActividadesModule } from './actividades/actividades.module';
import { IaModule } from './ia/ia.module';

@Module({
  imports: [
    // Carga las variables de entorno desde .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MongoDB usando la URI del .env
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/plania'),

    // Módulos funcionales del sistema
    AuthModule,
    UsersModule,
    ActividadesModule,
    IaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
