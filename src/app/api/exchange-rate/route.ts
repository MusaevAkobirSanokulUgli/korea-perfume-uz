import { prisma } from "@/lib/prisma";
import { getExchangeRate } from "@/lib/exchange-rate";

export async function GET() {
  const rate = await getExchangeRate();
  const latest = await prisma.exchangeRate.findFirst({
    orderBy: { createdAt: "desc" },
  });
  return Response.json({
    rate,
    source: latest?.source || "unknown",
    updatedAt: latest?.createdAt?.toISOString() || new Date().toISOString(),
  });
}
