import { prisma } from "@/lib/prisma";
import { getSession, createToken, hashPassword, verifyPassword } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ user: null });
  }
  return Response.json({ user: session });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, telegram, address, city, district, currentPassword, newPassword } = body;

  if (!name || !phone || !telegram || !address || !city || !district) {
    return Response.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
  }

  const updateData: Record<string, string> = { name, phone, telegram, address, city, district };

  if (newPassword) {
    if (!currentPassword) {
      return Response.json({ error: "Joriy parolni kiriting" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return Response.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }
    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) {
      return Response.json({ error: "Joriy parol noto'g'ri" }, { status: 400 });
    }
    updateData.password = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: updateData,
  });

  const token = await createToken({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
  });

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return Response.json({
    user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role },
  });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  if (session.role === "ADMIN") {
    return Response.json({ error: "Admin hisobini o'chirib bo'lmaydi" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id: session.id } });

  const cookieStore = await cookies();
  cookieStore.delete("token");

  return Response.json({ success: true });
}
