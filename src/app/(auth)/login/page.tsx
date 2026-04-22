import Link from "next/link";
import { signInWithPassword } from "../actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Porra Mundial 2026
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Entra con tu email y contraseña.
        </p>

        {searchParams?.error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {decodeURIComponent(searchParams.error)}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" action={signInWithPassword}>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              type="email"
              name="email"
              required
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Contraseña</span>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </label>
          <button className="w-full rounded-lg bg-black text-white py-2 font-medium">
            Entrar
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-600">
          ¿No tienes cuenta?{" "}
          <Link className="text-black underline" href="/register">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

