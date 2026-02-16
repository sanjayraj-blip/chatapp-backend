import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(messageData: Partial<Message>): Promise<Message> {
    const message = this.messagesRepository.create(messageData);
    return await this.messagesRepository.save(message);
  }

  async getDirectMessages(
    userId: string,
    otherUserId: string,
    limit: number = 50,
  ): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getGroupMessages(
    groupId: string,
    limit: number = 50,
  ): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { groupId },
      relations: ['sender', 'group'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.messagesRepository.update(messageId, { isRead: true });
  }

  async markDirectMessagesAsRead(
    userId: string,
    otherUserId: string,
  ): Promise<void> {
    await this.messagesRepository.update(
      {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      { isRead: true },
    );
  }
}
