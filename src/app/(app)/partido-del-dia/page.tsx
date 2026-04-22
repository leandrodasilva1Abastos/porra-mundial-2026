import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertMatchPrediction } from "@/app/(app)/predictions/actions";
import { redirect } from "next/navigation";

export default async function PartidoDelDiaPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      "id,kickoff_at,teams_home:home_team_id(name),teams_away:away_team_id(name)",
    )
    .eq("is_match_of_day", true)
    .order("kickoff_at", { ascending: true });

  if (error) throw new Error(error.message);

  const { data: preds } = await supabase
    .from("match_predictions")
    .select("match_id,home_score,away_score")
    .eq("user_id", user.id);

  const predByMatch = new Map<string, any>();
  for (const p of preds ?? []) predByMatch.set((p as any).match_id, p);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Partido del día</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Pronostica el marcador exacto de los partidos seleccionados.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-600">
          Para activar esta sección, marca partidos con{" "}
          <code className="px-1">is_match_of_day = true</code> en la tabla{" "}
          <code className="px-1">matches</code>.
        </p>
      </div>

      <div className="grid gap-3">
        {(matches ?? []).map((m: any) => (
          <div
            key={m.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-semibold">
                {m.teams_home?.name ?? "TBD"} vs {m.teams_away?.name ?? "TBD"}
              </h2>
              <span className="text-xs text-zinc-500">
                {new Date(m.kickoff_at).toLocaleString()}
              </span>
            </div>

            <form
              className="mt-4 flex items-end gap-3"
              action={upsertMatchPrediction}
            >
              <input type="hidden" name="matchId" value={m.id} />
              <input
                type="hidden"
                name="revalidate"
                value="/partido-del-dia"
              />
              <ScoreInput
                name="homeScore"
                label={m.teams_home?.name ?? "Local"}
                defaultValue={predByMatch.get(m.id)?.home_score ?? ""}
              />
              <span className="pb-2 text-zinc-500">-</span>
              <ScoreInput
                name="awayScore"
                label={m.teams_away?.name ?? "Visitante"}
                defaultValue={predByMatch.get(m.id)?.away_score ?? ""}
              />
              <button className="ml-auto rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
                Guardar
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreInput({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string | number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <input
        className="mt-1 w-20 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm tabular-nums"
        name={name}
        type="number"
        min={0}
        max={20}
        required
        defaultValue={defaultValue}
      />
    </label>
  );
}

