import { getRates } from "@/lib/exchange-rate";

export const dynamic = "force-dynamic";

export async function GET() {
  const rates = await getRates();
  return Response.json({
    rate: rates.usdKrw,
    krwUsd: rates.krwUsd,
    krwUzs: rates.krwUzs,
    usdKrw: rates.usdKrw,
    uzsKrw: rates.uzsKrw,
    usdUzs: rates.usdUzs,
    sourceUsd: rates.sourceUsd,
    sourceUzs: rates.sourceUzs,
    updatedAt: rates.updatedAt,
  });
}
