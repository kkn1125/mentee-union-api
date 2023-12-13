import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';
import { User } from '@/users/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReadMessage } from './read-message.entity';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  mentoring_session_id: number;

  @Column()
  message: string;

  @Column()
  is_top: boolean;

  @Column()
  is_deleted: boolean;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.messages)
  user: User;

  @ManyToOne(
    () => MentoringSession,
    (mentoringSession) => mentoringSession.messages,
  )
  @JoinColumn({ name: 'mentoring_session_id' })
  mentoringSession: MentoringSession;

  @OneToMany(() => ReadMessage, (readMessage) => readMessage.message)
  readedUsers: ReadMessage[];
}
