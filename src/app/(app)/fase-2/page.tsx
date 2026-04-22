import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertWinnerPrediction } from "./actions";

export default async function Fase2Page() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      "id,stage,kickoff_at,teams_home:home_team_id(id,name),teams_away:away_team_id(id,name)",
    )
    .neq("stage", "GROUP")
    .order("kickoff_at", { ascending: true });
  if (error) throw new Error(error.message);

  const { data: preds } = await supabase
    .from("match_winner_predictions")
    .select("match_id,winner_team_id")
    .eq("user_id", user!.id);

  const predByMatch = new Map<string, string>();
  for (const p of preds ?? []) predByMatch.set((p as any).match_id, (p as any).winner_team_id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fase 2</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Pronostica el ganador de cada partido eliminatorio (octavos, cuartos,
          semifinales y final).
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        Para mostrar aquí el cuadro, crea partidos en <code className="px-1">matches</code>{" "}
        con <code className="px-1">stage</code> = <code className="px-1">R16/QF/SF/F</code>{" "}
        y sus equipos/horas.
      </div>

      <div className="grid gap-3">
        {(matches ?? []).map((m: any) => {
          const winner = predByMatch.get(m.id) ?? "";
          const home = m.teams_home;
          const away = m.teams_away;

          return (
            <form
              key={m.id}
              action={upsertWinnerPrediction}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <input type="hidden" name="matchId" value={m.id} />
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-semibold">
                  <span className="text-zinc-500">{m.stage}</span>{" "}
                  {home?.name ?? "TBD"} vs {away?.name ?? "TBD"}
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(m.kickoff_at).toLocaleString()}
                </span>
              </div>

              <div className="mt-4 flex items-end gap-3">
                <label className="block flex-1">
                  <span className="text-xs font-medium text-zinc-600">
                    Ganador
                  </span>
                  <select
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm"
                    name="winnerTeamId"
                    defaultValue={winner}
                    required
                  >
                    <option value="" disabled>
                      Selecciona
                    </option>
                    {home?.id ? <option value={home.id}>{home.name}</option> : null}
                    {away?.id ? <option value={away.id}>{away.name}</option> : null}
                  </select>
                </label>
                <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
                  Guardar
                </button>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}

