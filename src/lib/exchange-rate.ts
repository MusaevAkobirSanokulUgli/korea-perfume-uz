import { prisma } from "./prisma";

const RATE_CACHE_MINUTES = 60;
const UZS_MARKUP = 1.015;

export interface Rates {
  krwUsd: number;
  krwUzs: number;
  usdKrw: number;
  uzsKrw: number;
  usdUzs: number;
  sourceUsd: string;
  sourceUzs: string;
  updatedAt: string;
}

async function fetchNaverRates(): Promise<{ cashBuy: number; cashSell: number }> {
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

  const cashBuyRaw = data[0].cashBuyValue;
  const cashSellRaw = data[0].cashSellValue;
  if (!cashBuyRaw || !cashSellRaw) throw new Error("Naver values missing");

  const cashBuy = parseFloat(String(cashBuyRaw).replace(/,/g, ""));
  const cashSell = parseFloat(String(cashSellRaw).replace(/,/g, ""));

  return { cashBuy, cashSell };
}

async function fetchCbuKrwRate(): Promise<number> {
  const url = "https://cbu.uz/oz/arkhiv-kursov-valyut/json/";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; KoreaPerfumeUz/1.0)",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`CBU API ${res.status}`);

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("CBU API invalid response");

  const krw = data.find((x: { Ccy: string }) => x.Ccy === "KRW");
  if (!krw?.Rate) throw new Error("KRW not found in CBU response");

  const nominal = parseFloat(krw.Nominal || "1");
  const rate = parseFloat(String(krw.Rate).replace(/,/g, ""));
  return rate / nominal;
}

async function fetchCbuUsdRate(): Promise<number> {
  const url = "https://cbu.uz/oz/arkhiv-kursov-valyut/json/";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; KoreaPerfumeUz/1.0)",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`CBU API ${res.status}`);
  const data = await res.json();
  const usd = data.find((x: { Ccy: string }) => x.Ccy === "USD");
  if (!usd?.Rate) throw new Error("USD not found in CBU response");
  return parseFloat(String(usd.Rate).replace(/,/g, ""));
}

async function getCachedRate(source: string): Promise<{ rate: number; createdAt: Date } | null> {
  const latest = await prisma.exchangeRate.findFirst({
    where: { source },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return null;
  const age = (Date.now() - latest.createdAt.getTime()) / 1000 / 60;
  if (age >= RATE_CACHE_MINUTES) return null;
  return { rate: latest.rate, createdAt: latest.createdAt };
}

async function getOrFetchUsdKrw(): Promise<number> {
  const cached = await getCachedRate("naver-cash-sell");
  if (cached) return cached.rate;

  try {
    const { cashSell } = await fetchNaverRates();
    await prisma.exchangeRate.create({
      data: { rate: cashSell, source: "naver-cash-sell" },
    });
    return cashSell;
  } catch {
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      const rate = data.rates.KRW as number;
      await prisma.exchangeRate.create({
        data: { rate, source: "exchangerate-api-fallback" },
      });
      return rate;
    } catch {
      const stale = await prisma.exchangeRate.findFirst({
        where: { source: { in: ["naver-cash-sell", "naver-cash-buy", "exchangerate-api-fallback"] } },
        orderBy: { createdAt: "desc" },
      });
      if (stale) return stale.rate;
      return 1450;
    }
  }
}

async function getOrFetchUzsKrw(): Promise<number> {
  const cached = await getCachedRate("cbu-uzs-krw");
  if (cached) return cached.rate;

  try {
    const krwRate = await fetchCbuKrwRate();
    const adjusted = krwRate * UZS_MARKUP;
    await prisma.exchangeRate.create({
      data: { rate: adjusted, source: "cbu-uzs-krw" },
    });
    return adjusted;
  } catch {
    try {
      const usdUzs = await fetchCbuUsdRate();
      const usdKrw = await getOrFetchUsdKrw();
      const derived = (usdUzs / usdKrw) * UZS_MARKUP;
      await prisma.exchangeRate.create({
        data: { rate: derived, source: "cbu-uzs-derived" },
      });
      return derived;
    } catch {
      const stale = await prisma.exchangeRate.findFirst({
        where: { source: { in: ["cbu-uzs-krw", "cbu-uzs-derived"] } },
        orderBy: { createdAt: "desc" },
      });
      if (stale) return stale.rate;
      return 8.3;
    }
  }
}

export async function getRates(): Promise<Rates> {
  const [usdKrw, uzsKrw] = await Promise.all([
    getOrFetchUsdKrw(),
    getOrFetchUzsKrw(),
  ]);

  const [latestUsd, latestUzs] = await Promise.all([
    prisma.exchangeRate.findFirst({
      where: { source: { in: ["naver-cash-sell", "naver-cash-buy", "exchangerate-api-fallback"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.exchangeRate.findFirst({
      where: { source: { in: ["cbu-uzs-krw", "cbu-uzs-derived"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const krwUsd = 1 / usdKrw;
  const usdUzs = uzsKrw * usdKrw;
  const updatedAt = (
    latestUsd && latestUzs
      ? latestUsd.createdAt > latestUzs.createdAt ? latestUsd.createdAt : latestUzs.createdAt
      : (latestUsd?.createdAt || latestUzs?.createdAt || new Date())
  ).toISOString();

  return {
    krwUsd,
    krwUzs: uzsKrw,
    usdKrw,
    uzsKrw,
    usdUzs,
    sourceUsd: latestUsd?.source || "unknown",
    sourceUzs: latestUzs?.source || "unknown",
    updatedAt,
  };
}

export async function getExchangeRate(): Promise<number> {
  return getOrFetchUsdKrw();
}

export function krwToUsd(krw: number, usdKrw: number): number {
  return Math.round((krw / usdKrw) * 100) / 100;
}

export function krwToUzs(krw: number, uzsKrw: number): number {
  return Math.round(krw * uzsKrw);
}

export function usdToKrw(usd: number, usdKrw: number): number {
  return Math.round(usd * usdKrw);
}
