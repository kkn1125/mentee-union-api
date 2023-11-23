use `mentee-union`;

show tables;
select * from user;
select * from user_recommend;
select * from seminar_participant;
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



