import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';
import { User } from '@/users/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Mentoring extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // mentor_id: number;

  @Column()
  mentee_id: number;

  @Column()
  mentoring_session_id: number;

  /* 
    대기
    진행
    종료
  */
  @Column()
  status: string;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(
    () => MentoringSession,
    (mentoringSession) => mentoringSession.mentorings,
  )
  mentoringSession: MentoringSession;

  @ManyToOne(() => User, (user) => user.mentorings)
  @JoinColumn({ name: 'mentee_id' })
  user: User;
}
