"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

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

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoryId", selectedCategory);
    params.set("page", page.toString());
    params.set("limit", "20");

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products);
        setTotalPages(d.totalPages);
        setLoading(false);
      });
  }, [selectedCategory, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Barcha mahsulotlar</h1>

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
      </div>

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
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                    page === i + 1 ? "bg-primary text-white" : "bg-surface hover:bg-surface-dark"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
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
