"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { formatUSD, formatKRW } from "@/lib/utils";
import { useCartStore, useAuthStore, useLikeStore } from "@/lib/store";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  nameUz: string;
  priceKRW: number;
  priceUSD: number;
  image: string;
  images?: string[];
  brand: string;
  volume: string;
  inStock: boolean;
  featured: boolean;
  category: { name: string; nameUz: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const { increment } = useCartStore();
  const { user } = useAuthStore();
  const { likedIds, toggleLike } = useLikeStore();
  const isLiked = likedIds.includes(product.id);
  const isAdmin = user?.role === "ADMIN";

  const allImages = [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean);
  const [imgIdx, setImgIdx] = useState(0);

  const prevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((i) => (i === 0 ? allImages.length - 1 : i - 1));
  };

  const nextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((i) => (i === allImages.length - 1 ? 0 : i + 1));
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdmin) return;
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

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdmin) return;
    if (!user) {
      toast.error("Avval tizimga kiring");
      window.location.href = "/auth/login";
      return;
    }

    toggleLike(product.id);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!res.ok) {
        toggleLike(product.id);
      }
    } catch {
      toggleLike(product.id);
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-square bg-surface overflow-hidden">
          <img
            src={allImages[imgIdx] || product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image";
            }}
          />

          {/* Image slider arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-[5]"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-[5]"
              >
                <ChevronRight size={14} />
              </button>
              {/* Dot indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {allImages.map((_, i) => (
                  <span
                    key={i}
                    className={`block rounded-full transition-all ${
                      i === imgIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Like button */}
          {!isAdmin && (
            <button
              onClick={handleLike}
              className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
            >
              <Heart
                size={18}
                className={isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}
              />
            </button>
          )}
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
            {product.inStock && !isAdmin && (
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
