import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsArray,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @MinLength(6)
  readonly password: string;

  @IsOptional()
  @IsIn(['admin', 'user', 'editor'])
  readonly role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly interests?: string[];
}
