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
import { User } from './user.entity';

@Entity()
export class UserRecommend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  giver_id: number;
  @Column()
  receiver_id: number;

  @Column()
  points: number;
  @Column()
  reason: string;

  /* date time */
  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.userRecommends)
  users: User[];
}
