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
import { SeminarParticipant } from '@/seminars/entities/seminar-participant.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grade_id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
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
  fail_login_count: number;

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

  @OneToMany(
    () => SeminarParticipant,
    (seminarParticipant) => seminarParticipant.user,
  )
  seminarParticipants: SeminarParticipant[];
}
