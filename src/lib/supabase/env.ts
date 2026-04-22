export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPERBASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPERBASE_ANON_KEY;

  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPERBASE_URL");
  if (!anonKey) throw new Error("Missing env: NEXT_PUBLIC_SUPERBASE_ANON_KEY");

  return { url, anonKey };
}

