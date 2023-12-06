import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';
import { Seminar } from '@/seminars/entities/seminar.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Seminar, (seminar) => seminar.category)
  seminars: Seminar[];

  @OneToMany(
    () => MentoringSession,
    (mentoringSession) => mentoringSession.category,
  )
  mentoringSessions: MentoringSession[];
}
