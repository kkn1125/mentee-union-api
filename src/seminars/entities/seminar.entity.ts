import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SeminarParticipant } from './seminar-participant.entity';
import { User } from '@/users/entities/user.entity';
import { Category } from '@/categories/entities/category.entity';
import { Cover } from './cover.entity';

@Entity()
export class Seminar extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  host_id: number;

  @Column()
  category_id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  view_count: number;

  @Column()
  meeting_place: string;

  @Column()
  limit_participant_amount: number;

  @Column()
  recruit_start_date: Date;

  @Column()
  recruit_end_date: Date;

  @Column()
  seminar_start_date: Date;

  @Column()
  seminar_end_date: Date;

  @Column()
  is_recruit_finished: boolean;

  @Column()
  is_seminar_finished: boolean;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => SeminarParticipant,
    (seminarParticipant) => seminarParticipant.seminar,
  )
  seminarParticipants: SeminarParticipant[];

  @ManyToOne(() => User, (user) => user.seminars)
  @JoinColumn({
    name: 'host_id',
  })
  user: User;

  @ManyToOne(() => Category, (category) => category.seminars)
  @JoinColumn({
    name: 'category_id',
  })
  category: Category;

  @OneToOne(() => Cover, (cover) => cover.seminar)
  cover: Cover;
}
