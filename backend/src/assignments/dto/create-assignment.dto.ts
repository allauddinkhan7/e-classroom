import { IsString, MinLength, IsInt, Min, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  totalMarks!: number;

  @IsDateString()
  dueAt!: string;
}