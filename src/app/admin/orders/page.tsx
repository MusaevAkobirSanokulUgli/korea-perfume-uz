"use client";

import { useEffect, useState, useMemo } from "react";
import { formatUSD, formatKRW, formatDate, ORDER_STATUS_MAP } from "@/lib/utils";
import { ChevronDown, ChevronUp, Trash2, Download, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
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

const STATUS_TABS = [
  { key: "ALL", label: "Barchasi" },
  { key: "PENDING", label: "Kutilmoqda" },
  { key: "PROCESSING", label: "Jarayonda" },
  { key: "SHIPPED", label: "Yuborildi" },
  { key: "DELIVERED", label: "Yetkazildi" },
  { key: "CANCELLED", label: "Bekor qilingan" },
];

const PER_PAGE = 10;

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = (status?: string) => {
    const filter = status ?? activeFilter;
    const query = filter !== "ALL" ? `&status=${filter}` : "";
    fetch(`/api/orders?limit=500${query}`)
      .then((r) => r.ok ? r.json() : { orders: [] })
      .then((d) => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [activeFilter]);

  const handleFilterChange = (status: string) => {
    setActiveFilter(status);
    setExpanded(null);
    setLoading(true);
    setPage(1);
  };

  // Client-side search
  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) =>
      o.user.name.toLowerCase().includes(q) ||
      o.user.telegram.toLowerCase().includes(q) ||
      o.user.phone.toLowerCase().includes(q) ||
      o.user.email.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.items.some((item) => item.product.name.toLowerCase().includes(q))
    );
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [search]);

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

  const downloadCSV = () => {
    const query = activeFilter !== "ALL" ? `?status=${activeFilter}` : "";
    const link = document.createElement("a");
    link.href = `/api/orders/export${query}`;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV yuklab olinmoqda...");
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
    </div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Buyurtmalar ({filtered.length})</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary-light transition font-medium"
          >
            <Download size={16} /> CSV yuklash
          </button>
          {orders.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
            >
              <Trash2 size={16} /> Tozalash
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Mijoz ismi, telegram, telefon yoki buyurtma ID bo'yicha qidirish..."
          className="w-full pl-11 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      {/* Status filter tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-muted" />
          <span className="text-xs font-medium text-muted uppercase">Status bo&apos;yicha</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const tabColor = tab.key !== "ALL" ? ORDER_STATUS_MAP[tab.key] : null;
            return (
              <button
                key={tab.key}
                onClick={() => handleFilterChange(tab.key)}
                className={`text-xs px-4 py-2 rounded-full font-medium transition ${
                  isActive
                    ? tabColor
                      ? `${tabColor.color} ring-2 ring-offset-1 ring-gray-300`
                      : "bg-primary text-white ring-2 ring-offset-1 ring-gray-300"
                    : "bg-surface text-muted hover:bg-surface-dark"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <p className="text-muted">
            {search
              ? "Qidiruv bo'yicha natija topilmadi"
              : activeFilter !== "ALL"
                ? `"${ORDER_STATUS_MAP[activeFilter]?.label || activeFilter}" statusidagi buyurtma yo'q`
                : "Hali buyurtma yo'q"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map((order) => {
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
                      <p className="text-sm">{order.user.name} &bull; <span className="text-muted">{order.user.telegram}</span></p>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} / {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dot-${i}`} className="px-2 text-muted text-sm">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      page === p ? "bg-primary text-white" : "hover:bg-surface"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
