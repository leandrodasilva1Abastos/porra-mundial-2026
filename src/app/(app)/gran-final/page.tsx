import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertMatchPrediction } from "@/app/(app)/predictions/actions";

export default async function GranFinalPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: finalMatch } = await supabase
    .from("matches")
    .select("id,kickoff_at,teams_home:home_team_id(name),teams_away:away_team_id(name)")
    .eq("is_grand_final", true)
    .maybeSingle();

  const { data: cutoff } = finalMatch
    ? await supabase
        .from("match_prediction_cutoffs")
        .select("cutoff_at")
        .eq("user_id", user!.id)
        .eq("match_id", finalMatch.id)
        .maybeSingle()
    : { data: null };

  const { data: pred } = finalMatch
    ? await supabase
        .from("match_predictions")
        .select("home_score,away_score")
        .eq("user_id", user!.id)
        .eq("match_id", finalMatch.id)
        .maybeSingle()
    : { data: null };

  const homeName = finalMatch
    ? Array.isArray((finalMatch as any).teams_home)
      ? (finalMatch as any).teams_home?.[0]?.name
      : (finalMatch as any).teams_home?.name
    : undefined;
  const awayName = finalMatch
    ? Array.isArray((finalMatch as any).teams_away)
      ? (finalMatch as any).teams_away?.[0]?.name
      : (finalMatch as any).teams_away?.name
    : undefined;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gran final</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Pronostica el marcador final con hora límite por jugador según su
          posición en la clasificación.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-600">
          Configura el partido de la gran final en{" "}
          <code className="px-1">matches</code> con{" "}
          <code className="px-1">is_grand_final = true</code>, y los límites
          por jugador en <code className="px-1">match_prediction_cutoffs</code>.
        </p>
      </div>

      {finalMatch ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-semibold">
              {homeName ?? "TBD"} vs {awayName ?? "TBD"}
            </h2>
            <span className="text-xs text-zinc-500">
              {new Date(finalMatch.kickoff_at).toLocaleString()}
            </span>
          </div>

          <div className="mt-2 text-sm text-zinc-600">
            <div>
              <span className="font-medium">Tu hora límite:</span>{" "}
              {cutoff?.cutoff_at
                ? new Date(cutoff.cutoff_at).toLocaleString()
                : "si no hay cutoff personalizado, aplica la hora de inicio del partido"}
            </div>
          </div>

          <form className="mt-4 flex items-end gap-3" action={upsertMatchPrediction}>
            <input type="hidden" name="matchId" value={finalMatch.id} />
            <input type="hidden" name="revalidate" value="/gran-final" />
            <ScoreInput
              name="homeScore"
              label={homeName ?? "Local"}
              defaultValue={pred?.home_score ?? ""}
            />
            <span className="pb-2 text-zinc-500">-</span>
            <ScoreInput
              name="awayScore"
              label={awayName ?? "Visitante"}
              defaultValue={pred?.away_score ?? ""}
            />
            <button className="ml-auto rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
              Guardar
            </button>
          </form>
        </div>
      ) : null}
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

