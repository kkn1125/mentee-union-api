import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Seminar } from './seminar.entity';

@Entity()
export class Cover extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  seminar_id: number;

  @Column()
  origin_name: string;

  @Column()
  new_name: string;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Seminar, (seminar) => seminar.cover)
  @JoinColumn()
  seminar: Seminar;
}
