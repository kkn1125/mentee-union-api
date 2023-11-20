import { BaseEntity, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Seminar extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
