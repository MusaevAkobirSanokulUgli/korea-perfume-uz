import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    select: {
      id: true, name: true, email: true, phone: true,
      telegram: true, address: true, city: true, district: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(clients);
}
