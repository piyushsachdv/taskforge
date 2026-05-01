"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, getApiError } from "../../lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api("/auth/register", "POST", { email, password });
      setSuccess(response.message || "User registered");
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      setError(getApiError(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-[var(--panel)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">
          TaskForge
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Register once, then log in to submit tasks and track worker progress in real time.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <input
            className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 outline-none transition focus:border-rose-400"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 outline-none transition focus:border-rose-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}

          {success ? (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <button
            className="w-full rounded-2xl bg-rose-600 px-4 py-3 font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-medium text-orange-600 hover:text-orange-700" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
