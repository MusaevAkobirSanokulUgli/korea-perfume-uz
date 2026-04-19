import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getExchangeRate, krwToUsd } from "@/lib/exchange-rate";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const [items, rate] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: session.id },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getExchangeRate(),
  ]);

  const itemsWithUsd = items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      priceUSD: krwToUsd(item.product.priceKRW, rate),
      images: JSON.parse(item.product.images),
    },
  }));

  const totalKRW = items.reduce((sum, i) => sum + i.product.priceKRW * i.quantity, 0);

  return Response.json({
    items: itemsWithUsd,
    totalKRW,
    totalUSD: krwToUsd(totalKRW, rate),
    exchangeRate: rate,
    count: items.reduce((sum, i) => sum + i.quantity, 0),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const { productId, quantity = 1 } = await request.json();

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: session.id, productId } },
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
    return Response.json(updated);
  }

  const item = await prisma.cartItem.create({
    data: { userId: session.id, productId, quantity },
  });
  return Response.json(item, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const { cartItemId } = await request.json();

  if (cartItemId) {
    await prisma.cartItem.delete({
      where: { id: cartItemId, userId: session.id },
    });
  } else {
    await prisma.cartItem.deleteMany({ where: { userId: session.id } });
  }

  return Response.json({ success: true });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const { cartItemId, quantity } = await request.json();

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId, userId: session.id } });
    return Response.json({ success: true });
  }

  const updated = await prisma.cartItem.update({
    where: { id: cartItemId, userId: session.id },
    data: { quantity },
  });
  return Response.json(updated);
}
