import type { Currency, RateSnapshot } from "./store";

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUZS(amount: number): string {
  const rounded = Math.round(amount);
  const grouped = new Intl.NumberFormat("uz-UZ").format(rounded);
  return `${grouped} so'm`;
}

export function convertFromKrw(priceKrw: number, currency: Currency, rates: RateSnapshot | null): number {
  if (currency === "KRW") return priceKrw;
  if (!rates) return priceKrw;
  if (currency === "USD") return Math.round((priceKrw / rates.usdKrw) * 100) / 100;
  return Math.round(priceKrw * rates.uzsKrw);
}

export function formatPriceFromKrw(priceKrw: number, currency: Currency, rates: RateSnapshot | null): string {
  const value = convertFromKrw(priceKrw, currency, rates);
  if (currency === "KRW") return formatKRW(value);
  if (currency === "USD") return formatUSD(value);
  return formatUZS(value);
}

export function currencyLabel(currency: Currency): string {
  if (currency === "KRW") return "₩ Won";
  if (currency === "USD") return "$ USD";
  return "so'm UZS";
}

export function currencySymbol(currency: Currency): string {
  if (currency === "KRW") return "₩";
  if (currency === "USD") return "$";
  return "so'm";
}

export interface OrderTotals {
  currency: string;
  totalKRW: number;
  totalUSD: number;
  totalUZS: number;
}

export function formatOrderTotal(order: OrderTotals): string {
  const c = (order.currency || "USD") as Currency;
  if (c === "KRW") return formatKRW(order.totalKRW);
  if (c === "UZS") return formatUZS(order.totalUZS || 0);
  return formatUSD(order.totalUSD);
}

export interface OrderItemPrices {
  priceKRW: number;
  priceUSD: number;
  priceUZS: number;
  quantity?: number;
}

export function formatItemPrice(item: OrderItemPrices, currency: string, perUnit = true): string {
  const c = (currency || "USD") as Currency;
  const qty = perUnit ? 1 : (item.quantity || 1);
  if (c === "KRW") return formatKRW(item.priceKRW * qty);
  if (c === "UZS") return formatUZS((item.priceUZS || 0) * qty);
  return formatUSD(item.priceUSD * qty);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Kutilmoqda", color: "bg-yellow-100 text-yellow-800" },
  PROCESSING: { label: "Jarayonda", color: "bg-blue-100 text-blue-800" },
  SHIPPED: { label: "Yuborildi", color: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Yetkazildi", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Bekor qilindi", color: "bg-red-100 text-red-800" },
};

export const UZ_CITIES = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Namangan",
  "Andijon",
  "Farg'ona",
  "Qarshi",
  "Nukus",
  "Jizzax",
  "Urganch",
  "Navoiy",
  "Termiz",
  "Guliston",
  "Xiva",
  "Kokand",
  "Marg'ilon",
  "Chirchiq",
  "Olmaliq",
  "Angren",
  "Bekobod",
];
