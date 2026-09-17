export type AnswerKind =
  | "roast"
  | "soft"
  | "other"
  | "soft-reason"
  | "revenge"
  | "i-love-you";

export type AnswerPair = {
  question: string;
  answer: string;
  kind?: AnswerKind;
  /** true when she tapped soft after using “I love you” freeze */
  after_i_love_you?: boolean;
};

export type SessionRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  completed: boolean;
  dodge_count: number;
  answers: AnswerPair[];
};

function hasSupabase() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function localPath() {
  const { join } = await import("path");
  const { mkdir } = await import("fs/promises");
  const dir = join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  return join(dir, "submissions.json");
}

async function readLocal(): Promise<SessionRecord[]> {
  const { readFile } = await import("fs/promises");
  try {
    const raw = await readFile(await localPath(), "utf8");
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

async function writeLocal(rows: SessionRecord[]) {
  const { writeFile } = await import("fs/promises");
  await writeFile(await localPath(), JSON.stringify(rows, null, 2), "utf8");
}

export async function createSession(): Promise<SessionRecord> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const row: SessionRecord = {
    id,
    created_at: now,
    updated_at: now,
    completed: false,
    dodge_count: 0,
    answers: [],
  };

  if (hasSupabase()) {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/seen_sessions`,
      {
        method: "POST",
        headers: supabaseHeaders(),
        body: JSON.stringify({
          id: row.id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          completed: false,
          dodge_count: 0,
          answers: [],
        }),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase create failed: ${text}`);
    }
    return row;
  }

  const rows = await readLocal();
  rows.unshift(row);
  await writeLocal(rows);
  return row;
}

export async function updateSession(
  id: string,
  patch: {
    answers?: AnswerPair[];
    dodge_count?: number;
    completed?: boolean;
  },
): Promise<SessionRecord | null> {
  const updated_at = new Date().toISOString();

  if (hasSupabase()) {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/seen_sessions?id=eq.${id}`,
      {
        method: "PATCH",
        headers: supabaseHeaders(),
        body: JSON.stringify({ ...patch, updated_at }),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase update failed: ${text}`);
    }
    const data = (await res.json()) as SessionRecord[];
    return data[0] ?? null;
  }

  const rows = await readLocal();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  rows[idx] = {
    ...rows[idx],
    ...patch,
    answers: patch.answers ?? rows[idx].answers,
    updated_at,
  };
  await writeLocal(rows);
  return rows[idx];
}

export async function listSessions(): Promise<SessionRecord[]> {
  if (hasSupabase()) {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/seen_sessions?select=*&order=created_at.desc`,
      { headers: supabaseHeaders(), cache: "no-store" },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase list failed: ${text}`);
    }
    return (await res.json()) as SessionRecord[];
  }

  return readLocal();
}

export function storageMode(): "supabase" | "local-file" {
  return hasSupabase() ? "supabase" : "local-file";
}
