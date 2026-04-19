import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ count: 0 });
  }

  if (session.role === "ADMIN") {
    const count = await prisma.message.count({
      where: { isAdmin: false, read: false },
    });
    return Response.json({ count });
  }

  const count = await prisma.message.count({
    where: { userId: session.id, isAdmin: true, read: false },
  });
  return Response.json({ count });
}
