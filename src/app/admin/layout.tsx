"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  MessageCircle, ArrowLeft, Menu, X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Mahsulotlar", icon: Package },
  { href: "/admin/orders", label: "Buyurtmalar", icon: ShoppingBag },
  { href: "/admin/clients", label: "Mijozlar", icon: Users },
  { href: "/admin/messages", label: "Xabarlar", icon: MessageCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.role === "ADMIN") {
          setUser(d.user);
        } else {
          router.push("/");
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-surface flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 px-3 w-full">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <ArrowLeft size={18} /> Saytga qaytish
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-border px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="font-semibold">Admin Panel</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
