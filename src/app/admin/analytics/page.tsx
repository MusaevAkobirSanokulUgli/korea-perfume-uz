"use client";

import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/utils";
import { TrendingUp, Heart, Award, Calendar, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";

interface ProductInfo {
  id: string;
  name: string;
  nameUz: string;
  image: string;
  brand: string;
  priceKRW: number;
  volume: string;
  _count: { likes: number };
}

interface SalesItem {
  product: ProductInfo;
  totalSold: number;
}

interface LikeItem {
  product: ProductInfo;
  likeCount: number;
}

interface LikesTrend {
  month: string;
  count: number;
}

interface Analytics {
  topSelling: SalesItem[];
  monthlyBest: SalesItem[];
  yearlyBest: SalesItem[];
  mostLiked: LikeItem[];
  totalLikes: number;
  likesTrend: LikesTrend[];
}

type TabType = "allTime" | "monthly" | "yearly" | "likes";

const MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktyabr", "Noyabr", "Dekabr",
];

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("allTime");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  if (!data) return <p className="text-muted text-center py-12">Ma&apos;lumotlar yuklanmadi</p>;

  const now = new Date();
  const currentMonth = MONTH_NAMES[now.getMonth()];
  const currentYear = now.getFullYear();

  const tabs = [
    { key: "allTime" as TabType, label: "Barcha vaqt", icon: <BarChart3 size={16} /> },
    { key: "monthly" as TabType, label: currentMonth, icon: <Calendar size={16} /> },
    { key: "yearly" as TabType, label: `${currentYear}`, icon: <TrendingUp size={16} /> },
    { key: "likes" as TabType, label: `Yoqtirishlar (${data.totalLikes})`, icon: <Heart size={16} /> },
  ];

  const renderSalesList = (items: SalesItem[], emptyText: string) => {
    if (items.length === 0) {
      return <p className="text-center text-muted py-8">{emptyText}</p>;
    }
    return (
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.product.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
              idx === 0 ? "bg-yellow-100 text-yellow-700" :
              idx === 1 ? "bg-gray-100 text-gray-600" :
              idx === 2 ? "bg-orange-100 text-orange-700" :
              "bg-surface text-muted"
            }`}>
              {idx < 3 ? <Award size={18} /> : idx + 1}
            </div>
            <img src={item.product.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-surface shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.product.nameUz || item.product.name}</p>
              <p className="text-xs text-muted">{item.product.brand} {item.product.volume && `• ${item.product.volume}`}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-accent">{item.totalSold}</p>
              <p className="text-xs text-muted">dona sotilgan</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLikesSection = () => {
    return (
      <div>
        {/* Likes trend chart */}
        {data.likesTrend && data.likesTrend.length > 0 && (
          <div className="bg-white rounded-2xl border border-border mb-6">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold">Yoqtirishlar dinamikasi</h3>
              <p className="text-xs text-muted mt-1">Oxirgi 12 oy davomida</p>
            </div>
            <div className="p-5">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.likesTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#999" allowDecimals={false} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Tooltip content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-border">
                          <p className="text-sm font-medium mb-1">{label}</p>
                          <p className="text-sm font-bold text-red-500">{payload[0].value} yoqtirish</p>
                        </div>
                      );
                    }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      fill="url(#colorLikes)"
                      dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Likes list */}
        {data.mostLiked.length === 0 ? (
          <p className="text-center text-muted py-8">Hali yoqtirilgan mahsulot yo&apos;q</p>
        ) : (
          <div className="space-y-3">
            {data.mostLiked.map((item, idx) => (
              <div key={item.product.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                  idx === 0 ? "bg-red-100 text-red-600" :
                  idx === 1 ? "bg-pink-100 text-pink-600" :
                  idx === 2 ? "bg-rose-100 text-rose-600" :
                  "bg-surface text-muted"
                }`}>
                  <Heart size={18} className={idx < 3 ? "fill-current" : ""} />
                </div>
                <img src={item.product.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-surface shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.nameUz || item.product.name}</p>
                  <p className="text-xs text-muted">{item.product.brand} {item.product.volume && `• ${item.product.volume}`}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-red-500">{item.likeCount}</p>
                  <p className="text-xs text-muted">mijoz yoqtirgan</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tahlil</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-500 rounded-xl"><BarChart3 size={16} className="text-white" /></div>
            <span className="text-xs text-muted">Barcha vaqt #1</span>
          </div>
          <p className="text-sm font-bold truncate">{data.topSelling[0]?.product.nameUz || data.topSelling[0]?.product.name || "—"}</p>
          <p className="text-xs text-muted">{data.topSelling[0]?.totalSold || 0} dona</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-500 rounded-xl"><Calendar size={16} className="text-white" /></div>
            <span className="text-xs text-muted">{currentMonth} #1</span>
          </div>
          <p className="text-sm font-bold truncate">{data.monthlyBest[0]?.product.nameUz || data.monthlyBest[0]?.product.name || "—"}</p>
          <p className="text-xs text-muted">{data.monthlyBest[0]?.totalSold || 0} dona</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-500 rounded-xl"><TrendingUp size={16} className="text-white" /></div>
            <span className="text-xs text-muted">{currentYear} #1</span>
          </div>
          <p className="text-sm font-bold truncate">{data.yearlyBest[0]?.product.nameUz || data.yearlyBest[0]?.product.name || "—"}</p>
          <p className="text-xs text-muted">{data.yearlyBest[0]?.totalSold || 0} dona</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-500 rounded-xl"><Heart size={16} className="text-white" /></div>
            <span className="text-xs text-muted">Eng mashhur</span>
          </div>
          <p className="text-sm font-bold truncate">{data.mostLiked[0]?.product.nameUz || data.mostLiked[0]?.product.name || "—"}</p>
          <p className="text-xs text-muted">{data.mostLiked[0]?.likeCount || 0} yoqtirish</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition ${
              tab === t.key
                ? "bg-primary text-white"
                : "bg-surface text-muted hover:bg-surface-dark"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "allTime" && renderSalesList(data.topSelling, "Hali sotilgan mahsulot yo'q")}
      {tab === "monthly" && renderSalesList(data.monthlyBest, `${currentMonth}da sotilgan mahsulot yo'q`)}
      {tab === "yearly" && renderSalesList(data.yearlyBest, `${currentYear}-yilda sotilgan mahsulot yo'q`)}
      {tab === "likes" && renderLikesSection()}
    </div>
  );
}
