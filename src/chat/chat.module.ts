import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    UsersModule,
    MessagesModule,
    GroupsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
