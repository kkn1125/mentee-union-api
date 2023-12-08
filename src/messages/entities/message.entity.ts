import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';
import { User } from '@/users/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  is_read: number;

  @Column()
  is_top: number;

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
  mentoringSession: MentoringSession;
}
