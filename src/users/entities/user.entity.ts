import { Exclude } from "class-transformer";
import { GroupMember } from "src/groups/entities/groupmember.entity";
import { Message } from "src/messages/entities/message.entity";
import { Column, CreateDateColumn, Entity,OneToMany,PrimaryGeneratedColumn } from "typeorm";


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, (message) => message.sender)
  sentmessages: Message[];

  @OneToMany(() => Message, (message) => message.reciever)
  receivedMessages: Message[];

  @OneToMany(() => GroupMember, (membership) => membership.user)
  groupMemberships: GroupMember[];
}