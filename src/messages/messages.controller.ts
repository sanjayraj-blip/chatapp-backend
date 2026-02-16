import {
  Controller,
  Get,
  Param,
  Query,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('direct/:userId')
  async getDirectMessages(
    @Param('userId') otherUserId: string,
    @Query('limit') limit: number = 50,
    @Request() req,
  ) {
    return await this.messagesService.getDirectMessages(
      req.user.id,
      otherUserId,
      limit,
    );
  }

  @Get('group/:groupId')
  async getGroupMessages(
    @Param('groupId') groupId: string,
    @Query('limit') limit: number = 50,
  ) {
    return await this.messagesService.getGroupMessages(groupId, limit);
  }

  @Patch('direct/:userId/read')
  async markDirectMessagesAsRead(
    @Param('userId') otherUserId: string,
    @Request() req,
  ) {
    await this.messagesService.markDirectMessagesAsRead(
      req.user.id,
      otherUserId,
    );
    return { success: true };
  }
}
