import { MigrationInterface, QueryRunner } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as cryptoJS from 'crypto-js';

export class Initialize1700558286023 implements MigrationInterface {
  name = 'Initialize1700558286023';

  constructor() {
    dotenv.config({
      path: path.join(path.resolve(), '.env.development'),
    });
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('run query');
    const createPassword = (email: string, password: string) =>
      cryptoJS
        .HmacSHA256(password + '|' + email, process.env.PRIVKEY)
        .toString();

    await queryRunner.query(`
      insert into
        category (name, description)
        values
        ("IT", "개발"),
        ("회계", "회계"),
        ("독서", "독서"),
        ("그림", "그림"),
        ("자기계발", "자기계발");
    `);

    await queryRunner.query(`
      insert into
        grade (\`name\`, \`description\`)
        values
        ("브론즈", "매우 낮음"),
        ("실버", "중간"),
        ("골드", "높음"),
        ("다이아몬드", "조금 높음"),
        ("플래티넘", "매우 높음")
    `);

    const users = [
      {
        grade_id: 1,
        username: 'devkimson',
        email: 'chaplet01@gmail.com',
        phone_number: '010-1212-2323',
        birth: '1993-11-25',
        gender: 1,
        password: createPassword('chaplet01@gmail.com', '12345'),
      },
      {
        grade_id: 1,
        username: 'devkimson2',
        email: 'chaplet1125@gmail.com',
        phone_number: '010-1212-2323',
        birth: '1993-11-25',
        gender: 0,
        password: createPassword('chaplet1125@gmail.com', '12345'),
      },
    ];

    for (const user of users) {
      await queryRunner.query(
        `insert into
        user
        (
          grade_id,
          username,
          email,
          phone_number,
          birth,
          gender,
          password
          )
        values
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
          )
      `,
        Object.values(user),
      );
    }

    const seminars = [
      {
        host_id: 1,
        category_id: 2,
        title: 'test',
        content: 'test content',
        meeting_place: 'seoul',
        limit_participant_amount: 15,
        recruit_start_date: '2023-11-12',
        recruit_end_date: '2023-11-12',
        seminar_start_date: '2023-11-14',
        seminar_end_date: '2023-11-15',
      },
      {
        host_id: 2,
        category_id: 2,
        title: 'test2',
        content: 'test content2',
        meeting_place: 'jeonju',
        limit_participant_amount: 30,
        recruit_start_date: '2023-11-12',
        recruit_end_date: '2023-11-12',
        seminar_start_date: '2023-11-14',
        seminar_end_date: '2023-11-15',
      },
    ];

    for (const seminar of seminars) {
      await queryRunner.query(
        `
        insert into seminar (host_id, category_id, title, content, meeting_place, limit_participant_amount, recruit_start_date, recruit_end_date, seminar_start_date, seminar_end_date) values (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        );
      `,
        Object.values(seminar),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`DELETE FROM user;`);
  }
}
