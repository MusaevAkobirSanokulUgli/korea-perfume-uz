"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { formatUSD, formatKRW } from "@/lib/utils";
import { useCartStore, useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";
import Link from "next/link";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    nameUz: string;
    priceKRW: number;
    priceUSD: number;
    image: string;
    brand: string;
    volume: string;
  };
}

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setCount } = useCartStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalUSD, setTotalUSD] = useState(0);
  const [totalKRW, setTotalKRW] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");

  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    if (data.items) {
      setItems(data.items);
      setTotalUSD(data.totalUSD);
      setTotalKRW(data.totalKRW);
      setExchangeRate(data.exchangeRate);
      setCount(data.count);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchCart();
  }, [user]);

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId, quantity }),
    });
    fetchCart();
  };

  const removeItem = async (cartItemId: string) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId }),
    });
    fetchCart();
    toast.success("Savatdan o'chirildi");
  };

  const sendOrder = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        toast.success("Buyurtma yuborildi! Admin tez orada bog'lanadi.");
        setItems([]);
        setCount(0);
        router.push("/profile");
      } else {
        const data = await res.json();
        toast.error(data.error || "Xatolik");
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface-dark rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground mb-6 transition">
        <ArrowLeft size={18} /> Xarid qilishga qaytish
      </Link>

      <h1 className="text-2xl font-bold mb-6">Savat</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto text-muted-light mb-4" size={48} />
          <p className="text-muted text-lg mb-4">Savat bo&apos;sh</p>
          <Link href="/products" className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition">
            Xarid qilish
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-white border border-border rounded-2xl">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-surface shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/200x200/f3f4f6/9ca3af?text=No+Image";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted">{item.product.brand}</p>
                  <h3 className="font-medium text-sm truncate">
                    {item.product.nameUz || item.product.name}
                  </h3>
                  <p className="text-accent font-bold mt-1">{formatUSD(item.product.priceUSD)}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-surface transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-surface transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-muted hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-border rounded-2xl p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Buyurtma xulosasi</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Mahsulotlar ({items.length})</span>
                  <span className="font-medium">{formatUSD(totalUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Won da</span>
                  <span className="font-medium">{formatKRW(totalKRW)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-light">
                  <span>Kurs</span>
                  <span>1 USD = {Math.round(exchangeRate).toLocaleString()} KRW</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Jami</span>
                  <span className="text-accent">{formatUSD(totalUSD)}</span>
                </div>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Izoh qoldiring (ixtiyoriy)..."
                className="w-full mt-4 p-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                rows={3}
              />

              <button
                onClick={sendOrder}
                disabled={sending}
                className="w-full mt-4 py-3.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition disabled:opacity-50"
              >
                {sending ? "Yuborilmoqda..." : "Buyurtma yuborish"}
              </button>

              <p className="text-xs text-muted text-center mt-3">
                Admin sizning buyurtmangizni ko&apos;rib chiqadi va bog&apos;lanadi
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
