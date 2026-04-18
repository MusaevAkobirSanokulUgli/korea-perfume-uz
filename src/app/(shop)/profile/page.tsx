"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { formatUSD, formatKRW, formatDate, ORDER_STATUS_MAP } from "@/lib/utils";
import { Package, ChevronDown, ChevronUp } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  priceUSD: number;
  priceKRW: number;
  product: { id: string; name: string; image: string };
}

interface Order {
  id: string;
  totalUSD: number;
  totalKRW: number;
  exchangeRate: number;
  status: string;
  note: string;
  createdAt: string;
  items: OrderItem[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setLoading(false);
      });
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mening profilim</h1>

      <div className="bg-white border border-border rounded-2xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Shaxsiy ma&apos;lumotlar</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted">Ism</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-muted">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Buyurtmalar</h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-surface-dark rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto text-muted-light mb-4" size={48} />
          <p className="text-muted">Hali buyurtma yo&apos;q</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.PENDING;
            const isExpanded = expanded === order.id;

            return (
              <div key={order.id} className="bg-white border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-surface/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-left">
                        Buyurtma #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="font-bold text-accent">{formatUSD(order.totalUSD)}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4">
                    <div className="space-y-3 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.product.image}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover bg-surface"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.product.name}</p>
                            <p className="text-xs text-muted">
                              {item.quantity} x {formatUSD(item.priceUSD)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatUSD(item.priceUSD * item.quantity)}</p>
                            <p className="text-xs text-muted">{formatKRW(item.priceKRW * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-surface rounded-xl p-3 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted">Jami (USD)</span>
                        <span className="font-bold">{formatUSD(order.totalUSD)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Jami (KRW)</span>
                        <span>{formatKRW(order.totalKRW)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Kurs</span>
                        <span>1 USD = {Math.round(order.exchangeRate).toLocaleString()} KRW</span>
                      </div>
                    </div>
                    {order.note && (
                      <p className="mt-3 text-sm text-muted">
                        <span className="font-medium">Izoh:</span> {order.note}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
