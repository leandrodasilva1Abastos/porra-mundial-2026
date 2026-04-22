-- Scoring views (computed from picks + results)

create or replace view public.v_group_top3_points as
select
  p.user_id,
  p.group_id,
  (
    (case when r1.team_id = p.first_team_id then 3 when r1.team_id in (p.second_team_id, p.third_team_id) then 1 else 0 end) +
    (case when r2.team_id = p.second_team_id then 3 when r2.team_id in (p.first_team_id, p.third_team_id) then 1 else 0 end) +
    (case when r3.team_id = p.third_team_id then 3 when r3.team_id in (p.first_team_id, p.second_team_id) then 1 else 0 end)
  )::int as points
from public.picks_group_top3 p
left join public.group_results_top3 r1 on r1.group_id = p.group_id and r1.position = 1
left join public.group_results_top3 r2 on r2.group_id = p.group_id and r2.position = 2
left join public.group_results_top3 r3 on r3.group_id = p.group_id and r3.position = 3;

create or replace view public.v_match_score_points as
select
  p.user_id,
  p.match_id,
  (
    case
      when p.home_score = r.home_score and p.away_score = r.away_score then 3
      when (p.home_score - p.away_score) = (r.home_score - r.away_score) then 1
      when (p.home_score > p.away_score and r.home_score > r.away_score)
        or (p.home_score < p.away_score and r.home_score < r.away_score)
        or (p.home_score = p.away_score and r.home_score = r.away_score)
        then 1
      else 0
    end
  )::int as points
from public.match_predictions p
join public.match_results r on r.match_id = p.match_id;

create or replace view public.v_match_winner_points as
select
  p.user_id,
  p.match_id,
  (
    case
      when (
        case
          when r.home_score > r.away_score then m.home_team_id
          when r.home_score < r.away_score then m.away_team_id
          else null
        end
      ) = p.winner_team_id then 2
      else 0
    end
  )::int as points
from public.match_winner_predictions p
join public.match_results r on r.match_id = p.match_id
join public.matches m on m.id = p.match_id;

create or replace view public.v_all_points as
select user_id, sum(points)::int as points
from (
  select user_id, points from public.v_group_top3_points
  union all
  select user_id, points from public.v_match_score_points
  union all
  select user_id, points from public.v_match_winner_points
  union all
  select user_id, points from public.points_ledger
) x
group by user_id;

create or replace view public.leaderboard as
select
  u.id as user_id,
  coalesce(p.display_name, u.email) as name,
  coalesce(ap.points, 0)::int as points
from auth.users u
left join public.profiles p on p.user_id = u.id
left join public.v_all_points ap on ap.user_id = u.id
order by points desc, name asc;

