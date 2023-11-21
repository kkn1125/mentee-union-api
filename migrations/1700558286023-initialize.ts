import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initialize1700558286023 implements MigrationInterface {
  name = 'Initialize1700558286023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('run query');
    await queryRunner.query(`
      insert into
        category (name, description)
        values
        ('IT', '개발'),
        ('회계', '회계'),
        ('독서', '독서'),
        ('그림', '그림'),
        ('자기계발', '자기계발');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM user;`);
  }
}
