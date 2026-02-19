import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string; // The actual message text

  @IsOptional()
  @IsUUID()
  receiverId?: string; // For direct messages (optional)

  @IsOptional()
  @IsUUID()
  groupId?: string; // For group messages (optional)
}
