import { IsEmail } from 'class-validator';

export class ProfileDto {
  @IsEmail()
  email!: string;

}