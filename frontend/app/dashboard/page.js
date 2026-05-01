"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import TaskForm from "../../components/TaskForm";
import TaskList from "../../components/TaskList";
import { api, getApiError } from "../../lib/api";

const loadTasks = async (authToken) => {
  const data = await api("/tasks", "GET", undefined, authToken);
  return Array.isArray(data) ? data : [];
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const getToken = () => window.localStorage.getItem("token");

  const fetchTasks = useCallback(async (authToken) => {
    try {
      const data = await loadTasks(authToken);
      setTasks(data);
      setError("");
    } catch (err) {
      const message = getApiError(err, "Could not load tasks");
      setError(message);

      if (message === "Invalid token" || message === "No token provided") {
        window.localStorage.removeItem("token");
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("token");

    if (!savedToken) {
      router.replace("/login");
      return;
    }

    const initialLoadId = window.setTimeout(() => {
      void fetchTasks(savedToken);
    }, 0);

    const intervalId = window.setInterval(() => {
      void fetchTasks(savedToken);
    }, 8000);

    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [fetchTasks, router]);

  const handleTaskCreated = async () => {
    const savedToken = getToken();

    if (savedToken) {
      await fetchTasks(savedToken);
    }
  };

  const handleRunTask = async (taskId) => {
    const savedToken = getToken();

    if (!savedToken) {
      router.replace("/login");
      return;
    }

    try {
      await api(`/tasks/${taskId}/run`, "POST", undefined, savedToken);
      await fetchTasks(savedToken);
    } catch (err) {
      setError(getApiError(err, "Could not run task"));
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Navbar onLogout={handleLogout} />

        <section className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
          <TaskForm onCreated={handleTaskCreated} />

          <div className="rounded-[2rem] border border-white/70 bg-[var(--panel)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-600">
                  Live Tasks
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Dashboard</h2>
              </div>
              <span className="rounded-full bg-white/80 px-4 py-2 text-sm text-slate-600">
                Refreshing every 8s
              </span>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <TaskList
              loading={loading}
              tasks={tasks}
              onRunTask={handleRunTask}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
