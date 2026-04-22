-- Make reference tables readable even if RLS is enabled.
-- This prevents empty results for groups/teams in the app.

alter table public.groups enable row level security;
alter table public.teams enable row level security;
alter table public.group_teams enable row level security;
alter table public.matches enable row level security;

do $$
begin
  create policy "groups_read_all" on public.groups
    for select using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "teams_read_all" on public.teams
    for select using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "group_teams_read_all" on public.group_teams
    for select using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "matches_read_all" on public.matches
    for select using (true);
exception when duplicate_object then null;
end $$;

