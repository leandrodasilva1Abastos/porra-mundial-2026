-- Phase 2: knockout winner predictions (R16/QF/SF/F)

create table if not exists public.match_winner_predictions (
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  winner_team_id uuid not null references public.teams(id) on delete restrict,
  updated_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

alter table public.match_winner_predictions enable row level security;

create policy "match_winner_predictions_select_own" on public.match_winner_predictions
for select using (auth.uid() = user_id);

create policy "match_winner_predictions_insert_own_before_kickoff" on public.match_winner_predictions
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.matches m
    where m.id = match_winner_predictions.match_id
      and now() < m.kickoff_at
  )
);

create policy "match_winner_predictions_update_own_before_kickoff" on public.match_winner_predictions
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.matches m
    where m.id = match_winner_predictions.match_id
      and now() < m.kickoff_at
  )
);

