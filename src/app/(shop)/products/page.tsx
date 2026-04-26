"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  nameUz: string;
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

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const safeJson = (r: Response) => (r.ok ? r.json() : Promise.resolve(null));

  useEffect(() => {
    fetch("/api/categories").then(safeJson).then((d) => { if (Array.isArray(d)) setCategories(d); }).catch(() => {});
    fetch("/api/exchange-rate").then(safeJson).then((d) => { if (d?.rate) setExchangeRate(d.rate); }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (search) params.set("search", search);
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
  }, [selectedCategory, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Barcha mahsulotlar</h2>
        {exchangeRate > 0 && (
          <p className="text-sm text-muted mt-1">
            Kurs: 1 USD = {Math.round(exchangeRate).toLocaleString()} KRW
          </p>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Mahsulot nomi yoki brand bo'yicha qidirish..."
          className="w-full pl-11 pr-24 py-3 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-3 py-1.5 text-xs text-muted hover:text-foreground transition"
            >
              Tozalash
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-light transition"
          >
            Qidirish
          </button>
        </div>
      </form>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar mb-6">
        <button
          onClick={() => { setSelectedCategory(""); setPage(1); }}
          className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
            !selectedCategory ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary"
          }`}
        >
          Barchasi
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
              selectedCategory === cat.id ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary"
            }`}
          >
            {cat.nameUz || cat.name} ({cat._count.products})
          </button>
        ))}
        <button
          onClick={() => { setSelectedCategory("other"); setPage(1); }}
          className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
            selectedCategory === "other" ? "bg-primary text-white border-primary" : "bg-white text-foreground border-border hover:border-primary"
          }`}
        >
          Boshqalar
        </button>
      </div>

      {/* Search result info */}
      {search && (
        <p className="text-sm text-muted mb-4">
          &quot;{search}&quot; bo&apos;yicha {products.length > 0 ? `natijalar` : "hech narsa topilmadi"}
        </p>
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
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
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
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition ${
                        page === p ? "bg-primary text-white" : "bg-surface hover:bg-surface-dark"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted text-lg">Mahsulot topilmadi</p>
        </div>
      )}
    </div>
  );
}
