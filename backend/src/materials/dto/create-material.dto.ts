import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  fileId?: string;
}