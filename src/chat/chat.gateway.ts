import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map();

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      console.log(`client connected ${client.id}`);

      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token);

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      this.userSockets.set(user.id, client.id);
      client.data.user = user;
    } catch (e) {
      console.log(e);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;

    if (user) {
      this.userSockets.delete(user.id);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageDto: SendMessageDto,
  ) {
    try {
      const sender = client.data.user;
      if (!messageDto.receiverId && !messageDto.groupId) {
        client.emit('error', { message: 'Must specify receiver or group' });
        return;
      }

      const savedMessage = await this.chatService.saveMessage(
        sender.id,
        messageDto,
      );

      if (messageDto.receiverId) {
        await this.handleDirectMessage(
          client,
          savedMessage,
          messageDto.receiverId,
        );
      }

      if (messageDto.groupId) {
        await this.handleGroupMessage(client, savedMessage, messageDto.groupId);
      }
    } catch (e) {
      client.emit('error', { message: e.message });
    }
  }

  private async handleDirectMessage(
    senderSocket: Socket,
    message: any,
    receiverId: string,
  ) {
    const receiverSocketId = this.userSockets.get(receiverId);

    // send to receiver if they are online
    if (receiverSocketId) {
      // Receiver is online! Send the message
      this.server.to(receiverSocketId).emit('new_message', {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        receiverId: message.receiverId,
        createdAt: message.createdAt,
      });
      console.log(`Direct message delivered to user ${receiverId}`);
    } else {
      console.log(`User ${receiverId} is offline - message saved in DB`);
    }

    senderSocket.emit('message_sent', {
      id: message.id,
      status: 'delivered',
    });
  }

  private async handleGroupMessage(
    client: Socket,
    message: any,
    groupId: string,
  ) {
    // broadcast to all sockets in the group room except sender
    client.to(groupId).emit('new_message', message);

    // also confirm back to sender
    client.emit('new_message', message);
  }

  @SubscribeMessage('join_group')
  async handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    const user = client.data.user;

    // Verify user is a member
    const isMember = await this.chatService.validateGroupMembership(
      data.groupId,
      user.id,
    );

    if (!isMember) {
      client.emit('error', { message: 'You are not a member of this group' });
      return;
    }

    // Join the Socket.IO room
    client.join(`group:${data.groupId}`);
    console.log(`🚪 ${user.username} joined group room: ${data.groupId}`);

    client.emit('joined_group', { groupId: data.groupId });
  }

  @SubscribeMessage('leave_group')
  handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    const user = client.data.user;
    client.leave(`group:${data.groupId}`);
    console.log(`👋 ${user.username} left group room: ${data.groupId}`);
  }
}
