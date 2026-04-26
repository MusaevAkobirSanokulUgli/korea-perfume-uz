import { prisma } from "@/lib/prisma";
import { getExchangeRate, krwToUsd } from "@/lib/exchange-rate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: { not: "CANCELLED" },
      },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);

    let productIds: string[] = [];
    const salesMap: Record<string, number> = {};

    if (orderIds.length > 0) {
      const topSelling = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        where: { orderId: { in: orderIds } },
        orderBy: { _sum: { quantity: "desc" } },
        take: 12,
      });

      productIds = topSelling.map((t) => t.productId);
      for (const t of topSelling) {
        salesMap[t.productId] = t._sum.quantity || 0;
      }
    }

    if (productIds.length < 4) {
      const featured = await prisma.product.findMany({
        where: { featured: true, id: { notIn: productIds } },
        select: { id: true },
        take: 12 - productIds.length,
      });
      productIds.push(...featured.map((f) => f.id));
    }

    if (productIds.length < 4) {
      const newest = await prisma.product.findMany({
        where: { id: { notIn: productIds } },
        select: { id: true },
        orderBy: { createdAt: "desc" },
        take: 12 - productIds.length,
      });
      productIds.push(...newest.map((n) => n.id));
    }

    const [products, rate] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { category: true },
      }),
      getExchangeRate(),
    ]);

    const sorted = products
      .map((p) => ({
        ...p,
        priceUSD: krwToUsd(p.priceKRW, rate),
        images: JSON.parse(p.images),
      }))
      .sort((a, b) => (salesMap[b.id] || 0) - (salesMap[a.id] || 0));

    return Response.json({ products: sorted, exchangeRate: rate });
  } catch (error) {
    console.error("Bestsellers error:", error);
    return Response.json({ products: [], exchangeRate: 0 }, { status: 500 });
  }
}
