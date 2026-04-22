"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertWinnerPrediction(formData: FormData) {
  const matchId = String(formData.get("matchId"));
  const winnerTeamId = String(formData.get("winnerTeamId"));

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Not authenticated");

  const { error } = await supabase.from("match_winner_predictions").upsert(
    {
      user_id: user.id,
      match_id: matchId,
      winner_team_id: winnerTeamId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,match_id" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/fase-2");
}

