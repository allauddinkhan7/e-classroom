import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateClassroomDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}