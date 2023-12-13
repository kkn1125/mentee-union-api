import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from '@/users/entities/user.entity';

@Entity()
export class ReadMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  message_id: number;

  @ManyToOne(() => Message, (message) => message.readedUsers)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => User, (user) => user.readedMessages)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
