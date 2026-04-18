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

    const conversations = await prisma.$queryRawUnsafe(`
      SELECT u.id, u.name, u.email, u.telegram,
        (SELECT content FROM Message WHERE userId = u.id ORDER BY createdAt DESC LIMIT 1) as lastMessage,
        (SELECT createdAt FROM Message WHERE userId = u.id ORDER BY createdAt DESC LIMIT 1) as lastMessageAt,
        (SELECT COUNT(*) FROM Message WHERE userId = u.id AND isAdmin = 0 AND read = 0) as unreadCount
      FROM User u
      WHERE EXISTS (SELECT 1 FROM Message WHERE userId = u.id)
      ORDER BY lastMessageAt DESC
    `);
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
