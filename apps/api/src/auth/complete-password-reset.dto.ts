import { IsString, MinLength } from 'class-validator';

export class CompletePasswordResetDto {
  @IsString()
  @MinLength(1)
  token: string;

  @IsString()
  @MinLength(1)
  password: string;
}
