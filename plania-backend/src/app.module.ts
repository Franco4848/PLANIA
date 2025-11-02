import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ActividadesModule } from './actividades/actividades.module';
import { IaModule } from './ia/ia.module';
import { SugerenciaModule } from './sugerencias/sugerencia.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/plania'),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: true,
      debug: false,
    }),

    AuthModule,
    UsersModule,
    ActividadesModule,
    IaModule,
    SugerenciaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
