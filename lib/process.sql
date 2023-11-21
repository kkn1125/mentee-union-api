use `mentee-union`;

show tables;
select * from user;
select * from user_recommend;

select count(*),sum(points)from user_recommend where giver_id=1;

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

update user set points=0;



