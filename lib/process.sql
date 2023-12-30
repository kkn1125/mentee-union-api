use `mentee-union`;

insert into
        grade (`name`, `description`)
        values
        ("브론즈", "매우 낮음"),
        ("실버", "중간"),
        ("골드", "높음"),
        ("다이아몬드", "조금 높음"),
        ("플래티넘", "매우 높음");

insert into
        category (name, description)
        values
        ("IT", "개발"),
        ("회계", "회계"),
        ("독서", "독서"),
        ("그림", "그림"),
        ("자기계발", "자기계발");

#alter table mentoring modify column status varchar(45) default 'waitlist';
desc mentoring_session;
select * from information_schema.tables where table_schema = 'mentee-union' and table_name = 'category';
show table status;
desc category;
create index complex_id_name_index on category (id,name);
analyze table category;
explain analyze table category;
select * from category;
drop index complext_id_name_index on category;
select * from category where name="it";
show index from category;
explain category;
show indexes from category;
select * from seminar;
select * from grade;
desc grade;
SELECT 
    id,
    host_id,
    category_id,
    title,
    content,
    recruit_start_date,
    recruit_end_date,
    seminar_start_date,
    seminar_end_date
FROM
    seminar;
desc board;
UPDATE seminar 
SET 
    recruit_start_date = '2023-12-31 00:00',
    recruit_end_date = '2023-12-31 16:00',
    seminar_start_date = '2024-1-1 09:00',
    seminar_end_date = '2024-1-1 20:00'
WHERE
    id = 5;
select * from board where type="qna" and (visible=true or user_id = 1);
#alter table board modify column id int not null auto_increment;
#desc board;
#alter table board add column view_count int not null default 0 after content;
update grade set name = "mentee0", description = "초기 멘티 등급입니다. 멘토링 커뮤니티에 적응하고 기본적인 활동을 시작하는 단계입니다." where id = 1;
update grade set name = "mentee1", description = "경험이 더 많은 멘티 등급입니다. 멘토링 활동을 통한 성장과 경험을 쌓는 단계입니다." where id = 2;
update grade set name = "mentor0", description = "신규 멘토 등급니다. 멘토로서의 첫 경험을 쌓고, 멘티들에게 지식을 전달하는 단계입니다." where id = 3;
update grade set name = "mentor1", description = "경험이 더 많은 멘토 등급입니다. 보다 전문적인 멘토링 제공 및 커뮤니티 내 리더십을 강화하는 단계입니다." where id = 4;
update grade set name = "mentor2", description = "고급 멘토 등급입니다. 멘토링 프로그램 개선에 기여하고 신규 멘토 육성에 노력하는 단계입니다." where id = 5;
select * from forum_like;
alter table forum_like add column deleted_at timestamp default null, add column created_at timestamp not null default current_timestamp(), add column updated_at timestamp not null default current_timestamp() on update current_timestamp();
select * from seminar_participant;
explain select * from category;
select * from cover;
#update cover set origin_name='logo.png', new_name='e68269b19c577ff51dbb8b1bb0de0169bd9617081792734c49521c652186785b.png';
explain select * from category use index (complex_id_name_index) where name="it" and id = 1;
explain select * from category use index (primary) where name="it";
explain select * from category where id=1;
explain select * from category use index () where id=1;
explain select * from category use index (primary) where id=1;
select * from forum;
#alter table forum add column view_count int not null default 0 after content;

desc grade;
desc mentoring_session;

show index from mentoring_session;
select * from mentoring_session use index (`fk_mento-mentee-session_category1_idx`);
select * from mentoring_session;

#alter table mentoring_session add column password varchar(150) null after `limit`;
#alter table mentoring_session add column is_private tinyint not null default 0 after `password`;
#delete from mentoring_session;
#delete from mentoring;
select * from mentoring_session;
select * from mentoring;
#alter table profile add column created_at timestamp not null default current_timestamp after origin_name;
#alter table profile add column updated_at timestamp not null default current_timestamp on update current_timestamp after created_at;
desc forum;
desc seminar;
delete from mentoring;
delete from mentoring_session;
delete from message;
select * from message;
select * from read_message where user_id= 2;
select * from user;
select * from mentoring_session;
select * from mentoring;
select * from message;
select * from read_message;
select * from mentoring where mentoring_session_id = 1;
insert into forum (user_id, title, content) values
(2, "test forum1", "test forum content1"),(2, "test forum2", "test forum content2"),
(2, "test forum3", "test forum content3"),(2, "test forum5", "test forum content5");

