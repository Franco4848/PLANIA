import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

import { CreateSugerenciaInput } from './dto/create-sugerencia.input';
import { SugerenciaService } from './sugerencia.service';
import { Sugerencia } from './dto/schema/sugerencia.schema';
import type { UserToken } from '../users/interfaces/user-token.interface';

@Resolver(() => Sugerencia)
export class SugerenciaResolver {
  constructor(private readonly sugerenciaService: SugerenciaService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Sugerencia)
  crearSugerencia(
    @Args('input') input: CreateSugerenciaInput,
    @CurrentUser() usuario: UserToken,
  ) {
    return this.sugerenciaService.crear(input.mensaje, usuario.email);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Sugerencia])
  sugerencias() {
    return this.sugerenciaService.listarTodas();
  }
}
