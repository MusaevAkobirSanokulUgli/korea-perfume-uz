"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingBag, Users, MessageCircle, DollarSign, Clock } from "lucide-react";
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
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
        <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-xl border border-border">
          <DollarSign size={16} className="text-green-500" />
          <span>Umumiy daromad: <strong className="text-accent">{formatUSD(stats.totalRevenue)}</strong></span>
        </div>
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