INSERT INTO `mentee-union`.`seminar`
  (
    `host_id`,
    `category_id`,
    `title`,
    `content`,
    `meeting_place`,
    `limit_participant_amount`,
    `recruit_start_date`,
    `recruit_end_date`,
    `seminar_start_date`,
    `seminar_end_date`,
    `is_recruit_finished`,
    `is_seminar_finished`
    )
VALUES (
  2,
  1,
  "test title1",
  "test content1",
  "seoul jungrang-gu",
  10,
  "2023-12-12",
  "2023-12-14",
  "2023-12-20",
  "2023-12-21",
  0,
  0),(
  2,
  1,
  "test title2",
  "test content2",
  "seoul jungrang-gu",
  10,
  "2023-12-12",
  "2023-12-14",
  "2023-12-20",
  "2023-12-21",
  0,
  0);
#delete from read_message;
#delete from message;
select * from message where mentoring_session_id = 17 and id in (select message_id from read_message where user_id != 3);
select message_id from read_message where user_id != 3;
select message.* from message left join read_message on message.id = read_message.message_id where message.mentoring_session_id = 17 and read_message.user_id != 3;
#select * from read_message;
select distinct message.* from mentoring_session left join message on mentoring_session.id = message.mentoring_session_id left join read_message on message.user_id = read_message.user_id
where mentoring_session.id = 17 group by message.id;
select * from mentoring;
select * from mentoring left join mentoring_session on mentoring_session.id = mentoring.mentoring_session_id where mentoring.mentee_id = 2;
select * from read_message;
select * from message;
select * from mentoring_session;
select * from read_message order by id;
update mentoring set deleted_at = null;
desc mentoring_session;
desc message;
alter table mentoring_session add column `limit` int not null default 2 after note;
#delete from mentoring_session;
select * from user;
select * from messages;
update user set auth_email=1 where id=11;
select * from grade;
select * from user;
update user set points = 5;        

#drop table migrations;
show tables;
select * from user;
select * from profile;
delete from user;
desc user;
desc user;
select * from user_recommend;
select * from seminar_participant;
select * from grade;
        
select * from category;
select * from seminar;
# update user set email='chaplet01@gmail.com' where id=1;

SELECT 
    COUNT(*), SUM(points)
FROM
    user_recommend
WHERE
    giver_id = 1;

set @target_id=2;

SELECT 
    COUNT(CASE
        WHEN giver_id = @target_id THEN giver_id
    END) AS giver_recommend_points,
    SUM(CASE
        WHEN receiver_id = @target_id THEN points
    END) AS giver_received_points
FROM
    user_recommend;
    
set @target_id=null;

with GIVERS_RECOMMEND_POINTS AS (
  select count(*) as amount from user_recommend where giver_id = @target_id
),
GIVERS_RECEIVED_POINTS AS (
  select sum(points) AS points from user_recommend where receiver_id = @target_id
)
select amount, points from GIVERS_RECOMMEND_POINTS, GIVERS_RECEIVED_POINTS;

set @target_id=null;

select * from category;
select * from migrations;

select * from category where name = 'IT' OR name = '회계';

insert into user () values ();

insert into user_recommend (giver_id, receiver_id, points, reason) values (1,2,6,'그냥');
insert into seminar (host_id, category_id, title, content, meeting_place, limit_participant_amount, recruit_start_date, recruit_end_date, seminar_start_date, seminar_end_date) values (
  1,
  2,
  'test',
  'test conteent',
  'seoul',
  5,
  '2023-11-23',
  '2023-11-23',
  '2023-12-12',
  '2023-12-12'
);

update user set points=0;



