import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertGroupTop3 } from "./actions";
import { redirect } from "next/navigation";

type Group = { id: number; code: string; name: string };
type Team = { id: string; name: string };

export default async function Fase1Page() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("id,code,name")
    .order("code");
  if (groupsError) throw new Error(groupsError.message);

  const { data: groupTeams, error: groupTeamsError } = await supabase
    .from("group_teams")
    .select("group_id,teams(id,name)")
    .order("group_id");
  if (groupTeamsError) throw new Error(groupTeamsError.message);

  const safeGroups = (groups ?? []) as Group[];

  const teamsByGroup = new Map<number, Team[]>();
  for (const row of groupTeams ?? []) {
    const team = (row as any).teams as Team | null;
    if (!team) continue;
    const gid = (row as any).group_id as number;
    teamsByGroup.set(gid, [...(teamsByGroup.get(gid) ?? []), team].sort((a, b) => a.name.localeCompare(b.name)));
  }

  const { data: picks } = await supabase
    .from("picks_group_top3")
    .select("group_id,first_team_id,second_team_id,third_team_id")
    .eq("user_id", user.id);

  const pickByGroup = new Map<number, any>();
  for (const p of picks ?? []) pickByGroup.set((p as any).group_id, p);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fase 1</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Pronostica el Top 3 de cada uno de los 12 grupos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {safeGroups.map((g) => {
          const teams = teamsByGroup.get(g.id) ?? [];
          const pick = pickByGroup.get(g.id);

          return (
            <form
              key={g.id}
              action={upsertGroupTop3}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <input type="hidden" name="groupId" value={g.id} />
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-semibold">
                  Grupo {g.code}{" "}
                  <span className="font-normal text-zinc-500">{g.name}</span>
                </h2>
                <span className="text-xs text-zinc-500">
                  {pick ? "Guardado" : "Sin guardar"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <Select
                  name="firstTeamId"
                  label="1º"
                  teams={teams}
                  defaultValue={pick?.first_team_id ?? ""}
                />
                <Select
                  name="secondTeamId"
                  label="2º"
                  teams={teams}
                  defaultValue={pick?.second_team_id ?? ""}
                />
                <Select
                  name="thirdTeamId"
                  label="3º"
                  teams={teams}
                  defaultValue={pick?.third_team_id ?? ""}
                />
              </div>

              <button className="mt-4 w-full rounded-lg bg-black py-2 text-sm font-medium text-white">
                Guardar grupo {g.code}
              </button>
            </form>
          );
        })}
        {safeGroups.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 md:col-span-2">
            No hay grupos visibles. Revisa permisos/RLS en Supabase para la tabla{" "}
            <code className="px-1">groups</code>.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Select({
  name,
  label,
  teams,
  defaultValue,
}: {
  name: string;
  label: string;
  teams: Team[];
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <select
        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm"
        name={name}
        defaultValue={defaultValue}
        required
      >
        <option value="" disabled>
          Selecciona
        </option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}

