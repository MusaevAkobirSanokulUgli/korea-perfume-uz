"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { UZ_CITIES } from "@/lib/utils";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    telegram: "",
    city: "",
    district: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        toast.success("Ro'yxatdan o'tdingiz!");
        router.push("/");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 my-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Ro&apos;yxatdan o&apos;tish</h1>
        <p className="text-sm text-muted mt-1">KoreaPerfume.uz da hisob yarating</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Ism *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="To'liq ismingiz"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Parol *</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="Kamida 6 belgi"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Telefon raqam *</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="+998 90 123 45 67"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Telegram *</label>
            <input
              type="text"
              required
              value={form.telegram}
              onChange={(e) => update("telegram", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="@username"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Shahar *</label>
            <select
              required
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
            >
              <option value="">Tanlang...</option>
              {UZ_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tuman *</label>
            <input
              type="text"
              required
              value={form.district}
              onChange={(e) => update("district", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="Tuman nomi"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Manzil *</label>
          <textarea
            required
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
            rows={2}
            placeholder="Ko'cha, uy, kvartira..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition disabled:opacity-50"
        >
          {loading ? "Yaratilmoqda..." : "Hisob yaratish"}
        </button>
      </form>

      <p className="text-sm text-center text-muted mt-6">
        Hisobingiz bormi?{" "}
        <Link href="/auth/login" className="text-accent font-medium hover:underline">
          Kirish
        </Link>
      </p>
    </div>
  );
}
