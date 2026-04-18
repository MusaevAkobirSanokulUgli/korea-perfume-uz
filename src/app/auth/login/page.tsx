"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        toast.success("Xush kelibsiz!");
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
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Tizimga kirish</h1>
        <p className="text-sm text-muted mt-1">KoreaPerfume.uz hisobingizga kiring</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Parol</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition disabled:opacity-50"
        >
          {loading ? "Kirish..." : "Kirish"}
        </button>
      </form>

      <p className="text-sm text-center text-muted mt-6">
        Hisobingiz yo&apos;qmi?{" "}
        <Link href="/auth/register" className="text-accent font-medium hover:underline">
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </p>
    </div>
  );
}
