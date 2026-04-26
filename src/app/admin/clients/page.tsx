"use client";

import { useEffect, useState, useMemo } from "react";
import { formatDate } from "@/lib/utils";
import { Users, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  telegram: string;
  address: string;
  city: string;
  district: string;
  createdAt: string;
  _count: { orders: number };
}

type SortKey = "name" | "orders" | "date" | "city";
type SortDir = "asc" | "desc";

const PER_PAGE = 15;

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setClients(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = clients;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.telegram.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "orders": cmp = a._count.orders - b._count.orders; break;
        case "date": cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case "city": cmp = a.city.localeCompare(b.city); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [clients, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "date" || key === "orders" ? "desc" : "asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="opacity-0 group-hover:opacity-30" />;
    return sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
    </div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mijozlar ({filtered.length})</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism, email, telefon, telegram yoki shahar bo'yicha qidirish..."
          className="w-full pl-11 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="mx-auto text-muted-light mb-4" size={48} />
          <p className="text-muted">{search ? "Qidiruv bo'yicha natija topilmadi" : "Hali mijoz yo'q"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                    <button onClick={() => toggleSort("name")} className="group flex items-center gap-1 hover:text-foreground transition">
                      Ism <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Telefon</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Telegram</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                    <button onClick={() => toggleSort("city")} className="group flex items-center gap-1 hover:text-foreground transition">
                      Shahar / Tuman <SortIcon col="city" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Manzil</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted">
                    <button onClick={() => toggleSort("orders")} className="group flex items-center gap-1 mx-auto hover:text-foreground transition">
                      Buyurtmalar <SortIcon col="orders" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                    <button onClick={() => toggleSort("date")} className="group flex items-center gap-1 hover:text-foreground transition">
                      Ro&apos;yxatdan <SortIcon col="date" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{c.phone}</td>
                    <td className="px-4 py-3 text-sm text-accent">{c.telegram}</td>
                    <td className="px-4 py-3 text-sm">{c.city}, {c.district}</td>
                    <td className="px-4 py-3 text-sm text-muted max-w-[200px] truncate">{c.address}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-accent/10 text-accent font-bold rounded-lg text-sm">
                        {c._count.orders}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
