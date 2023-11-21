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
import { UserRecommend } from './user-recommend.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  birth: Date;

  @Column()
  gender: string;

  /* 해시 처리된 패스워드 */
  @Column()
  password: string;

  /* 레벨 (레벨 테이블 별도로 구성 필요) */
  @Column()
  level: number;

  /* 레벨 점수 */
  @Column()
  points: number;

  @Column()
  last_login_at: Date;

  /* 
    login
    logout
    dormant (휴면)
  */
  @Column()
  status: string;

  /* date time */
  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserRecommend, (userRecommend) => userRecommend.giver)
  givers: User[];
  @OneToMany(() => UserRecommend, (userRecommend) => userRecommend.receiver)
  receivers: User[];
  // @ManyToMany(() => User, (user) => user.giver)
  // receiver: User[];
  // @ManyToMany(() => User, (user) => user.receiver)
  // giver: User[];
}
