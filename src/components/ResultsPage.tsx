"use client";

import { useEffect, useMemo, useState } from "react";
import { SunnySky } from "./SunnySky";
import { syncSession } from "@/lib/client-save";
import type { AnswerPair } from "@/lib/store";

function buildChatMessage(answers: AnswerPair[]) {
  const lines = answers.map((a, i) => {
    const tag = [
      a.kind,
      a.after_i_love_you ? "after-i-love-you" : null,
    ]
      .filter(Boolean)
      .join(", ");
    return `${i + 1}. ${a.question}\n→ ${a.answer}${tag ? ` [${tag}]` : ""}`;
  });
  return [
    "ok so i took ur little 'Seen' quiz ☀️",
    "here are my official answers (do not cry):",
    "",
    ...lines,
    "",
    "sending this in chat like u asked. you're welcome.",
  ].join("\n");
}

function roastScore(answers: AnswerPair[]) {
  const soft = answers.filter((a) => a.kind === "soft").length;
  return Math.max(0, answers.length - soft);
}

export function ResultsPage({
  answers,
  dodgeCount = 0,
  sessionId = null,
}: {
  answers: AnswerPair[];
  dodgeCount?: number;
  sessionId?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(false);
  const message = useMemo(() => buildChatMessage(answers), [answers]);
  const score = roastScore(answers);

  useEffect(() => {
    if (!sessionId) return;
    void syncSession(sessionId, {
      answers,
      dodge_count: dodgeCount,
      completed: true,
    });
  }, [sessionId, answers, dodgeCount]);

  const verdict =
    score >= 4
      ? "Certified menace. The sun is scared of you."
      : score >= 2
        ? "Half roast, half soft. Confusing. Iconic."
        : "You went soft. Suspicious. Cute? Maybe.";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setPulse(true);
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setPulse(false), 500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <SunnySky />

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-10 sm:px-8">
        <div className="animate-bounce-in">
          <p className="font-[family-name:var(--font-display)] text-center text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Seen™
          </p>

          <h1 className="font-[family-name:var(--font-display)] mt-4 text-balance text-center text-2xl font-semibold text-ink sm:text-3xl">
            Exhibit A: your answers
          </h1>
          <p className="mt-2 text-center text-sm font-medium text-roast">
            {verdict}
          </p>
          <p className="mt-1 text-center text-xs text-ink-soft">
            Roast score: {score}/{answers.length}
            {dodgeCount > 0 ? ` · soft dodges: ${dodgeCount}` : ""}
          </p>
          <p className="mt-2 text-center text-xs font-semibold text-leaf">
            ✓ Saved to the database — no WhatsApp required for him to see this.
          </p>

          <ul className="mt-7 space-y-3">
            {answers.map((a, i) => (
              <li
                key={`${i}-${a.question}`}
                className="animate-slide-option rounded-2xl border border-ink/10 bg-paper/95 px-4 py-3.5 shadow-[0_8px_24px_rgba(26,42,58,0.08)]"
                style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-roast">
                    Crime #{i + 1}
                  </p>
                  {a.kind && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        a.kind === "soft"
                          ? "bg-leaf/15 text-leaf"
                          : a.kind === "i-love-you"
                            ? "bg-sun/40 text-roast"
                            : a.kind === "soft-reason"
                              ? "bg-sun/30 text-ink"
                              : "bg-roast/10 text-roast"
                      }`}
                    >
                      {a.kind}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-soft">{a.question}</p>
                <p className="mt-2 text-base font-bold text-ink">→ {a.answer}</p>
                {a.after_i_love_you && (
                  <p className="mt-1 text-xs font-medium text-roast">
                    clicked after “I love you”
                  </p>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-center text-sm font-semibold text-ink">
            Optional: still copy & send in chat if you want drama.
          </p>

          <pre className="mt-4 max-h-44 overflow-auto whitespace-pre-wrap rounded-2xl border border-dashed border-ink/15 bg-paper/80 p-4 text-left text-sm leading-relaxed text-ink-soft">
            {message}
          </pre>

          <button
            type="button"
            onClick={copy}
            className={`mt-5 w-full rounded-2xl bg-roast px-5 py-4 text-base font-bold text-paper shadow-[0_12px_28px_rgba(232,93,76,0.35)] transition hover:brightness-110 active:scale-[0.98] ${
              pulse ? "animate-shake" : "animate-pulse-cta"
            }`}
          >
            {copied ? "Copied ✨" : "Copy answers (optional)"}
          </button>
        </div>
      </main>
    </div>
  );
}
