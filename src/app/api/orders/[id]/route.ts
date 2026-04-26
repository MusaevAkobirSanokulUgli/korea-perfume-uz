import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const { id } = await params;
  const where = session.role === "ADMIN"
    ? { id }
    : { id, userId: session.id };

  const order = await prisma.order.findFirst({
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
  });

  if (!order) {
    return Response.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  }

  return Response.json(order);
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Kutilmoqda",
  PROCESSING: "Jarayonda",
  SHIPPED: "Yuborildi",
  DELIVERED: "Yetkazildi",
  CANCELLED: "Bekor qilindi",
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  if (existing.status !== status) {
    const label = STATUS_LABELS[status] || status;
    await prisma.notification.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        title: "Buyurtma statusi yangilandi",
        message: `#${order.id.slice(-6).toUpperCase()} buyurtmangiz statusi "${label}" ga o'zgartirildi`,
      },
    });
  }

  return Response.json(order);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Buyurtmani o'chirishda xato" }, { status: 500 });
  }
}
