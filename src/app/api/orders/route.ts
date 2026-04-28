import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getRates, krwToUsd, krwToUzs } from "@/lib/exchange-rate";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const statusFilter = url.searchParams.get("status");

  const where: Record<string, unknown> = session.role === "ADMIN" ? {} : { userId: session.id };
  if (statusFilter && statusFilter !== "ALL") {
    where.status = statusFilter;
  }

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
  let currency: "KRW" | "USD" | "UZS" = "USD";
  try {
    const body = await request.json();
    note = body.note || "";
    if (body.currency === "KRW" || body.currency === "USD" || body.currency === "UZS") {
      currency = body.currency;
    }
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

  const rates = await getRates();

  const totalKRW = cartItems.reduce(
    (sum, item) => sum + item.product.priceKRW * item.quantity, 0
  );
  const totalUSD = krwToUsd(totalKRW, rates.usdKrw);
  const totalUZS = krwToUzs(totalKRW, rates.uzsKrw);

  const order = await prisma.order.create({
    data: {
      userId: session.id,
      totalUSD,
      totalKRW,
      totalUZS,
      exchangeRate: rates.usdKrw,
      uzsKrwRate: rates.uzsKrw,
      currency,
      note,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceKRW: item.product.priceKRW,
          priceUSD: krwToUsd(item.product.priceKRW, rates.usdKrw),
          priceUZS: krwToUzs(item.product.priceKRW, rates.uzsKrw),
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  await prisma.cartItem.deleteMany({ where: { userId: session.id } });

  return Response.json(order, { status: 201 });
}

export async function DELETE() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  return Response.json({ success: true });
}
