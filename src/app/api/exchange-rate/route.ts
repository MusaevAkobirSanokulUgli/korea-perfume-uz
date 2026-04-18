import { getExchangeRate } from "@/lib/exchange-rate";

export async function GET() {
  const rate = await getExchangeRate();
  return Response.json({ rate, updatedAt: new Date().toISOString() });
}
