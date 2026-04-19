import { prisma } from "@/lib/prisma";
import { getExchangeRate, krwToUsd } from "@/lib/exchange-rate";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [product, rate] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: true },
    }),
    getExchangeRate(),
  ]);

  if (!product) {
    return Response.json({ error: "Mahsulot topilmadi" }, { status: 404 });
  }

  return Response.json({
    ...product,
    priceUSD: krwToUsd(product.priceKRW, rate),
    images: JSON.parse(product.images),
    exchangeRate: rate,
  });
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
  const body = await request.json();

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        nameUz: body.nameUz,
        description: body.description,
        descriptionUz: body.descriptionUz,
        priceKRW: body.priceKRW,
        image: body.image,
        images: JSON.stringify(body.images || []),
        categoryId: body.categoryId,
        brand: body.brand,
        volume: body.volume,
        inStock: body.inStock,
        featured: body.featured,
      },
    });
    return Response.json(product);
  } catch {
    return Response.json({ error: "Mahsulotni yangilashda xato" }, { status: 500 });
  }
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
    await prisma.product.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Mahsulotni o'chirishda xato" }, { status: 500 });
  }
}
