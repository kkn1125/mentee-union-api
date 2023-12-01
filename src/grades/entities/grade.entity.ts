import { User } from '@/users/entities/user.entity';
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

/* 회원 등급 (유료 회원 구분) */
@Entity()
export class Grade extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @DeleteDateColumn()
  deleted_at: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @OneToMany(() => User, (user) => user.grade)
  users: User[];
}
