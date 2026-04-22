import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <Link className="font-semibold tracking-tight" href="/fase-1">
            Porra Mundial 2026
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="hover:underline" href="/fase-1">
              Fase 1
            </Link>
            <Link className="hover:underline" href="/fase-2">
              Fase 2
            </Link>
            <Link className="hover:underline" href="/partido-del-dia">
              Partido del día
            </Link>
            <Link className="hover:underline" href="/gran-final">
              Gran final
            </Link>
            <Link className="hover:underline" href="/clasificacion">
              Clasificación
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-600 hidden sm:inline">
              {user?.email ?? ""}
            </span>
            <form action={signOut}>
              <button className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

