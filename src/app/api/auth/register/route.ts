import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, telegram, address, city, district } = body;

    if (!email || !password || !name || !phone || !telegram || !address || !city || !district) {
      return Response.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Bu email allaqachon ro'yxatdan o'tgan" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, phone, telegram, address, city, district },
    });

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
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
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Server xatosi" }, { status: 500 });
  }
}
