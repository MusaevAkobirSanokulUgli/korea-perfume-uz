"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore, useLikeStore } from "@/lib/store";
import { formatUSD, formatKRW, formatDate, ORDER_STATUS_MAP, UZ_CITIES } from "@/lib/utils";
import {
  Package, ChevronDown, ChevronUp, Bell, BellOff, Heart,
  CheckCircle2, Clock, Truck, XCircle, Loader2,
  User, Settings, Trash2, Save, Eye, EyeOff, AlertTriangle,
  Search, ChevronLeft, ChevronRight,
} from "lucide-react";
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
}

interface Notification {
  id: string;
  orderId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface ProfileData {
  name: string;
  phone: string;
  telegram: string;
  address: string;
  city: string;
  district: string;
  email: string;
  createdAt: string;
}

interface LikedProduct {
  id: string;
  product: {
    id: string; name: string; nameUz: string; image: string;
    brand: string; volume: string; priceKRW: number; priceUSD: number;
    inStock: boolean; featured: boolean;
    category: { name: string; nameUz: string };
  };
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDING: <Clock size={16} className="text-yellow-600" />,
  PROCESSING: <Loader2 size={16} className="text-blue-600 animate-spin" />,
  SHIPPED: <Truck size={16} className="text-purple-600" />,
  DELIVERED: <CheckCircle2 size={16} className="text-green-600" />,
  CANCELLED: <XCircle size={16} className="text-red-600" />,
};

type TabType = "orders" | "notifications" | "likes" | "settings";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, checked, setUser, logout } = useAuthStore();
  const { likedIds, toggleLike } = useLikeStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("orders");

  // Edit profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editForm, setEditForm] = useState<ProfileData & { currentPassword: string; newPassword: string }>({
    name: "", phone: "", telegram: "", address: "", city: "", district: "",
    email: "", createdAt: "", currentPassword: "", newPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Pagination & search
  const [ordersPage, setOrdersPage] = useState(1);
  const [likesPage, setLikesPage] = useState(1);
  const [notifsPage, setNotifsPage] = useState(1);
  const [likesSearch, setLikesSearch] = useState("");

  const ORDERS_PER_PAGE = 5;
  const LIKES_PER_PAGE = 6;
  const NOTIFS_PER_PAGE = 8;

  const filteredLikes = useMemo(() => {
    if (!likesSearch) return likedProducts;
    const q = likesSearch.toLowerCase();
    return likedProducts.filter((l) =>
      (l.product.nameUz || l.product.name).toLowerCase().includes(q) ||
      l.product.brand.toLowerCase().includes(q)
    );
  }, [likedProducts, likesSearch]);

  const ordersTotalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));
  const likesTotalPages = Math.max(1, Math.ceil(filteredLikes.length / LIKES_PER_PAGE));
  const notifsTotalPages = Math.max(1, Math.ceil(notifications.length / NOTIFS_PER_PAGE));

  const paginatedOrders = orders.slice((ordersPage - 1) * ORDERS_PER_PAGE, ordersPage * ORDERS_PER_PAGE);
  const paginatedLikes = filteredLikes.slice((likesPage - 1) * LIKES_PER_PAGE, likesPage * LIKES_PER_PAGE);
  const paginatedNotifs = notifications.slice((notifsPage - 1) * NOTIFS_PER_PAGE, notifsPage * NOTIFS_PER_PAGE);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "notifications" || tab === "likes" || tab === "settings") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!checked) return;
    if (!user) { router.push("/auth/login"); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeFetch = (url: string): Promise<any> => fetch(url).then((r) => r.ok ? r.json() : {});
    Promise.all([
      safeFetch("/api/orders"),
      safeFetch("/api/notifications"),
      safeFetch("/api/likes"),
      safeFetch("/api/auth/profile"),
    ]).then(([ordersData, notifsData, likesData, profileData]) => {
      setOrders(ordersData.orders || []);
      setNotifications(notifsData.notifications || []);
      setLikedProducts(likesData.likes || []);
      if (profileData.user) {
        setProfile(profileData.user);
        setEditForm((f: typeof profileData.user) => ({ ...f, ...profileData.user }));
      }
      setLoading(false);
    });
  }, [user, checked]);

  useEffect(() => {
    if (activeTab !== "notifications" || !user) return;
    fetch("/api/notifications", { method: "PATCH" });
  }, [activeTab, user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders || [])).catch(() => {});
      fetch("/api/notifications").then((r) => r.json()).then((d) => setNotifications(d.notifications || [])).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name, phone: editForm.phone, telegram: editForm.telegram,
          address: editForm.address, city: editForm.city, district: editForm.district,
          currentPassword: editForm.currentPassword || undefined,
          newPassword: editForm.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setEditForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
        toast.success("Profil yangilandi");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/me", { method: "DELETE" });
      if (res.ok) {
        logout();
        toast.success("Hisob o'chirildi");
        router.push("/");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
    setDeleting(false);
  };

  const handleUnlike = async (productId: string) => {
    toggleLike(productId);
    setLikedProducts((prev) => prev.filter((l) => l.product.id !== productId));
    try {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } catch {
      toggleLike(productId);
    }
  };

  useEffect(() => { setLikesPage(1); }, [likesSearch]);

  const renderPagination = (currentPage: number, total: number, setFn: (p: number) => void) => {
    if (total <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-1 mt-6">
        <button onClick={() => setFn(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: total }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === total || Math.abs(p - currentPage) <= 1)
          .reduce<(number | string)[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span key={`dot-${i}`} className="px-2 text-muted text-sm">...</span>
            ) : (
              <button key={p} onClick={() => setFn(p as number)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                  currentPage === p ? "bg-primary text-white" : "hover:bg-surface"
                }`}>{p}</button>
            )
          )}
        <button onClick={() => setFn(Math.min(total, currentPage + 1))} disabled={currentPage === total}
          className="p-2 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  if (!checked || !user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAdmin = user.role === "ADMIN";

  const tabs: { key: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "orders", label: "Xaridlarim", icon: <Package size={16} />, badge: orders.length },
    { key: "likes", label: "Yoqtirganlarim", icon: <Heart size={16} />, badge: likedProducts.length },
    { key: "notifications", label: "Bildirishnomalar", icon: <Bell size={16} />, badge: unreadCount || undefined },
    { key: "settings", label: "Sozlamalar", icon: <Settings size={16} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted">{user.email}</p>
            {profile?.createdAt && (
              <p className="text-xs text-muted-light mt-1">
                A&apos;zo bo&apos;lgan: {formatDate(profile.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap px-2 ${
              activeTab === tab.key
                ? "bg-white shadow-sm text-primary"
                : "text-muted hover:text-primary"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab.key === "notifications" && unreadCount > 0
                  ? "bg-accent text-white"
                  : "bg-surface-dark text-muted"
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== ORDERS TAB ===== */}
      {activeTab === "orders" && (
        <>
          {loading ? (
            <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-24 bg-surface-dark rounded-xl animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-muted-light mb-4" size={48} />
              <p className="text-muted">Hali buyurtma yo&apos;q</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedOrders.map((order) => {
                const status = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.PENDING;
                const isExpanded = expanded === order.id;
                return (
                  <div key={order.id} className="bg-white border border-border rounded-2xl overflow-hidden">
                    <button onClick={() => setExpanded(isExpanded ? null : order.id)} className="w-full p-4 flex items-center justify-between hover:bg-surface/50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
                          {STATUS_ICON[order.status] || STATUS_ICON.PENDING}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">Buyurtma #{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>{status.label}</span>
                        <span className="font-bold text-accent">{formatUSD(order.totalUSD)}</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border">
                        <div className="px-4 pt-4 pb-2">
                          <div className="flex items-center justify-between">
                            {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].map((s, i) => {
                              const statusList = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
                              const currentIdx = statusList.indexOf(order.status);
                              const isCancelled = order.status === "CANCELLED";
                              const isActive = !isCancelled && i <= currentIdx;
                              const st = ORDER_STATUS_MAP[s];
                              return (
                                <div key={s} className="flex flex-col items-center flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-accent text-white" : "bg-surface text-muted"}`}>{i + 1}</div>
                                  <p className={`text-[10px] mt-1 ${isActive ? "text-accent font-medium" : "text-muted"}`}>{st.label}</p>
                                </div>
                              );
                            })}
                          </div>
                          {order.status === "CANCELLED" && <p className="text-center text-xs text-red-500 font-medium mt-2">Buyurtma bekor qilindi</p>}
                        </div>
                        <div className="p-4">
                          <div className="space-y-3 mb-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-surface" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item.product.name}</p>
                                  <p className="text-xs text-muted">{item.quantity} x {formatUSD(item.priceUSD)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{formatUSD(item.priceUSD * item.quantity)}</p>
                                  <p className="text-xs text-muted">{formatKRW(item.priceKRW * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-surface rounded-xl p-3 text-sm space-y-1">
                            <div className="flex justify-between"><span className="text-muted">Jami (USD)</span><span className="font-bold">{formatUSD(order.totalUSD)}</span></div>
                            <div className="flex justify-between"><span className="text-muted">Jami (KRW)</span><span>{formatKRW(order.totalKRW)}</span></div>
                            <div className="flex justify-between"><span className="text-muted">Kurs</span><span>1 USD = {Math.round(order.exchangeRate).toLocaleString()} KRW</span></div>
                          </div>
                          {order.note && <p className="mt-3 text-sm text-muted"><span className="font-medium">Izoh:</span> {order.note}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {!loading && orders.length > 0 && renderPagination(ordersPage, ordersTotalPages, setOrdersPage)}
        </>
      )}

      {/* ===== LIKES TAB ===== */}
      {activeTab === "likes" && (
        <>
          {/* Search */}
          {likedProducts.length > 0 && (
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={likesSearch}
                onChange={(e) => setLikesSearch(e.target.value)}
                placeholder="Yoqtirgan tovarlarni qidirish..."
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <div key={i} className="h-64 bg-surface-dark rounded-xl animate-pulse" />)}</div>
          ) : filteredLikes.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto text-muted-light mb-4" size={48} />
              <p className="text-muted">{likesSearch ? "Qidiruv bo'yicha natija topilmadi" : "Yoqtirgan tovarlar yo'q"}</p>
              {!likesSearch && <Link href="/products" className="text-sm text-accent hover:underline mt-2 inline-block">Mahsulotlarni ko&apos;rish</Link>}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {paginatedLikes.map((like) => (
                <div key={like.id} className="bg-white rounded-2xl border border-border overflow-hidden group">
                  <Link href={`/products/${like.product.id}`}>
                    <div className="relative aspect-square bg-surface overflow-hidden">
                      <img src={like.product.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUnlike(like.product.id); }}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
                      >
                        <Heart size={18} className="fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted">{like.product.brand}</p>
                      <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{like.product.nameUz || like.product.name}</h3>
                      <p className="text-lg font-bold text-accent mt-1">{formatUSD(like.product.priceUSD)}</p>
                      <p className="text-xs text-muted">{formatKRW(like.product.priceKRW)}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
          {!loading && filteredLikes.length > 0 && renderPagination(likesPage, likesTotalPages, setLikesPage)}
        </>
      )}

      {/* ===== NOTIFICATIONS TAB ===== */}
      {activeTab === "notifications" && (
        <>
          {loading ? (
            <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-16 bg-surface-dark rounded-xl animate-pulse" />)}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="mx-auto text-muted-light mb-4" size={48} />
              <p className="text-muted">Bildirishnomalar yo&apos;q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${notif.read ? "bg-white border-border" : "bg-accent/5 border-accent/20"}`}
                  onClick={() => { const order = orders.find((o) => o.id === notif.orderId); if (order) { setActiveTab("orders"); setExpanded(order.id); } }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.read ? "bg-surface" : "bg-accent/10"}`}>
                      <Bell size={16} className={notif.read ? "text-muted" : "text-accent"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${notif.read ? "text-primary" : "font-semibold text-primary"}`}>{notif.title}</p>
                        {!notif.read && <span className="w-2 h-2 bg-accent rounded-full shrink-0" />}
                      </div>
                      <p className="text-sm text-muted mt-0.5">{notif.message}</p>
                      <p className="text-xs text-muted-light mt-1">{formatDate(notif.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && notifications.length > 0 && renderPagination(notifsPage, notifsTotalPages, setNotifsPage)}
        </>
      )}

      {/* ===== SETTINGS TAB ===== */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Edit Profile Form */}
          <form onSubmit={handleSaveProfile} autoComplete="off" className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Profilni tahrirlash</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Ism</label>
                <input type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" disabled value={editForm.email}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-surface text-muted cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Telefon</label>
                <input type="tel" required value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Telegram</label>
                <input type="text" required value={editForm.telegram} onChange={(e) => setEditForm({ ...editForm, telegram: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Shahar</label>
                <select required value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                  {UZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tuman</label>
                <input type="text" required value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Manzil</label>
                <input type="text" required value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
            </div>

            {/* Password change */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold mb-4">Parolni o&apos;zgartirish (ixtiyoriy)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-1.5">Joriy parol</label>
                  <input type={showCurrentPw ? "text" : "password"} value={editForm.currentPassword}
                    onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                    autoComplete="new-password" placeholder="Faqat o'zgartirmoqchi bo'lsangiz"
                    className="w-full px-4 py-3 pr-10 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-9 text-muted">
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium mb-1.5">Yangi parol</label>
                  <input type={showNewPw ? "text" : "password"} value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    autoComplete="new-password" placeholder="Yangi parolni kiriting"
                    className="w-full px-4 py-3 pr-10 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-9 text-muted">
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="mt-6 w-full py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={18} />
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </form>

          {/* Delete Account */}
          {!isAdmin && (
            <div className="bg-white border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-red-500" />
                <h2 className="text-lg font-semibold text-red-600">Xavfli zona</h2>
              </div>
              <p className="text-sm text-muted mb-4">
                Hisobingizni o&apos;chirsangiz, barcha ma&apos;lumotlaringiz (buyurtmalar, xabarlar, yoqtirganlar) butunlay o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi.
              </p>
              {!deleteConfirm ? (
                <button onClick={() => setDeleteConfirm(true)}
                  className="px-4 py-2.5 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition font-medium flex items-center gap-2">
                  <Trash2 size={16} /> Hisobni o&apos;chirish
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={handleDeleteAccount} disabled={deleting}
                    className="px-4 py-2.5 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium disabled:opacity-50">
                    {deleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
                  </button>
                  <button onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2.5 text-sm border border-border rounded-xl hover:bg-surface transition">
                    Bekor qilish
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
