"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertGroupTop3(formData: FormData) {
  const groupId = Number(formData.get("groupId"));
  const firstTeamId = String(formData.get("firstTeamId"));
  const secondTeamId = String(formData.get("secondTeamId"));
  const thirdTeamId = String(formData.get("thirdTeamId"));

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Not authenticated");

  const { error } = await supabase.from("picks_group_top3").upsert(
    {
      user_id: user.id,
      group_id: groupId,
      first_team_id: firstTeamId,
      second_team_id: secondTeamId,
      third_team_id: thirdTeamId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,group_id" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/fase-1");
}

