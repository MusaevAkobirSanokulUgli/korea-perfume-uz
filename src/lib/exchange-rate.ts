import { prisma } from "./prisma";

const RATE_CACHE_MINUTES = 60;

export async function getExchangeRate(): Promise<number> {
  const latest = await prisma.exchangeRate.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (latest) {
    const age =
      (Date.now() - latest.createdAt.getTime()) / 1000 / 60;
    if (age < RATE_CACHE_MINUTES) {
      return latest.rate;
    }
  }

  try {
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const rate = data.rates.KRW as number;

    await prisma.exchangeRate.create({
      data: {
        rate,
        source: "exchangerate-api.com",
      },
    });

    return rate;
  } catch {
    if (latest) return latest.rate;
    return 1350;
  }
}

export function krwToUsd(krw: number, rate: number): number {
  return Math.round((krw / rate) * 100) / 100;
}

export function usdToKrw(usd: number, rate: number): number {
  return Math.round(usd * rate);
}
