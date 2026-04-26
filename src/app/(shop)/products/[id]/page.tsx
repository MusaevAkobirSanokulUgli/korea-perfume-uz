"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Minus, Plus, Check, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { formatUSD, formatKRW } from "@/lib/utils";
import { useCartStore, useAuthStore, useLikeStore } from "@/lib/store";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";

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

interface RelatedProduct {
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

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { increment } = useCartStore();
  const { user } = useAuthStore();
  const { likedIds, toggleLike } = useLikeStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [touchStartX, setTouchStartX] = useState(0);

  const relatedRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const isLiked = product ? likedIds.includes(product.id) : false;
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setRelatedProducts([]);
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setProduct(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Fetch related products
  useEffect(() => {
    if (product) {
      fetch(`/api/products?categoryId=${product.category.id}&limit=15`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.products) {
            const related = (d.products as RelatedProduct[])
              .filter((p) => p.id !== product.id)
              .sort((a, b) => {
                const aMatch = a.brand === product.brand ? 1 : 0;
                const bMatch = b.brand === product.brand ? 1 : 0;
                return bMatch - aMatch;
              });
            setRelatedProducts(related);
          }
        })
        .catch(() => {});
    }
  }, [product]);

  const addToCart = async () => {
    if (isAdmin) return;
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

  const handleLike = async () => {
    if (isAdmin) return;
    if (!user) {
      toast.error("Avval tizimga kiring");
      router.push("/auth/login");
      return;
    }
    if (!product) return;

    toggleLike(product.id);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!res.ok) toggleLike(product.id);
    } catch {
      toggleLike(product.id);
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

  const prevImage = () => {
    setSelectedImage((i) => (i === 0 ? allImages.length - 1 : i - 1));
  };

  const nextImage = () => {
    setSelectedImage((i) => (i === allImages.length - 1 ? 0 : i + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  };

  const scrollRelated = (dir: "left" | "right") => {
    if (!relatedRef.current) return;
    const amount = relatedRef.current.clientWidth * 0.75;
    relatedRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Scroll thumbnail into view when image changes
  const scrollThumbIntoView = (index: number) => {
    if (!thumbRef.current) return;
    const thumbs = thumbRef.current.children;
    if (thumbs[index]) {
      (thumbs[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const goToImage = (index: number) => {
    setSelectedImage(index);
    scrollThumbIntoView(index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted hover:text-foreground mb-6 transition"
      >
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images with slider */}
        <div>
          <div
            className="relative aspect-square bg-surface rounded-2xl overflow-hidden mb-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={allImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image";
              }}
            />

            {/* Navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                >
                  <ChevronRight size={22} />
                </button>

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  {selectedImage + 1} / {allImages.length}
                </div>
              </>
            )}

            {/* Like button */}
            {!isAdmin && (
              <button
                onClick={handleLike}
                className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Heart
                  size={24}
                  className={`transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                />
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div ref={thumbRef} className="flex gap-2 overflow-x-auto hide-scrollbar">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => goToImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedImage === i ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-muted-light"
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

          {product.inStock && !isAdmin && (
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

          {/* Like button inline */}
          {!isAdmin && (
            <button
              onClick={handleLike}
              className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 mb-6 ${
                isLiked
                  ? "bg-red-50 text-red-500 border border-red-200"
                  : "bg-surface text-muted border border-border hover:bg-surface-dark"
              }`}
            >
              <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
              {isLiked ? "Yoqtirilgan" : "Yoqtirish"}
            </button>
          )}

          <div className="border-t border-border pt-6">
            <h3 className="font-semibold mb-3">Tavsif</h3>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
              {product.descriptionUz || product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">O&apos;xshash mahsulotlar</h2>
            <div className="flex gap-2">
              <button
                onClick={() => scrollRelated("left")}
                className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface-dark transition shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollRelated("right")}
                className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface-dark transition shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div
            ref={relatedRef}
            className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth snap-x pb-4"
          >
            {relatedProducts.map((p) => (
              <div key={p.id} className="w-[200px] sm:w-[240px] md:w-[260px] shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
