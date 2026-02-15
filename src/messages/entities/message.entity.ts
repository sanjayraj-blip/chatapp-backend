import { Group } from "src/groups/entities/groups.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio'
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  senderId: string;

  @Column({ nullable: true })
  recieverId: string;

  @Column({ nullable: true })
  groupId: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.sentmessages, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'recieverId' })
  reciever: User;

  @ManyToOne(() => Group, (group) => group.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;
} 