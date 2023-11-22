import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Seminar } from './seminar.entity';
import { User } from '@/users/entities/user.entity';

@Entity()
export class SeminarParticipant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  seminar_id: number;

  @Column()
  user_id: number;

  @Column()
  is_confirm: boolean;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Seminar, (seminar) => seminar.seminarParticipants)
  seminar: Seminar;
  @ManyToOne(() => User, (user) => user.seminarParticipants)
  user: User;
}
