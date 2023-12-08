import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';
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
  @JoinColumn({ name: 'mentoring_session_id' })
  mentoringSession: MentoringSession;
}
