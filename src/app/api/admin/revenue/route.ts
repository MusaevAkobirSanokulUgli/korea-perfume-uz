import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MONTH_NAMES = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
const FULL_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktyabr", "Noyabr", "Dekabr"];

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // Get all DELIVERED orders from last 12 months with items
  const deliveredOrders = await prisma.order.findMany({
    where: {
      status: "DELIVERED",
      createdAt: { gte: twelveMonthsAgo },
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, nameUz: true, brand: true, image: true, volume: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // All-time DELIVERED revenue
  const allTimeRevenue = await prisma.order.aggregate({
    _sum: { totalUSD: true },
    where: { status: "DELIVERED" },
  });

  const allTimeOrderCount = await prisma.order.count({
    where: { status: "DELIVERED" },
  });

  // Monthly revenue trend (last 12 months)
  const monthlyTrend: { month: string; fullMonth: string; revenue: number; orders: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthOrders = deliveredOrders.filter((o) => {
      const od = new Date(o.createdAt);
      return od >= d && od < nextMonth;
    });
    const revenue = monthOrders.reduce((sum, o) => sum + o.totalUSD, 0);
    monthlyTrend.push({
      month: MONTH_NAMES[d.getMonth()],
      fullMonth: `${FULL_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      revenue: Math.round(revenue * 100) / 100,
      orders: monthOrders.length,
    });
  }

  // Weekly revenue trend (last 12 weeks)
  const weeklyTrend: { week: string; revenue: number; orders: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekOrders = deliveredOrders.filter((o) => {
      const od = new Date(o.createdAt);
      return od >= weekStart && od < weekEnd;
    });
    const revenue = weekOrders.reduce((sum, o) => sum + o.totalUSD, 0);
    const label = `${weekStart.getDate()}.${String(weekStart.getMonth() + 1).padStart(2, "0")}`;
    weeklyTrend.push({
      week: label,
      revenue: Math.round(revenue * 100) / 100,
      orders: weekOrders.length,
    });
  }

  // Yearly revenue trend
  const allDelivered = await prisma.order.findMany({
    where: { status: "DELIVERED" },
    select: { totalUSD: true, createdAt: true },
  });

  const yearMap = new Map<number, { revenue: number; orders: number }>();
  for (const o of allDelivered) {
    const y = new Date(o.createdAt).getFullYear();
    const existing = yearMap.get(y) || { revenue: 0, orders: 0 };
    existing.revenue += o.totalUSD;
    existing.orders += 1;
    yearMap.set(y, existing);
  }
  const yearlyTrend = Array.from(yearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, data]) => ({
      year: String(year),
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
    }));

  // Product-level revenue breakdown (top products by revenue from DELIVERED orders)
  const productRevenueMap = new Map<string, {
    productId: string;
    totalRevenue: number;
    totalSold: number;
    avgPrice: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product: any;
  }>();

  for (const order of deliveredOrders) {
    for (const item of order.items) {
      const existing = productRevenueMap.get(item.productId);
      const itemRevenue = item.priceUSD * item.quantity;
      if (existing) {
        existing.totalRevenue += itemRevenue;
        existing.totalSold += item.quantity;
      } else {
        productRevenueMap.set(item.productId, {
          productId: item.productId,
          totalRevenue: itemRevenue,
          totalSold: item.quantity,
          avgPrice: item.priceUSD,
          product: item.product,
        });
      }
    }
  }

  const productRevenue = Array.from(productRevenueMap.values())
    .map((p) => ({
      ...p,
      avgPrice: p.totalSold > 0 ? Math.round((p.totalRevenue / p.totalSold) * 100) / 100 : 0,
      totalRevenue: Math.round(p.totalRevenue * 100) / 100,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 20);

  return Response.json({
    totalRevenue: allTimeRevenue._sum.totalUSD || 0,
    totalDeliveredOrders: allTimeOrderCount,
    monthlyTrend,
    weeklyTrend,
    yearlyTrend,
    productRevenue,
  });
}
