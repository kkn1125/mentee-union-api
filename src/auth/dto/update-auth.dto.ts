import { IsNotEmpty } from 'class-validator';

export class UpdateAuthDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
