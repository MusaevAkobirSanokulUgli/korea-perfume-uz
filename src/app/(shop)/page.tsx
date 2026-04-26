"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Sparkles, Truck, Shield, ArrowRight, DollarSign, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";

interface Category {
  id: string;
  name: string;
  nameUz: string;
  image: string;
  _count: { products: number };
}

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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const featured = searchParams.get("featured") === "true";
  const { user } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const bestSellerRef = useRef<HTMLDivElement>(null);

  const safeJson = (r: Response) => (r.ok ? r.json() : Promise.resolve(null));

  useEffect(() => {
    fetch("/api/categories").then(safeJson).then((d) => { if (Array.isArray(d)) setCategories(d); }).catch(() => {});
    fetch("/api/exchange-rate").then(safeJson).then((d) => { if (d?.rate) setExchangeRate(d.rate); }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (featured) params.set("featured", "true");
    params.set("page", page.toString());
    params.set("limit", "20");

    fetch(`/api/products?${params}`)
      .then(safeJson)
      .then((d) => {
        setProducts(d?.products || []);
        setTotalPages(d?.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchQuery, selectedCategory, featured, page]);

  useEffect(() => { setPage(1); }, [searchQuery, selectedCategory, featured]);

  useEffect(() => {
    if (!searchQuery && !featured) {
      fetch("/api/products?featured=true&limit=8")
        .then(safeJson)
        .then((d) => { if (d?.products) setFeaturedProducts(d.products); })
        .catch(() => {});
    }
  }, [searchQuery, featured]);

  // Fetch bestsellers
  useEffect(() => {
    if (!searchQuery && !featured) {
      fetch("/api/products/bestsellers")
        .then(safeJson)
        .then((d) => { if (d?.products) setBestSellers(d.products); })
        .catch(() => {});
    }
  }, [searchQuery, featured]);

  const scrollBestSellers = (dir: "left" | "right") => {
    if (!bestSellerRef.current) return;
    const amount = bestSellerRef.current.clientWidth * 0.75;
    bestSellerRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const showHero = !searchQuery && !featured && !selectedCategory;

  return (
    <div>
      {showHero && (
        <>
          {/* Hero Banner */}
          <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-72 h-72 bg-gold rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
            </div>
            <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative">
              <div className="max-w-2xl">
                <span className="inline-block px-4 py-1.5 bg-gold/20 text-gold-light text-sm font-medium rounded-full mb-6">
                  Koreya parfyumeriyasi
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Original Koreya<br />
                  <span className="text-gold-light">Parfyumeriyasi</span>
                </h1>
                <p className="text-lg text-gray-300 mb-8 max-w-lg">
                  Eng mashhur Koreya brendlarining atir va parfyum mahsulotlarini
                  to&apos;g&apos;ridan-to&apos;g&apos;ri O&apos;zbekistonga yetkazib beramiz.
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    href="/products"
                    className="px-8 py-3.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition flex items-center gap-2"
                  >
                    Xarid qilish <ArrowRight size={18} />
                  </Link>
                  {user ? (
                    exchangeRate > 0 && (
                      <div className="px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium flex items-center gap-2.5">
                        <DollarSign size={18} className="text-gold-light" />
                        <span>1 USD = <strong className="text-gold-light">{Math.round(exchangeRate).toLocaleString()}</strong> KRW</span>
                      </div>
                    )
                  ) : (
                    <Link
                      href="/auth/register"
                      className="px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl font-medium hover:bg-white/20 transition"
                    >
                      Ro&apos;yxatdan o&apos;tish
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: "100% Original", desc: "Barcha mahsulotlar Koreyadagi rasmiy do'konlardan" },
                { icon: Truck, title: "Yetkazib berish", desc: "O'zbekistonning barcha shaharlarga yetkazamiz" },
                { icon: Sparkles, title: "Eng yaxshi narx", desc: "Dollarda qulay narxlar, Won kursiga qarab" },
              ].map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-6 shadow-lg border border-border flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl shrink-0">
                    <f.icon className="text-accent" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bestsellers Carousel */}
          {bestSellers.length > 0 && (
            <section className="py-12 mt-4">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2.5 bg-accent/10 rounded-xl">
                        <Flame className="text-accent" size={22} />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold">Oyning eng mashhuri</h2>
                    </div>
                    <p className="text-muted text-sm ml-[52px]">Shu oy eng ko&apos;p sotilgan mahsulotlar</p>
                  </div>
                  <div className="hidden sm:flex gap-2">
                    <button
                      onClick={() => scrollBestSellers("left")}
                      className="w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface-dark transition shadow-sm"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => scrollBestSellers("right")}
                      className="w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface-dark transition shadow-sm"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
                <div
                  ref={bestSellerRef}
                  className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth snap-x pb-2"
                >
                  {bestSellers.map((p) => (
                    <div key={p.id} className="w-[220px] sm:w-[260px] md:w-[280px] shrink-0 snap-start">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 py-12">
              <h2 className="text-2xl font-bold mb-6">Kategoriyalar</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id === selectedCategory ? "" : cat.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                      selectedCategory === cat.id
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-foreground border-border hover:border-primary"
                    }`}
                  >
                    {cat.nameUz || cat.name}
                    <span className="ml-1.5 text-xs opacity-60">({cat._count.products})</span>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedCategory(selectedCategory === "other" ? "" : "other")}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                    selectedCategory === "other"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-foreground border-border hover:border-primary"
                  }`}
                >
                  Boshqalar
                </button>
              </div>
            </section>
          )}

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 pb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Mashhur mahsulotlar</h2>
                <Link href="/?featured=true" className="text-accent text-sm font-medium hover:underline flex items-center gap-1">
                  Barchasini ko&apos;rish <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Search / Category Results or All Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {(searchQuery || featured || selectedCategory) && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `"${searchQuery}" bo'yicha natijalar` : ""}
              {featured ? "Mashhur mahsulotlar" : ""}
              {selectedCategory && !searchQuery && !featured
                ? selectedCategory === "other"
                  ? "Boshqalar"
                  : categories.find((c) => c.id === selectedCategory)?.nameUz || "Kategoriya"
                : ""}
            </h2>
            {exchangeRate > 0 && (
              <p className="text-sm text-muted mt-1">
                Kurs: 1 USD = {Math.round(exchangeRate).toLocaleString()} KRW
              </p>
            )}
          </div>
        )}

        {!showHero && categories.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar mb-4">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                !selectedCategory ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary"
              }`}
            >
              Barchasi
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? "" : cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border hover:border-primary"
                }`}
              >
                {cat.nameUz || cat.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedCategory(selectedCategory === "other" ? "" : "other")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                selectedCategory === "other"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-border hover:border-primary"
              }`}
            >
              Boshqalar
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl animate-pulse">
                <div className="aspect-square bg-surface-dark rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-surface-dark rounded w-1/3" />
                  <div className="h-4 bg-surface-dark rounded w-2/3" />
                  <div className="h-5 bg-surface-dark rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2.5 rounded-xl hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`dot-${i}`} className="px-2 text-muted text-sm">...</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p as number)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition ${
                          page === p ? "bg-primary text-white" : "bg-surface hover:bg-surface-dark"
                        }`}>{p}</button>
                    )
                  )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2.5 rounded-xl hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          (searchQuery || selectedCategory || featured) && (
            <div className="text-center py-16">
              <p className="text-muted text-lg">Mahsulot topilmadi</p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
