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
