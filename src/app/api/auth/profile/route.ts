import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, email: true, name: true, phone: true,
      telegram: true, address: true, city: true, district: true,
      role: true, createdAt: true,
    },
  });

  return Response.json({ user });
}
