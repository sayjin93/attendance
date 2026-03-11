import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/ai-chat/sessions — list all chat sessions for the current user
export async function GET() {
  const decoded = await requireAuth();
  if (decoded instanceof NextResponse) return decoded;

  const sessions = await prisma.chatSession.findMany({
    where: { professorId: decoded.professorId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(sessions, { status: 200 });
}

// POST /api/ai-chat/sessions — create a new chat session with initial messages
export async function POST(req: NextRequest) {
  const decoded = await requireAuth();
  if (decoded instanceof NextResponse) return decoded;

  const body = await req.json();
  const { title, messages } = body;

  if (!title || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Title and messages are required" },
      { status: 400 }
    );
  }

  const session = await prisma.chatSession.create({
    data: {
      title,
      professorId: decoded.professorId,
      messages: {
        create: messages.map(
          (m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })
        ),
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(session, { status: 201 });
}
