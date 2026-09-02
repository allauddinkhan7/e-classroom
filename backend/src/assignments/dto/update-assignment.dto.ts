import { IsString, MinLength, IsInt, Min, IsDateString, IsOptional } from 'class-validator';

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalMarks?: number;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsString()
  fileId?: string;
}