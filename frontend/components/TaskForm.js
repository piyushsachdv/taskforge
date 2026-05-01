"use client";

import { useState } from "react";
import { api, getApiError } from "../lib/api";

const operationOptions = [
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "reverse", label: "Reverse" },
  { value: "wordcount", label: "Word Count" },
];

export default function TaskForm({ onCreated, onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [operation, setOperation] = useState("uppercase");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = window.localStorage.getItem("token");

      await api(
        "/tasks",
        "POST",
        { title, input, operation },
        token
      );

      setTitle("");
      setInput("");
      setOperation("uppercase");
      setSuccess("Task created successfully");

      const refreshTasks = onTaskCreated || onCreated;

      if (refreshTasks) {
        await refreshTasks();
      }
    } catch (err) {
      setError(getApiError(err, "Could not create task"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-[var(--panel)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">
        New Task
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create a text job</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Submit input, choose an operation, then run the worker from the task list.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 outline-none transition focus:border-rose-400"
          placeholder="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <textarea
          className="min-h-32 w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 outline-none transition focus:border-rose-400"
          placeholder="Enter text to process"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          required
        />

        <select
          className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 outline-none transition focus:border-rose-400"
          value={operation}
          onChange={(event) => setOperation(event.target.value)}
        >
          {operationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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
          {loading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </section>
  );
}
