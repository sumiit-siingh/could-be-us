import { NextResponse } from "next/server";
import { createSession, listSessions, storageMode } from "@/lib/store";

function authorized(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const header = req.headers.get("x-admin-secret");
  const url = new URL(req.url);
  const query = url.searchParams.get("secret");
  return header === secret || query === secret;
}

/** Create a new quiz session */
export async function POST() {
  try {
    const session = await createSession();
    return NextResponse.json({
      session,
      storage: storageMode(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** List all sessions (admin) */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const sessions = await listSessions();
    return NextResponse.json({
      sessions,
      storage: storageMode(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "List failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
