"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Sparkles, Truck, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

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

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<number>(0);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    fetch("/api/exchange-rate").then((r) => r.json()).then((d) => setExchangeRate(d.rate));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (featured) params.set("featured", "true");
    params.set("limit", "40");

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products);
        setLoading(false);
      });
  }, [searchQuery, selectedCategory, featured]);

  useEffect(() => {
    if (!searchQuery && !featured) {
      fetch("/api/products?featured=true&limit=8")
        .then((r) => r.json())
        .then((d) => setFeaturedProducts(d.products));
    }
  }, [searchQuery, featured]);

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
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/products"
                    className="px-8 py-3.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition flex items-center gap-2"
                  >
                    Xarid qilish <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl font-medium hover:bg-white/20 transition"
                  >
                    Ro&apos;yxatdan o&apos;tish
                  </Link>
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
                ? categories.find((c) => c.id === selectedCategory)?.nameUz || "Kategoriya"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
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
