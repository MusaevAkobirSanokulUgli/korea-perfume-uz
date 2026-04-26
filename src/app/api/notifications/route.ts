import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: session.id, read: false },
    }),
  ]);

  return Response.json({ notifications, unreadCount });
}

export async function PATCH() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { userId: session.id, read: false },
    data: { read: true },
  });

  return Response.json({ success: true });
}
