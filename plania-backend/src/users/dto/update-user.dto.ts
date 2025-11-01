import { IsEmail, IsIn, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  readonly name?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @MinLength(6)
  readonly password?: string;

  @IsOptional()
  @IsIn(['admin', 'user', 'editor'])
  readonly role?: string;
}
