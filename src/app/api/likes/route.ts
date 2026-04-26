import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getExchangeRate, krwToUsd } from "@/lib/exchange-rate";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ likes: [], likedIds: [] });
  }

  const [likes, rate] = await Promise.all([
    prisma.like.findMany({
      where: { userId: session.id },
      include: {
        product: {
          select: {
            id: true, name: true, nameUz: true, image: true,
            brand: true, volume: true, priceKRW: true,
            inStock: true, featured: true,
            category: { select: { name: true, nameUz: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getExchangeRate(),
  ]);

  const enriched = likes.map((l) => ({
    ...l,
    product: {
      ...l.product,
      priceUSD: krwToUsd(l.product.priceKRW, rate),
    },
  }));

  const likedIds = likes.map((l) => l.productId);

  return Response.json({ likes: enriched, likedIds });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return Response.json({ error: "productId kerak" }, { status: 400 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_productId: { userId: session.id, productId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return Response.json({ liked: false });
  }

  await prisma.like.create({
    data: { userId: session.id, productId },
  });

  return Response.json({ liked: true });
}
