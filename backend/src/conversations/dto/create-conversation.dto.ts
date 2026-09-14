import { IsArray, ArrayMinSize } from 'class-validator';

export class CreateConversationDto {
  @IsArray()
  @ArrayMinSize(1)
  participantIds!: string[]; // the OTHER person/people — the creator is added automatically
}4