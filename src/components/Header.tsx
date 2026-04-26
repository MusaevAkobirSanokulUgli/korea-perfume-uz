"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore, useAuthStore, useLikeStore } from "@/lib/store";
import {
  ShoppingCart, User, LogOut, Menu, X, Search,
  MessageCircle, ShoppingBag, Bell,
} from "lucide-react";

export default function Header() {
  const { count, setCount } = useCartStore();
  const { user, setUser, setChecked, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.user) setUser(d.user);
        else setChecked();
      })
      .catch(() => setChecked());
  }, [setUser, setChecked]);

  useEffect(() => {
    if (!user) return;

    fetch("/api/cart")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.count !== undefined) setCount(d.count); })
      .catch(() => {});

    fetch("/api/likes")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.likedIds) useLikeStore.getState().setLikedIds(d.likedIds); })
      .catch(() => {});

    const fetchNotifications = () => {
      fetch("/api/messages/unread")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d) setUnread(d.count || 0); })
        .catch(() => {});

      if (user.role === "ADMIN") {
        fetch("/api/orders/pending")
          .then((r) => r.ok ? r.json() : null)
          .then((d) => { if (d) setPendingOrders(d.count || 0); })
          .catch(() => {});
      } else {
        fetch("/api/notifications")
          .then((r) => r.ok ? r.json() : null)
          .then((d) => { if (d) setUnreadNotifs(d.unreadCount || 0); })
          .catch(() => {});
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, setCount]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    setCount(0);
    window.location.href = "/";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/?search=${encodeURIComponent(search.trim())}`;
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">K</span>
            </div>
            <span className="text-xl font-bold text-primary hidden sm:block">
              KoreaPerfume<span className="text-accent">.uz</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-accent transition">
              Bosh sahifa
            </Link>
            <Link href="/?featured=true" className="text-sm font-medium hover:text-accent transition">
              Mashhur
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-accent transition">
              Barcha mahsulotlar
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-surface rounded-lg">
              <Search size={20} />
            </button>

            {user ? (
              <>
                {/* Chat — admin goes to admin/messages, user goes to /chat */}
                <Link
                  href={isAdmin ? "/admin/messages" : "/chat"}
                  className="p-2 hover:bg-surface rounded-lg relative"
                  onClick={() => setUnread(0)}
                >
                  <MessageCircle size={20} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Link>

                {isAdmin ? (
                  /* Admin: orders notification instead of cart */
                  <Link
                    href="/admin/orders"
                    className="p-2 hover:bg-surface rounded-lg relative"
                    onClick={() => setPendingOrders(0)}
                  >
                    <ShoppingBag size={20} />
                    {pendingOrders > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingOrders}
                      </span>
                    )}
                  </Link>
                ) : (
                  /* Regular user: cart */
                  <Link href="/cart" className="p-2 hover:bg-surface rounded-lg relative">
                    <ShoppingCart size={20} />
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </Link>
                )}

                {!isAdmin && (
                  <Link
                    href="/profile?tab=notifications"
                    className="p-2 hover:bg-surface rounded-lg relative"
                    onClick={() => setUnreadNotifs(0)}
                  >
                    <Bell size={20} />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadNotifs}
                      </span>
                    )}
                  </Link>
                )}
                <Link href={isAdmin ? "/admin" : "/profile"} className="p-2 hover:bg-surface rounded-lg">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="p-2 hover:bg-surface rounded-lg text-muted">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition">
                Kirish
              </Link>
            )}
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mahsulot qidirish..."
                className="w-full px-4 py-3 pl-10 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            </div>
          </form>
        )}
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-4 space-y-3">
          <Link href="/" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Bosh sahifa
          </Link>
          <Link href="/?featured=true" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Mashhur
          </Link>
          <Link href="/products" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Barcha mahsulotlar
          </Link>
        </div>
      )}
    </header>
  );
}
