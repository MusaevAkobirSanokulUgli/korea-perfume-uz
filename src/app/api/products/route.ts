import { prisma } from "@/lib/prisma";
import { getExchangeRate, krwToUsd } from "@/lib/exchange-rate";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");
    const featured = url.searchParams.get("featured");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (categoryId === "other") {
      where.category = { isActive: false };
    } else if (categoryId) {
      where.categoryId = categoryId;
    }
    if (featured === "true") where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameUz: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total, rate] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
      getExchangeRate(),
    ]);

    const productsWithUsd = products.map((p) => ({
      ...p,
      priceUSD: krwToUsd(p.priceKRW, rate),
      images: JSON.parse(p.images),
    }));

    return Response.json({
      products: productsWithUsd,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      exchangeRate: rate,
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return Response.json({ products: [], total: 0, page: 1, totalPages: 0 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        nameUz: body.nameUz || "",
        description: body.description,
        descriptionUz: body.descriptionUz || "",
        priceKRW: body.priceKRW,
        image: body.image,
        images: JSON.stringify(body.images || []),
        categoryId: body.categoryId,
        brand: body.brand,
        volume: body.volume || "",
        inStock: body.inStock ?? true,
        featured: body.featured ?? false,
      },
    });
    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return Response.json({ error: "Mahsulot yaratishda xato" }, { status: 500 });
  }
}
