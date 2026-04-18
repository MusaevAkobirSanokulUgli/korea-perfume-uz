"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

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

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((d) => { setClients(d); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
    </div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mijozlar ({clients.length})</h1>

      {clients.length === 0 ? (
        <div className="text-center py-16">
          <Users className="mx-auto text-muted-light mb-4" size={48} />
          <p className="text-muted">Hali mijoz yo&apos;q</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Ism</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Telefon</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Telegram</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Shahar / Tuman</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Manzil</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted">Buyurtmalar</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Ro&apos;yxatdan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((c) => (
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
    </div>
  );
}
