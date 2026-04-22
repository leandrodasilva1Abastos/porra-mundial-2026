import Link from "next/link";
import { signUpWithPassword } from "../actions";

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Crear cuenta
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Regístrate con email y contraseña.
        </p>

        {searchParams?.error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {decodeURIComponent(searchParams.error)}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" action={signUpWithPassword}>
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
              autoComplete="new-password"
              minLength={8}
            />
          </label>
          <button className="w-full rounded-lg bg-black text-white py-2 font-medium">
            Crear cuenta
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-600">
          ¿Ya tienes cuenta?{" "}
          <Link className="text-black underline" href="/login">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

