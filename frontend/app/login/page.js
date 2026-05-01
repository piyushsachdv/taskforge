"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, getApiError } from "../../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api("/auth/login", "POST", { email, password });
      window.localStorage.setItem("token", response.token);
      router.push("/dashboard");
    } catch (err) {
      setError(getApiError(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-[var(--panel)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-600">
          TaskForge
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in to run tasks, monitor status updates, and review results from the dashboard.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <input
            className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 outline-none transition focus:border-orange-400"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 outline-none transition focus:border-orange-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Need an account?{" "}
          <Link className="font-medium text-rose-600 hover:text-rose-700" href="/register">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
