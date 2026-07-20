import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_EMAIL_LENGTH } from '@webduct/shared';

export class LoginDto {
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
