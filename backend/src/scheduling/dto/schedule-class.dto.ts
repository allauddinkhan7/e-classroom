import { IsDateString } from 'class-validator';

export class ScheduleClassDto {
  @IsDateString()
  scheduledAt!: string;
}