import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Kutilmoqda",
  PROCESSING: "Jarayonda",
  SHIPPED: "Yuborildi",
  DELIVERED: "Yetkazildi",
  CANCELLED: "Bekor qilindi",
};

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const where = status && status !== "ALL" ? { status } : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      user: {
        select: {
          name: true, email: true, phone: true,
          telegram: true, address: true, city: true, district: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Buyurtma ID", "Sana", "Status", "Mijoz ismi", "Telefon", "Telegram",
    "Email", "Shahar", "Tuman", "Manzil", "Mahsulotlar", "Soni",
    "Jami (USD)", "Jami (KRW)", "Kurs", "Izoh",
  ];

  const rows = orders.map((order) => {
    const products = order.items
      .map((item) => `${item.product.name} x${item.quantity}`)
      .join("; ");
    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return [
      order.id.slice(-6).toUpperCase(),
      new Date(order.createdAt).toLocaleString("uz-UZ"),
      ORDER_STATUS_LABELS[order.status] || order.status,
      order.user.name,
      order.user.phone,
      order.user.telegram,
      order.user.email,
      order.user.city,
      order.user.district,
      order.user.address,
      products,
      totalQty.toString(),
      order.totalUSD.toFixed(2),
      Math.round(order.totalKRW).toString(),
      Math.round(order.exchangeRate).toString(),
      order.note || "",
    ].map(escapeCsv).join(",");
  });

  const csv = "\uFEFF" + headers.map(escapeCsv).join(",") + "\n" + rows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${status || "all"}-${Date.now()}.csv"`,
    },
  });
}
