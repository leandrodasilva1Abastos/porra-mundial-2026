-- Porra Mundial 2026 - initial schema

create extension if not exists "pgcrypto";

-- Public reference data
create table if not exists public.groups (
  id bigserial primary key,
  code text not null unique,
  name text not null
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.group_teams (
  group_id bigint not null references public.groups(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  primary key (group_id, team_id)
);

create type public.match_stage as enum ('GROUP', 'R16', 'QF', 'SF', 'F');

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  stage public.match_stage not null,
  group_id bigint references public.groups(id) on delete set null,
  home_team_id uuid references public.teams(id) on delete set null,
  away_team_id uuid references public.teams(id) on delete set null,
  kickoff_at timestamptz not null,
  is_match_of_day boolean not null default false,
  is_grand_final boolean not null default false
);

-- Users
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- Phase 1: Top 3 per group
create table if not exists public.picks_group_top3 (
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id bigint not null references public.groups(id) on delete cascade,
  first_team_id uuid not null references public.teams(id) on delete restrict,
  second_team_id uuid not null references public.teams(id) on delete restrict,
  third_team_id uuid not null references public.teams(id) on delete restrict,
  updated_at timestamptz not null default now(),
  primary key (user_id, group_id),
  constraint picks_group_top3_distinct_teams check (
    first_team_id <> second_team_id
    and first_team_id <> third_team_id
    and second_team_id <> third_team_id
  )
);

-- Match score predictions (Partido del día + Gran final reuse this)
create table if not exists public.match_predictions (
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  home_score int not null check (home_score >= 0 and home_score <= 20),
  away_score int not null check (away_score >= 0 and away_score <= 20),
  updated_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

-- Per-user cutoff time (used for Gran final)
create table if not exists public.match_prediction_cutoffs (
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  cutoff_at timestamptz not null,
  primary key (user_id, match_id)
);

-- Results (admin-managed)
create table if not exists public.group_results_top3 (
  group_id bigint not null references public.groups(id) on delete cascade,
  position int not null check (position in (1,2,3)),
  team_id uuid not null references public.teams(id) on delete restrict,
  primary key (group_id, position)
);

create table if not exists public.match_results (
  match_id uuid primary key references public.matches(id) on delete cascade,
  home_score int not null check (home_score >= 0 and home_score <= 20),
  away_score int not null check (away_score >= 0 and away_score <= 20),
  updated_at timestamptz not null default now()
);

-- Points ledger (precomputed or granted by SQL functions)
create table if not exists public.points_ledger (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  ref_id uuid,
  points int not null,
  created_at timestamptz not null default now()
);

create view public.leaderboard as
select
  u.id as user_id,
  coalesce(p.display_name, u.email) as name,
  coalesce(sum(pl.points), 0)::int as points
from auth.users u
left join public.profiles p on p.user_id = u.id
left join public.points_ledger pl on pl.user_id = u.id
group by u.id, p.display_name, u.email
order by points desc, name asc;

-- RLS
alter table public.profiles enable row level security;
alter table public.picks_group_top3 enable row level security;
alter table public.match_predictions enable row level security;
alter table public.match_prediction_cutoffs enable row level security;
alter table public.points_ledger enable row level security;

-- profiles: users can read/write themselves
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = user_id);
create policy "profiles_upsert_own" on public.profiles
for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- picks_group_top3: own rows only
create policy "picks_group_top3_select_own" on public.picks_group_top3
for select using (auth.uid() = user_id);
create policy "picks_group_top3_upsert_own" on public.picks_group_top3
for insert with check (auth.uid() = user_id);
create policy "picks_group_top3_update_own" on public.picks_group_top3
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- match_predictions: own rows, and must be before kickoff / cutoff (if present)
create policy "match_predictions_select_own" on public.match_predictions
for select using (auth.uid() = user_id);

create policy "match_predictions_insert_own_before_deadline" on public.match_predictions
for insert
with check (
  auth.uid() = user_id
  and (
    exists (
      select 1
      from public.match_prediction_cutoffs c
      where c.user_id = match_predictions.user_id
        and c.match_id = match_predictions.match_id
        and now() < c.cutoff_at
    )
    or exists (
      select 1
      from public.matches m
      where m.id = match_predictions.match_id
        and now() < m.kickoff_at
    )
  )
);

create policy "match_predictions_update_own_before_deadline" on public.match_predictions
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    exists (
      select 1
      from public.match_prediction_cutoffs c
      where c.user_id = match_predictions.user_id
        and c.match_id = match_predictions.match_id
        and now() < c.cutoff_at
    )
    or exists (
      select 1
      from public.matches m
      where m.id = match_predictions.match_id
        and now() < m.kickoff_at
    )
  )
);

-- match_prediction_cutoffs: users can read own cutoff; writes should be admin-only (left without a policy)
create policy "match_prediction_cutoffs_select_own" on public.match_prediction_cutoffs
for select using (auth.uid() = user_id);

-- points_ledger: read-only own rows (admin writes)
create policy "points_ledger_select_own" on public.points_ledger
for select using (auth.uid() = user_id);

-- Public read reference tables (no RLS needed, but kept open explicitly)
-- (groups/teams/group_teams/matches) default to public read in Supabase unless RLS enabled.

