"use client";

import { useEffect, useState, useMemo } from "react";
import { formatUSD } from "@/lib/utils";
import {
  DollarSign, TrendingUp, ShoppingBag, Package, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Area, AreaChart,
} from "recharts";

interface MonthlyData {
  month: string;
  fullMonth: string;
  revenue: number;
  orders: number;
}

interface WeeklyData {
  week: string;
  revenue: number;
  orders: number;
}

interface YearlyData {
  year: string;
  revenue: number;
  orders: number;
}

interface ProductRevenue {
  productId: string;
  totalRevenue: number;
  totalSold: number;
  avgPrice: number;
  product: {
    id: string;
    name: string;
    nameUz: string;
    brand: string;
    image: string;
    volume: string;
  };
}

interface RevenueData {
  totalRevenue: number;
  totalDeliveredOrders: number;
  monthlyTrend: MonthlyData[];
  weeklyTrend: WeeklyData[];
  yearlyTrend: YearlyData[];
  productRevenue: ProductRevenue[];
}

type PeriodTab = "monthly" | "weekly" | "yearly";

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodTab>("weekly");
  const [prodSearch, setProdSearch] = useState("");
  const [prodPage, setProdPage] = useState(1);
  const PROD_PER_PAGE = 10;

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredProdRevenue = useMemo(() => {
    if (!data) return [];
    if (!prodSearch) return data.productRevenue;
    const q = prodSearch.toLowerCase();
    return data.productRevenue.filter((item) =>
      (item.product.nameUz || item.product.name).toLowerCase().includes(q) ||
      item.product.brand.toLowerCase().includes(q)
    );
  }, [data, prodSearch]);

  const prodTotalPages = Math.max(1, Math.ceil(filteredProdRevenue.length / PROD_PER_PAGE));
  const paginatedProdRevenue = filteredProdRevenue.slice((prodPage - 1) * PROD_PER_PAGE, prodPage * PROD_PER_PAGE);

  useEffect(() => { setProdPage(1); }, [prodSearch]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-muted text-center py-12">Ma&apos;lumotlar yuklanmadi</p>;

  const avgOrderValue = data.totalDeliveredOrders > 0
    ? data.totalRevenue / data.totalDeliveredOrders
    : 0;

  const currentMonthData = data.monthlyTrend[data.monthlyTrend.length - 1];
  const prevMonthData = data.monthlyTrend[data.monthlyTrend.length - 2];
  const monthGrowth = prevMonthData && prevMonthData.revenue > 0
    ? ((currentMonthData.revenue - prevMonthData.revenue) / prevMonthData.revenue) * 100
    : 0;

  const periodTabs = [
    { key: "weekly" as PeriodTab, label: "Haftalik" },
    { key: "monthly" as PeriodTab, label: "Oylik" },
    { key: "yearly" as PeriodTab, label: "Yillik" },
  ];

  const getChartData = () => {
    switch (period) {
      case "weekly":
        return data.weeklyTrend.map((w) => ({ name: w.week, revenue: w.revenue, orders: w.orders }));
      case "yearly":
        return data.yearlyTrend.map((y) => ({ name: y.year, revenue: y.revenue, orders: y.orders }));
      default:
        return data.monthlyTrend.map((m) => ({ name: m.month, revenue: m.revenue, orders: m.orders }));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-border">
        <p className="text-sm font-medium mb-1">{label}</p>
        <p className="text-sm text-accent font-bold">{formatUSD(payload[0].value)}</p>
        {payload[1] && (
          <p className="text-xs text-muted">{payload[1].value} buyurtma</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Daromad tahlili</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-green-500 rounded-xl">
              <DollarSign size={16} className="text-white" />
            </div>
            <span className="text-xs text-muted">Umumiy daromad</span>
          </div>
          <p className="text-2xl font-bold text-accent">{formatUSD(data.totalRevenue)}</p>
          <p className="text-xs text-muted mt-1">faqat tugallangan</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="text-xs text-muted">Tugallangan</span>
          </div>
          <p className="text-2xl font-bold">{data.totalDeliveredOrders}</p>
          <p className="text-xs text-muted mt-1">buyurtma</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-purple-500 rounded-xl">
              <Package size={16} className="text-white" />
            </div>
            <span className="text-xs text-muted">O&apos;rtacha check</span>
          </div>
          <p className="text-2xl font-bold">{formatUSD(avgOrderValue)}</p>
          <p className="text-xs text-muted mt-1">bir buyurtma</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-emerald-500 rounded-xl">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="text-xs text-muted">Shu oy</span>
          </div>
          <p className="text-2xl font-bold">{formatUSD(currentMonthData?.revenue || 0)}</p>
          <p className={`text-xs mt-1 font-medium ${monthGrowth >= 0 ? "text-green-600" : "text-red-500"}`}>
            {monthGrowth >= 0 ? "+" : ""}{monthGrowth.toFixed(1)}% o&apos;tgan oyga nisbatan
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-border mb-6">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Daromad dinamikasi</h2>
          <div className="flex gap-1">
            {periodTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setPeriod(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  period === t.key
                    ? "bg-primary text-white"
                    : "bg-surface text-muted hover:bg-surface-dark"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#999" />
                <YAxis tick={{ fontSize: 12 }} stroke="#999" tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders count chart */}
      <div className="bg-white rounded-2xl border border-border mb-6">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Buyurtmalar soni</h2>
        </div>
        <div className="p-5">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#999" />
                <YAxis tick={{ fontSize: 12 }} stroke="#999" allowDecimals={false} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-border">
                      <p className="text-sm font-medium mb-1">{label}</p>
                      <p className="text-sm font-bold text-purple-600">{payload[0].value} buyurtma</p>
                    </div>
                  );
                }} />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-white rounded-2xl border border-border mb-6">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Oylik taqsimot</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-5 py-3 font-medium text-muted">Oy</th>
                <th className="text-right px-5 py-3 font-medium text-muted">Buyurtmalar</th>
                <th className="text-right px-5 py-3 font-medium text-muted">Daromad</th>
                <th className="text-right px-5 py-3 font-medium text-muted">O&apos;rtacha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...data.monthlyTrend].reverse().map((m) => (
                <tr key={m.fullMonth} className="hover:bg-surface/30 transition">
                  <td className="px-5 py-3 font-medium">{m.fullMonth}</td>
                  <td className="px-5 py-3 text-right">{m.orders}</td>
                  <td className="px-5 py-3 text-right font-bold text-accent">{formatUSD(m.revenue)}</td>
                  <td className="px-5 py-3 text-right text-muted">
                    {m.orders > 0 ? formatUSD(m.revenue / m.orders) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product revenue table */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Mahsulot bo&apos;yicha daromad</h2>
              <p className="text-xs text-muted mt-1">Qaysi tovar nechta sotilgan, qancha narxda va qancha daromad keltirgan</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Mahsulot qidirish..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-5 py-3 font-medium text-muted">#</th>
                <th className="text-left px-5 py-3 font-medium text-muted">Mahsulot</th>
                <th className="text-right px-5 py-3 font-medium text-muted">Sotilgan</th>
                <th className="text-right px-5 py-3 font-medium text-muted">O&apos;rtacha narx</th>
                <th className="text-right px-5 py-3 font-medium text-muted">Jami daromad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedProdRevenue.map((item, idx) => {
                const globalIdx = (prodPage - 1) * PROD_PER_PAGE + idx;
                return (
                  <tr key={item.productId} className="hover:bg-surface/30 transition">
                    <td className="px-5 py-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        globalIdx === 0 ? "bg-yellow-100 text-yellow-700" :
                        globalIdx === 1 ? "bg-gray-100 text-gray-600" :
                        globalIdx === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-surface text-muted"
                      }`}>
                        {globalIdx + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-surface shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.product.nameUz || item.product.name}</p>
                          <p className="text-xs text-muted">{item.product.brand} {item.product.volume && `• ${item.product.volume}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{item.totalSold} dona</td>
                    <td className="px-5 py-3 text-right">{formatUSD(item.avgPrice)}</td>
                    <td className="px-5 py-3 text-right font-bold text-accent">{formatUSD(item.totalRevenue)}</td>
                  </tr>
                );
              })}
              {filteredProdRevenue.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted">
                    {prodSearch ? "Qidiruv bo'yicha natija topilmadi" : "Hali tugallangan buyurtma yo'q"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {prodTotalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-muted">
              {(prodPage - 1) * PROD_PER_PAGE + 1}–{Math.min(prodPage * PROD_PER_PAGE, filteredProdRevenue.length)} / {filteredProdRevenue.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setProdPage((p) => Math.max(1, p - 1))} disabled={prodPage === 1}
                className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: prodTotalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === prodTotalPages || Math.abs(p - prodPage) <= 1)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dot-${i}`} className="px-1.5 text-muted text-xs">...</span>
                  ) : (
                    <button key={p} onClick={() => setProdPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                        prodPage === p ? "bg-primary text-white" : "hover:bg-surface"
                      }`}>{p}</button>
                  )
                )}
              <button onClick={() => setProdPage((p) => Math.min(prodTotalPages, p + 1))} disabled={prodPage === prodTotalPages}
                className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
