import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    totalClients,
    unreadMessages,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.message.count({ where: { isAdmin: false, read: false } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, telegram: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
  ]);

  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalUSD: true },
    where: { status: "DELIVERED" },
  });

  return Response.json({
    totalOrders,
    pendingOrders,
    totalProducts,
    totalClients,
    unreadMessages,
    totalRevenue: totalRevenue._sum.totalUSD || 0,
    recentOrders,
  });
}
