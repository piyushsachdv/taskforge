"use client";

export default function Navbar({ onLogout }) {
  return (
    <header className="rounded-[2rem] border border-white/70 bg-[var(--panel-strong)] px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">
            TaskForge
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Operations Console
          </h1>
        </div>

        <button
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          onClick={onLogout}
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
