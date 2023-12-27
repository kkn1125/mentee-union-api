import { Category } from '@/categories/entities/category.entity';
import { Mentoring } from '@/mentoring/entities/mentoring.entity';
import { Message } from '@/messages/entities/message.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MentoringSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /* 관심사 */
  @Column()
  category_id: number;

  /* 세션 주제 */
  @Column()
  topic: string;

  /* 세션 목표 */
  @Column()
  objective: string;

  /* 
    online
    offline
  */
  @Column()
  format: string;

  /* 세션 노트 */
  @Column()
  note: string;

  /* 세션 노트 */
  @Column()
  limit: number;

  /* 세션 비밀번호 */
  @Column()
  password: string;

  /* 세션 공개 여부 */
  @Column()
  is_private: boolean;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Mentoring, (mentoring) => mentoring.mentoringSession)
  mentorings: Mentoring[];

  @OneToMany(() => Message, (message) => message.mentoringSession)
  messages: Message[];

  @ManyToOne(() => Category, (category) => category.mentoringSessions)
  category: Category;
}
