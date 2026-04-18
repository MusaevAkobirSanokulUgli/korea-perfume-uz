import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  return Response.json(order);
}
