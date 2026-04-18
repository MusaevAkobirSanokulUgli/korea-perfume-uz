"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Minus, Plus, Check } from "lucide-react";
import { formatUSD, formatKRW } from "@/lib/utils";
import { useCartStore, useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  nameUz: string;
  description: string;
  descriptionUz: string;
  priceKRW: number;
  priceUSD: number;
  image: string;
  images: string[];
  brand: string;
  volume: string;
  inStock: boolean;
  featured: boolean;
  exchangeRate: number;
  category: { id: string; name: string; nameUz: string };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { increment } = useCartStore();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d);
        setLoading(false);
      });
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      toast.error("Avval tizimga kiring");
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product!.id, quantity }),
      });
      if (res.ok) {
        for (let i = 0; i < quantity; i++) increment();
        toast.success("Savatga qo'shildi!");
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-surface-dark rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-surface-dark rounded w-1/4" />
            <div className="h-8 bg-surface-dark rounded w-3/4" />
            <div className="h-6 bg-surface-dark rounded w-1/3" />
            <div className="h-32 bg-surface-dark rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-muted text-lg">Mahsulot topilmadi</p>
      </div>
    );
  }

  const allImages = [product.image, ...product.images].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted hover:text-foreground mb-6 transition"
      >
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-surface rounded-2xl overflow-hidden mb-4">
            <img
              src={allImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image";
              }}
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedImage === i ? "border-accent" : "border-border"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-muted mb-1">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {product.nameUz || product.name}
          </h1>
          <p className="text-sm text-muted-light mb-4">
            {product.category.nameUz || product.category.name}
            {product.volume && ` • ${product.volume}`}
          </p>

          <div className="bg-surface rounded-2xl p-6 mb-6">
            <p className="text-3xl font-bold text-accent mb-1">
              {formatUSD(product.priceUSD)}
            </p>
            <p className="text-sm text-muted">
              {formatKRW(product.priceKRW)} • Kurs: 1 USD = {Math.round(product.exchangeRate).toLocaleString()} KRW
            </p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {product.inStock ? (
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <Check size={16} /> Mavjud
              </span>
            ) : (
              <span className="text-sm text-red-500 font-medium">Tugagan</span>
            )}
          </div>

          {product.inStock && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-surface transition"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-surface transition"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={addToCart}
                className="flex-1 py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} /> Savatga qo&apos;shish
              </button>
            </div>
          )}

          <div className="border-t border-border pt-6">
            <h3 className="font-semibold mb-3">Tavsif</h3>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
              {product.descriptionUz || product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
