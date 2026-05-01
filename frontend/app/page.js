"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fef3c7,transparent_32%),linear-gradient(135deg,#fff7ed_0%,#fde68a_45%,#fb7185_100%)] px-6">
      <div className="rounded-3xl border border-white/50 bg-white/70 px-8 py-6 text-sm font-medium text-slate-700 shadow-xl backdrop-blur">
        Redirecting...
      </div>
    </main>
  );
}
