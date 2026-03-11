import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { requireAuth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id?: string }> };

// PUT /api/ai-chat/sessions/[id] — append messages to a session
export async function PUT(req: NextRequest, context: RouteContext) {
  const decoded = await requireAuth();
  if (decoded instanceof NextResponse) return decoded;

  const sessionId = parseInt((await context.params).id || "");
  if (isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, professorId: decoded.professorId },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = await req.json();
  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Messages array is required" },
      { status: 400 }
    );
  }

  await prisma.chatMessage.createMany({
    data: messages.map((m: { role: string; content: string }) => ({
      sessionId,
      role: m.role,
      content: m.content,
    })),
  });

  // Touch updatedAt
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });

  const updated = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(updated, { status: 200 });
}

// DELETE /api/ai-chat/sessions/[id] — delete a session and its messages
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const decoded = await requireAuth();
  if (decoded instanceof NextResponse) return decoded;

  const sessionId = parseInt((await context.params).id || "");
  if (isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, professorId: decoded.professorId },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Messages cascade-deleted due to onDelete: Cascade
  await prisma.chatSession.delete({ where: { id: sessionId } });

  return NextResponse.json({ message: "Session deleted" }, { status: 200 });
}
