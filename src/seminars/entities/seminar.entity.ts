import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  meeting_place: string;

  @Column()
  limit_participant_amount: number;

  @Column()
  recruit_start: Date;

  @Column()
  recruit_end: Date;

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
}
