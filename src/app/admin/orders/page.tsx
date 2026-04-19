"use client";

import { useEffect, useState } from "react";
import { formatUSD, formatKRW, formatDate, ORDER_STATUS_MAP } from "@/lib/utils";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

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
  user: {
    id: string; name: string; email: string; phone: string;
    telegram: string; address: string; city: string; district: string;
  };
}

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch("/api/orders?limit=100")
      .then((r) => r.ok ? r.json() : { orders: [] })
      .then((d) => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Status yangilandi");
      fetchOrders();
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Buyurtmani o'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Buyurtma o'chirildi");
      if (expanded === orderId) setExpanded(null);
      fetchOrders();
    } else {
      toast.error("Xatolik");
    }
  };

  const clearAll = async () => {
    if (!confirm("BARCHA buyurtmalarni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi!")) return;
    const res = await fetch("/api/orders", { method: "DELETE" });
    if (res.ok) {
      toast.success("Barcha buyurtmalar o'chirildi");
      setOrders([]);
      setExpanded(null);
    } else {
      toast.error("Xatolik");
    }
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Buyurtmalar ({orders.length})</h1>
        {orders.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
          >
            <Trash2 size={16} /> Barchasini tozalash
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-muted py-12">Hali buyurtma yo&apos;q</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expanded === order.id;
            const status = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.PENDING;

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                    className="flex-1 p-4 flex items-center justify-between hover:bg-surface/50 transition text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm">{order.user.name} • <span className="text-muted">{order.user.telegram}</span></p>
                      <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-bold text-accent">{formatUSD(order.totalUSD)}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="p-4 text-muted hover:text-red-500 transition shrink-0"
                    title="O'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Client info */}
                    <div className="p-4 bg-surface/50">
                      <h4 className="text-xs font-semibold text-muted mb-2 uppercase">Mijoz ma&apos;lumotlari</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted">Ism</p>
                          <p className="font-medium">{order.user.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Telefon</p>
                          <p className="font-medium">{order.user.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Telegram</p>
                          <p className="font-medium">{order.user.telegram}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Email</p>
                          <p className="font-medium">{order.user.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Shahar</p>
                          <p className="font-medium">{order.user.city}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Tuman</p>
                          <p className="font-medium">{order.user.district}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-muted">Manzil</p>
                          <p className="font-medium">{order.user.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4">
                      <h4 className="text-xs font-semibold text-muted mb-3 uppercase">Mahsulotlar</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-surface" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.product.name}</p>
                              <p className="text-xs text-muted">{item.quantity} dona</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">{formatUSD(item.priceUSD * item.quantity)}</p>
                              <p className="text-xs text-muted">{formatKRW(item.priceKRW * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-surface rounded-xl p-3 mt-4 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted">Jami (USD)</span>
                          <span className="font-bold text-accent">{formatUSD(order.totalUSD)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Jami (KRW)</span>
                          <span>{formatKRW(order.totalKRW)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">Buyurtma paytidagi kurs</span>
                          <span>1 USD = {Math.round(order.exchangeRate).toLocaleString()} KRW</span>
                        </div>
                      </div>

                      {order.note && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-xl">
                          <p className="text-xs font-medium text-yellow-800">Izoh:</p>
                          <p className="text-sm text-yellow-700">{order.note}</p>
                        </div>
                      )}

                      {/* Status update */}
                      <div className="mt-4 flex items-center gap-3">
                        <span className="text-sm font-medium">Status:</span>
                        <div className="flex gap-2 flex-wrap">
                          {STATUSES.map((s) => {
                            const st = ORDER_STATUS_MAP[s];
                            return (
                              <button
                                key={s}
                                onClick={() => updateStatus(order.id, s)}
                                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                                  order.status === s ? st.color + " ring-2 ring-offset-1 ring-gray-300" : "bg-surface text-muted hover:bg-surface-dark"
                                }`}
                              >
                                {st.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
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
