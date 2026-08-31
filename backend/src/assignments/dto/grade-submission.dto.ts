import { IsInt, Min } from 'class-validator';

export class GradeSubmissionDto {
  @IsInt()
  @Min(0)
  obtainedMarks!: number;
}