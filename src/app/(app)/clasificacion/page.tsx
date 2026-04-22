import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ClasificacionPage() {
  const supabase = createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("leaderboard")
    .select("user_id,name,points")
    .order("points", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clasificación</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Puntos acumulados de todos los jugadores.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-12 gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-600">
          <div className="col-span-2">Pos.</div>
          <div className="col-span-8">Jugador</div>
          <div className="col-span-2 text-right">Puntos</div>
        </div>
        <div className="divide-y divide-zinc-100">
          {(rows ?? []).map((r: any, idx: number) => (
            <div
              key={r.user_id}
              className="grid grid-cols-12 gap-3 px-4 py-3 text-sm"
            >
              <div className="col-span-2 text-zinc-500">{idx + 1}</div>
              <div className="col-span-8 font-medium">{r.name}</div>
              <div className="col-span-2 text-right tabular-nums">
                {r.points}
              </div>
            </div>
          ))}
          {rows?.length ? null : (
            <div className="px-4 py-6 text-sm text-zinc-600">
              Aún no hay puntos. Cuando se vayan registrando resultados y puntos
              en <code className="px-1">points_ledger</code>, aparecerán aquí.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

