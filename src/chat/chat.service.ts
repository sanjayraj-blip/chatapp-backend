import { Injectable } from '@nestjs/common';
import { GroupsService } from 'src/groups/groups.service';
import { MessagesService } from 'src/messages/messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private messagesService: MessagesService,
    private groupsService: GroupsService,
  ) {}

  async saveMessage(senderId: string, messageDto: SendMessageDto) {
    return await this.messagesService.create({
      senderId,
      receiverId: messageDto.receiverId,
      groupId: messageDto.groupId,
      content: messageDto.content
    });
  }

  async validateGroupMembership(
    groupId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      await this.groupsService.findOne(groupId, userId);
      return true;
    } catch (error) {
      return false;
    }
  }
}
