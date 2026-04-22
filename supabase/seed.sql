-- Seed minimal data (groups + placeholder teams).
-- Replace team names with official 2026 teams when known.

insert into public.groups (code, name)
values
  ('A','Grupo A'),('B','Grupo B'),('C','Grupo C'),('D','Grupo D'),
  ('E','Grupo E'),('F','Grupo F'),('G','Grupo G'),('H','Grupo H'),
  ('I','Grupo I'),('J','Grupo J'),('K','Grupo K'),('L','Grupo L')
on conflict (code) do nothing;

do $$
declare
  g record;
  t1 uuid;
  t2 uuid;
  t3 uuid;
  t4 uuid;
begin
  for g in select id, code from public.groups order by code loop
    insert into public.teams (name) values
      ('Equipo ' || g.code || '1'),
      ('Equipo ' || g.code || '2'),
      ('Equipo ' || g.code || '3'),
      ('Equipo ' || g.code || '4')
    on conflict (name) do nothing;

    select id into t1 from public.teams where name = ('Equipo ' || g.code || '1');
    select id into t2 from public.teams where name = ('Equipo ' || g.code || '2');
    select id into t3 from public.teams where name = ('Equipo ' || g.code || '3');
    select id into t4 from public.teams where name = ('Equipo ' || g.code || '4');

    insert into public.group_teams (group_id, team_id)
    values (g.id, t1), (g.id, t2), (g.id, t3), (g.id, t4)
    on conflict do nothing;
  end loop;
end $$;

