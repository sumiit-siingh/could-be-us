import { NextResponse } from "next/server";
import { updateSession, type AnswerPair } from "@/lib/store";

type Body = {
  answers?: AnswerPair[];
  dodge_count?: number;
  completed?: boolean;
};

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as Body;
    const session = await updateSession(id, {
      answers: body.answers,
      dodge_count: body.dodge_count,
      completed: body.completed,
    });
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
