import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const all = url.searchParams.get("all") === "true";

  const where = all ? {} : { isActive: true };

  const categories = await prisma.category.findMany({
    where,
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return Response.json(categories);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.name?.trim() || !body.nameUz?.trim()) {
    return Response.json({ error: "Nom kiritilishi shart" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: { name: body.name.trim(), nameUz: body.nameUz.trim(), image: body.image || "" },
  });
  return Response.json(category, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.id) {
    return Response.json({ error: "ID kiritilishi shart" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.nameUz !== undefined) data.nameUz = body.nameUz.trim();
  if (body.image !== undefined) data.image = body.image;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const category = await prisma.category.update({
    where: { id: body.id },
    data,
  });
  return Response.json(category);
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "ID kiritilishi shart" }, { status: 400 });
  }

  // Soft delete — deactivate, don't remove. Products keep their categoryId.
  await prisma.category.update({
    where: { id },
    data: { isActive: false },
  });

  return Response.json({ success: true });
}
