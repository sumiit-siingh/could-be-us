"use client";

import type { AnswerPair } from "@/lib/store";

export async function startSession(): Promise<string | null> {
  try {
    const res = await fetch("/api/sessions", { method: "POST" });
    if (!res.ok) return null;
    const data = (await res.json()) as { session: { id: string } };
    return data.session.id;
  } catch {
    return null;
  }
}

export async function syncSession(
  id: string,
  payload: {
    answers: AnswerPair[];
    dodge_count: number;
    completed?: boolean;
  },
) {
  try {
    await fetch(`/api/sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // silent — quiz still works offline visually
  }
}
