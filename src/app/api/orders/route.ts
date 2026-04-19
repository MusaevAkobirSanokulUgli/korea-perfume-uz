import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getExchangeRate, krwToUsd } from "@/lib/exchange-rate";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const where = session.role === "ADMIN" ? {} : { userId: session.id };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: {
          select: {
            id: true, name: true, email: true, phone: true,
            telegram: true, address: true, city: true, district: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return Response.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  let note = "";
  try {
    const body = await request.json();
    note = body.note || "";
  } catch {
    // empty body is fine
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return Response.json({ error: "Savat bo'sh" }, { status: 400 });
  }

  const rate = await getExchangeRate();

  const totalKRW = cartItems.reduce(
    (sum, item) => sum + item.product.priceKRW * item.quantity, 0
  );
  const totalUSD = krwToUsd(totalKRW, rate);

  const order = await prisma.order.create({
    data: {
      userId: session.id,
      totalUSD,
      totalKRW,
      exchangeRate: rate,
      note,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceKRW: item.product.priceKRW,
          priceUSD: krwToUsd(item.product.priceKRW, rate),
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  await prisma.cartItem.deleteMany({ where: { userId: session.id } });

  return Response.json(order, { status: 201 });
}
