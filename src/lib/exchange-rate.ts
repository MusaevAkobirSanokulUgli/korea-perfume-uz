import { prisma } from "./prisma";

const RATE_CACHE_MINUTES = 60;

async function fetchNaverCashBuyRate(): Promise<number> {
  const now = new Date();
  const end = now.toISOString().slice(0, 10).replace(/-/g, "") + "235959";
  const start =
    new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "") + "000000";

  const url = `https://api.stock.naver.com/marketindex/exchange/FX_USDKRW/prices?startDateTime=${start}&endDateTime=${end}&timeframe=1d`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "application/json",
      Referer: "https://m.stock.naver.com/marketindex/exchange/FX_USDKRW",
    },
  });

  if (!res.ok) throw new Error(`Naver API ${res.status}`);

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Naver API returned empty data");
  }

  // cashBuyValue = 현찰 사실때 (dollar sotib olish kursi)
  const cashBuy = data[0].cashBuyValue;
  if (!cashBuy) throw new Error("cashBuyValue not found");

  return parseFloat(String(cashBuy).replace(/,/g, ""));
}

export async function getExchangeRate(): Promise<number> {
  const latest = await prisma.exchangeRate.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (latest) {
    const age = (Date.now() - latest.createdAt.getTime()) / 1000 / 60;
    if (age < RATE_CACHE_MINUTES) {
      return latest.rate;
    }
  }

  try {
    const rate = await fetchNaverCashBuyRate();

    await prisma.exchangeRate.create({
      data: {
        rate,
        source: "naver-cash-buy",
      },
    });

    return rate;
  } catch {
    // Fallback: umumiy bozor kursi
    try {
      const res = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await res.json();
      const rate = data.rates.KRW as number;

      await prisma.exchangeRate.create({
        data: { rate, source: "exchangerate-api-fallback" },
      });

      return rate;
    } catch {
      if (latest) return latest.rate;
      return 1450;
    }
  }
}

export function krwToUsd(krw: number, rate: number): number {
  return Math.round((krw / rate) * 100) / 100;
}

export function usdToKrw(usd: number, rate: number): number {
  return Math.round(usd * rate);
}
