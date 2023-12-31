import { Forum } from '@/forums/entities/forum.entity';
import { Grade } from '@/grades/entities/grade.entity';
import { Mentoring } from '@/mentoring/entities/mentoring.entity';
import { Message } from '@/messages/entities/message.entity';
import { SeminarParticipant } from '@/seminars/entities/seminar-participant.entity';
import { Seminar } from '@/seminars/entities/seminar.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { UserRecommend } from './user-recommend.entity';
import { ReadMessage } from '@/messages/entities/read-message.entity';
import { ForumLike } from '@/forums/entities/forum-like.entity';
import { Board } from '@/boards/entities/board.entity';

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

  /* 0: male, 1: female, 2: none */
  @Column()
  gender: number;

  /* 해시 처리된 패스워드 */
  @Column()
  password: string;

  /* 해시 처리된 패스워드 */
  @Column()
  auth_email: boolean;

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

  @ManyToOne(() => Grade, (grade) => grade.users)
  grade: Grade;

  @OneToMany(() => UserRecommend, (userRecommend) => userRecommend.receiver)
  givers: UserRecommend[];
  @OneToMany(() => UserRecommend, (userRecommend) => userRecommend.giver)
  receivers: UserRecommend[];
  // @ManyToMany(() => User, (user) => user.giver)
  // receiver: User[];
  // @ManyToMany(() => User, (user) => user.receiver)
  // giver: User[];

  @OneToMany(
    () => SeminarParticipant,
    (seminarParticipant) => seminarParticipant.user,
  )
  seminarParticipants: SeminarParticipant[];

  @OneToMany(() => Seminar, (seminar) => seminar.user)
  seminars: Seminar[];

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles: Profile[];

  @OneToMany(() => Forum, (forum) => forum.user)
  forums: Forum[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => Mentoring, (mentoring) => mentoring.user)
  mentorings: Mentoring[];

  @OneToMany(() => ReadMessage, (readMessage) => readMessage.user)
  readedMessages: ReadMessage[];

  @OneToMany(() => ForumLike, (forumLike) => forumLike.user)
  forumLikes: ForumLike[];

  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];
}
