"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatUSD, formatKRW } from "@/lib/utils";
import { useCartStore, useAuthStore } from "@/lib/store";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  nameUz: string;
  priceKRW: number;
  priceUSD: number;
  image: string;
  brand: string;
  volume: string;
  inStock: boolean;
  featured: boolean;
  category: { name: string; nameUz: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const { increment } = useCartStore();
  const { user } = useAuthStore();

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Avval tizimga kiring");
      window.location.href = "/auth/login";
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) {
        increment();
        toast.success("Savatga qo'shildi!");
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-square bg-surface overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image";
            }}
          />
          {product.featured && (
            <span className="absolute top-3 left-3 bg-accent text-white text-xs font-medium px-2 py-1 rounded-full">
              Hit
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-foreground text-sm font-medium px-4 py-2 rounded-full">
                Tugagan
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-muted mb-1">{product.brand}</p>
          <h3 className="font-medium text-sm line-clamp-2 mb-1 min-h-[2.5rem]">
            {product.nameUz || product.name}
          </h3>
          {product.volume && (
            <p className="text-xs text-muted-light mb-2">{product.volume}</p>
          )}

          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-lg font-bold text-accent">{formatUSD(product.priceUSD)}</p>
              <p className="text-xs text-muted">{formatKRW(product.priceKRW)}</p>
            </div>
            {product.inStock && (
              <button
                onClick={addToCart}
                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-light transition"
              >
                <ShoppingCart size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
