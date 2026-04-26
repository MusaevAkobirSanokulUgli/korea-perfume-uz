"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingBag, Users, MessageCircle, DollarSign, Clock, Heart, TrendingUp } from "lucide-react";
import { formatUSD, formatDate, ORDER_STATUS_MAP } from "@/lib/utils";
import Link from "next/link";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalClients: number;
  unreadMessages: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    totalUSD: number;
    status: string;
    createdAt: string;
    user: { name: string; telegram: string };
    items: Array<{ product: { name: string } }>;
  }>;
}

interface TopProduct {
  product: { id: string; name: string; nameUz: string; image: string; brand: string };
  totalSold: number;
}

interface TopLiked {
  product: { id: string; name: string; nameUz: string; image: string; brand: string };
  likeCount: number;
}

interface Analytics {
  topSelling: TopProduct[];
  mostLiked: TopLiked[];
  totalLikes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    const safeFetch = (url: string) => fetch(url).then((r) => r.ok ? r.json() : null);
    safeFetch("/api/admin/stats").then(setStats);
    safeFetch("/api/admin/analytics").then(setAnalytics);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    { icon: ShoppingBag, label: "Buyurtmalar", value: stats.totalOrders, sub: `${stats.pendingOrders} kutilmoqda`, color: "bg-blue-500", href: "/admin/orders" },
    { icon: Package, label: "Mahsulotlar", value: stats.totalProducts, sub: "jami", color: "bg-green-500", href: "/admin/products" },
    { icon: Users, label: "Mijozlar", value: stats.totalClients, sub: "ro'yxatdan o'tgan", color: "bg-purple-500", href: "/admin/clients" },
    { icon: MessageCircle, label: "Xabarlar", value: stats.unreadMessages, sub: "o'qilmagan", color: "bg-red-500", href: "/admin/messages" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/admin/revenue" className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-xl border border-border hover:shadow-md transition">
          <DollarSign size={16} className="text-green-500" />
          <span>Umumiy daromad: <strong className="text-accent">{formatUSD(stats.totalRevenue)}</strong></span>
          <span className="text-xs text-muted ml-1">(tugallangan)</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="bg-white rounded-2xl p-5 border border-border hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 ${card.color} rounded-xl`}>
                <card.icon size={20} className="text-white" />
              </div>
              <span className="text-sm text-muted">{card.label}</span>
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-xs text-muted mt-1">{card.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Top selling */}
        <div className="bg-white rounded-2xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp size={18} /> Top sotilganlar
            </h2>
            <Link href="/admin/analytics" className="text-sm text-accent hover:underline">Batafsil</Link>
          </div>
          <div className="divide-y divide-border">
            {analytics?.topSelling.slice(0, 5).map((item, idx) => (
              <div key={item.product.id} className="flex items-center gap-3 p-4">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  idx === 0 ? "bg-yellow-100 text-yellow-700" : "bg-surface text-muted"
                }`}>{idx + 1}</span>
                <img src={item.product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-surface shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.nameUz || item.product.name}</p>
                  <p className="text-xs text-muted">{item.product.brand}</p>
                </div>
                <span className="text-sm font-bold text-accent">{item.totalSold} dona</span>
              </div>
            ))}
            {(!analytics || analytics.topSelling.length === 0) && (
              <p className="p-4 text-sm text-muted text-center">Ma&apos;lumot yo&apos;q</p>
            )}
          </div>
        </div>

        {/* Most liked */}
        <div className="bg-white rounded-2xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Heart size={18} /> Eng yoqtirilganlar
              {analytics && <span className="text-xs text-muted font-normal ml-1">({analytics.totalLikes} jami)</span>}
            </h2>
            <Link href="/admin/analytics?tab=likes" className="text-sm text-accent hover:underline">Batafsil</Link>
          </div>
          <div className="divide-y divide-border">
            {analytics?.mostLiked.slice(0, 5).map((item, idx) => (
              <div key={item.product.id} className="flex items-center gap-3 p-4">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  idx === 0 ? "bg-red-100 text-red-600" : "bg-surface text-muted"
                }`}>{idx + 1}</span>
                <img src={item.product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-surface shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.nameUz || item.product.name}</p>
                  <p className="text-xs text-muted">{item.product.brand}</p>
                </div>
                <span className="text-sm font-bold text-red-500 flex items-center gap-1">
                  <Heart size={14} className="fill-red-500" /> {item.likeCount}
                </span>
              </div>
            ))}
            {(!analytics || analytics.mostLiked.length === 0) && (
              <p className="p-4 text-sm text-muted text-center">Ma&apos;lumot yo&apos;q</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock size={18} /> Oxirgi buyurtmalar
          </h2>
          <Link href="/admin/orders" className="text-sm text-accent hover:underline">
            Barchasini ko&apos;rish
          </Link>
        </div>
        <div className="divide-y divide-border">
          {stats.recentOrders.map((order) => {
            const status = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.PENDING;
            return (
              <Link key={order.id} href={`/admin/orders?id=${order.id}`} className="flex items-center justify-between p-4 hover:bg-surface/50 transition">
                <div>
                  <p className="text-sm font-medium">{order.user.name}</p>
                  <p className="text-xs text-muted">{order.user.telegram} • {order.items.length} mahsulot</p>
                  <p className="text-xs text-muted-light">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{formatUSD(order.totalUSD)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                </div>
              </Link>
            );
          })}
          {stats.recentOrders.length === 0 && (
            <p className="p-4 text-sm text-muted text-center">Hali buyurtma yo&apos;q</p>
          )}
        </div>
      </div>
    </div>
  );
}
