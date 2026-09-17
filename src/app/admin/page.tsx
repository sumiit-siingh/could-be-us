"use client";

import { useEffect, useState } from "react";
import { SunnySky } from "@/components/SunnySky";
import type { SessionRecord } from "@/lib/store";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [storage, setStorage] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("seen-admin-secret");
    if (saved) setSecret(saved);
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        headers: { "x-admin-secret": secret },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load");
        setSessions([]);
        return;
      }
      setSessions(data.sessions as SessionRecord[]);
      setStorage(data.storage as string);
      sessionStorage.setItem("seen-admin-secret", secret);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh">
      <SunnySky />
      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
          Seen™ Admin
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          View every response saved from the quiz (including soft / positive
          catches). No WhatsApp needed.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            className="flex-1 rounded-xl border border-ink/10 bg-paper/95 px-4 py-3 text-sm outline-none focus:border-sun-hot"
          />
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || !secret}
            className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load responses"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-roast">{error}</p>
        )}
        {storage && (
          <p className="mt-2 text-xs text-ink-soft">
            Storage: <span className="font-semibold">{storage}</span> ·{" "}
            {sessions.length} session(s)
          </p>
        )}

        <ul className="mt-8 space-y-4">
          {sessions.map((s) => {
            const softCount = s.answers.filter((a) => a.kind === "soft").length;
            const loveCount = s.answers.filter(
              (a) => a.kind === "i-love-you",
            ).length;
            const open = openId === s.id;
            return (
              <li
                key={s.id}
                className="rounded-2xl border border-ink/10 bg-paper/95 p-4 shadow-[0_8px_24px_rgba(26,42,58,0.08)]"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 text-left"
                  onClick={() => setOpenId(open ? null : s.id)}
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {new Date(s.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {s.answers.length} answers · dodges {s.dodge_count} · soft
                      caught {softCount}
                      {loveCount > 0 ? ` · I love you ×${loveCount}` : ""} ·{" "}
                      {s.completed ? "completed" : "in progress"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-roast">
                    {open ? "Hide" : "View"}
                  </span>
                </button>

                {open && (
                  <ul className="mt-4 space-y-3 border-t border-ink/10 pt-4">
                    {s.answers.length === 0 && (
                      <li className="text-sm text-ink-soft">No answers yet.</li>
                    )}
                    {s.answers.map((a, i) => (
                      <li key={`${s.id}-${i}`} className="text-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-roast">
                          #{i + 1} {a.kind ? `· ${a.kind}` : ""}
                          {a.after_i_love_you ? " · after I love you" : ""}
                        </p>
                        <p className="text-ink-soft">{a.question}</p>
                        <p className="font-semibold text-ink">→ {a.answer}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
