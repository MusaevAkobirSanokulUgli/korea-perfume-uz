import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (session.role === "ADMIN") {
    if (userId) {
      const messages = await prisma.message.findMany({
        where: { userId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      });
      await prisma.message.updateMany({
        where: { userId, isAdmin: false, read: false },
        data: { read: true },
      });
      return Response.json(messages);
    }

    const usersWithMessages = await prisma.user.findMany({
      where: { messages: { some: {} } },
      select: {
        id: true,
        name: true,
        email: true,
        telegram: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true },
        },
        _count: {
          select: {
            messages: { where: { isAdmin: false, read: false } },
          },
        },
      },
    });

    const conversations = usersWithMessages
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        telegram: u.telegram,
        lastMessage: u.messages[0]?.content || "",
        lastMessageAt: u.messages[0]?.createdAt || null,
        unreadCount: u._count.messages,
      }))
      .sort((a, b) => {
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });

    return Response.json(conversations);
  }

  const messages = await prisma.message.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { userId: session.id, isAdmin: true, read: false },
    data: { read: true },
  });

  return Response.json(messages);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const { content, userId } = await request.json();
  if (!content?.trim()) {
    return Response.json({ error: "Xabar bo'sh bo'lmasligi kerak" }, { status: 400 });
  }

  const isAdmin = session.role === "ADMIN";
  const targetUserId = isAdmin ? userId : session.id;

  const message = await prisma.message.create({
    data: {
      userId: targetUserId,
      content: content.trim(),
      isAdmin,
    },
  });

  return Response.json(message, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (session.role === "ADMIN" && userId) {
    await prisma.message.deleteMany({ where: { userId } });
  } else {
    await prisma.message.deleteMany({ where: { userId: session.id } });
  }

  return Response.json({ ok: true });
}
