"use client";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  running: "bg-sky-100 text-sky-800",
  success: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

export default function TaskList({ loading, tasks, onRunTask }) {
  if (loading) {
    return <p className="mt-6 text-sm text-slate-600">Loading tasks...</p>;
  }

  if (!tasks.length) {
    return (
      <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-600">
        No tasks yet. Create one from the panel on the left.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      {tasks.map((task) => (
        <article
          key={task._id}
          className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-slate-900">{task.title}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    statusStyles[task.status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {task.status}
                </span>
              </div>

              <p className="text-sm text-slate-600">
                Operation: <span className="font-medium text-slate-800">{task.operation}</span>
              </p>
              <p className="text-sm text-slate-600">
                Input: <span className="font-medium text-slate-800">{task.input}</span>
              </p>
              <p className="text-sm text-slate-600">
                Result: <span className="font-medium text-slate-800">{task.result || "Not ready yet"}</span>
              </p>

              {Array.isArray(task.logs) && task.logs.length ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">Logs</p>
                  <ul className="mt-2 space-y-1">
                    {task.logs.map((log, index) => (
                      <li key={`${task._id}-${index}`}>{log}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <button
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={task.status === "running"}
              onClick={() => onRunTask(task._id)}
              type="button"
            >
              {task.status === "running" ? "Running..." : "Run Task"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
