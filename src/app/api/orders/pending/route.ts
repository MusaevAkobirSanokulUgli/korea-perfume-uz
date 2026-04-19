import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ count: 0 });
  }

  const count = await prisma.order.count({
    where: { status: "PENDING" },
  });

  return Response.json({ count });
}
