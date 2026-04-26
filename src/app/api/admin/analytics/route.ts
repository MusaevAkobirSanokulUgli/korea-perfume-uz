import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Last 12 months for likes trend
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    allTimeItems,
    monthlyItems,
    yearlyItems,
    productLikes,
    totalLikes,
    allLikes,
  ] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: { gte: startOfMonth },
          status: { not: "CANCELLED" },
        },
      },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: { gte: startOfYear },
          status: { not: "CANCELLED" },
        },
      },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.like.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
    prisma.like.count(),
    // Get all likes from last 12 months for trend chart
    prisma.like.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Build likes trend by month
  const MONTH_NAMES = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
  const likesTrend: { month: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const count = allLikes.filter((l) => {
      const ld = new Date(l.createdAt);
      return `${ld.getFullYear()}-${ld.getMonth()}` === key;
    }).length;
    likesTrend.push({ month: MONTH_NAMES[d.getMonth()], count });
  }

  // Get product details
  const allProductIds = [
    ...new Set([
      ...allTimeItems.map((i) => i.productId),
      ...monthlyItems.map((i) => i.productId),
      ...yearlyItems.map((i) => i.productId),
      ...productLikes.map((i) => i.productId),
    ]),
  ];

  const products = await prisma.product.findMany({
    where: { id: { in: allProductIds } },
    select: {
      id: true, name: true, nameUz: true, image: true,
      brand: true, priceKRW: true, volume: true,
      _count: { select: { likes: true } },
    },
  });

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrich = (items: any[]) =>
    items
      .filter((i) => productMap[i.productId])
      .map((i) => ({
        product: productMap[i.productId],
        totalSold: i._sum?.quantity || 0,
      }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrichLikes = (items: any[]) =>
    items
      .filter((i) => productMap[i.productId])
      .map((i) => ({
        product: productMap[i.productId],
        likeCount: i._count?.productId || i._count || 0,
      }));

  return Response.json({
    topSelling: enrich(allTimeItems),
    monthlyBest: enrich(monthlyItems),
    yearlyBest: enrich(yearlyItems),
    mostLiked: enrichLikes(productLikes),
    totalLikes,
    likesTrend,
  });
}
