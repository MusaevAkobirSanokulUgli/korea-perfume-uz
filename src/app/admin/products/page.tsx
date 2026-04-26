"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, X, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatUSD, formatKRW } from "@/lib/utils";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  nameUz: string;
  isActive?: boolean;
}

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
  categoryId: string;
  category: Category;
}

const emptyForm = {
  name: "", nameUz: "", description: "", descriptionUz: "",
  priceKRW: 0, image: "", images: [] as string[], brand: "", volume: "",
  categoryId: "", inStock: true, featured: false,
};

type SortKey = "name" | "brand" | "price" | "stock";
type SortDir = "asc" | "desc";

const PER_PAGE = 15;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const safeFetch = (url: string) =>
    fetch(url).then((r) => (r.ok ? r.json() : [])).catch(() => []);

  const fetchData = () => {
    Promise.all([
      fetch("/api/products?limit=500").then((r) => r.ok ? r.json() : { products: [] }).catch(() => ({ products: [] })),
      safeFetch("/api/categories"),
      safeFetch("/api/categories?all=true"),
    ]).then(([p, c, all]) => {
      setProducts(p.products || []);
      setCategories(Array.isArray(c) ? c : []);
      setAllCategories(Array.isArray(all) ? all : []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  // Filter + Sort + Paginate
  const filtered = useMemo(() => {
    let list = products;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameUz.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category?.nameUz || p.category?.name || "").toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = (a.nameUz || a.name).localeCompare(b.nameUz || b.name); break;
        case "brand": cmp = a.brand.localeCompare(b.brand); break;
        case "price": cmp = a.priceKRW - b.priceKRW; break;
        case "stock": cmp = (a.inStock ? 1 : 0) - (b.inStock ? 1 : 0); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [products, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="opacity-0 group-hover:opacity-30" />;
    return sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openEdit = (product: Product) => {
    setForm({
      name: product.name, nameUz: product.nameUz,
      description: product.description, descriptionUz: product.descriptionUz,
      priceKRW: product.priceKRW, image: product.image,
      images: Array.isArray(product.images) ? product.images : [],
      brand: product.brand, volume: product.volume,
      categoryId: product.categoryId,
      inStock: product.inStock, featured: product.featured,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/products/${editingId}` : "/api/products";

    const payload = {
      ...form,
      images: form.images.filter((img) => img.trim() !== ""),
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(editingId ? "Yangilandi" : "Qo'shildi");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchData();
    } else {
      toast.error("Xatolik");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("O'chirildi");
      fetchData();
    } else {
      toast.error("Xatolik");
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-xl" />)}
    </div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Mahsulotlar ({filtered.length})</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-light transition flex items-center gap-2"
        >
          <Plus size={16} /> Mahsulot qo&apos;shish
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nomi, brand yoki kategoriya bo'yicha qidirish..."
          className="w-full pl-11 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingId ? "Tahrirlash" : "Yangi mahsulot"}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nomi (EN) *</label>
                  <input required value={form.name} onChange={(e) => update("name", e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nomi (UZ)</label>
                  <input value={form.nameUz} onChange={(e) => update("nameUz", e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Brand *</label>
                  <input required value={form.brand} onChange={(e) => update("brand", e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hajm</label>
                  <input value={form.volume} onChange={(e) => update("volume", e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm" placeholder="50ml" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Narx (KRW) *</label>
                  <input type="number" required min={0} value={form.priceKRW}
                    onChange={(e) => update("priceKRW", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kategoriya *</label>
                  <select required value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-white">
                    <option value="">Tanlang...</option>
                    {(editingId ? allCategories : categories).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameUz || c.name}{c.isActive === false ? " (o'chirilgan)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Asosiy rasm URL *</label>
                <input required value={form.image} onChange={(e) => update("image", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm" placeholder="https://..." />
                {form.image && (
                  <img src={form.image} alt="preview" className="mt-2 w-20 h-20 rounded-lg object-cover border border-border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Qo&apos;shimcha rasmlar</label>
                <div className="space-y-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {img && (
                        <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      )}
                      <input
                        value={img}
                        onChange={(e) => {
                          const newImages = [...form.images];
                          newImages[idx] = e.target.value;
                          update("images", newImages);
                        }}
                        className="flex-1 px-3 py-2 border border-border rounded-xl text-sm"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => update("images", form.images.filter((_, i) => i !== idx))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => update("images", [...form.images, ""])}
                    className="w-full py-2 border border-dashed border-border rounded-xl text-sm text-muted hover:border-primary hover:text-primary transition flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> Rasm qo&apos;shish
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tavsif (EN)</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm resize-none" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tavsif (UZ)</label>
                <textarea value={form.descriptionUz} onChange={(e) => update("descriptionUz", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm resize-none" rows={3} />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.inStock} onChange={(e) => update("inStock", e.target.checked)}
                    className="rounded" />
                  Mavjud
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)}
                    className="rounded" />
                  Mashhur (Hit)
                </label>
              </div>

              <button type="submit" className="w-full py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition">
                {editingId ? "Saqlash" : "Qo'shish"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">Rasm</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  <button onClick={() => toggleSort("name")} className="group flex items-center gap-1 hover:text-foreground transition">
                    Mahsulot <SortIcon col="name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">
                  <button onClick={() => toggleSort("brand")} className="group flex items-center gap-1 hover:text-foreground transition">
                    Brand <SortIcon col="brand" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">Kategoriya</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted">
                  <button onClick={() => toggleSort("price")} className="group flex items-center gap-1 ml-auto hover:text-foreground transition">
                    Narx <SortIcon col="price" />
                  </button>
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted">
                  <button onClick={() => toggleSort("stock")} className="group flex items-center gap-1 mx-auto hover:text-foreground transition">
                    Status <SortIcon col="stock" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((p) => (
                <tr key={p.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="relative w-12 h-12">
                      <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-surface"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100/f3f4f6/9ca3af?text=?"; }} />
                      {Array.isArray(p.images) && p.images.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          +{p.images.length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{p.nameUz || p.name}</p>
                    <p className="text-xs text-muted">{p.volume}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{p.brand}</td>
                  <td className="px-4 py-3 text-sm">{p.category?.nameUz || p.category?.name}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-bold text-accent">{formatUSD(p.priceUSD)}</p>
                    <p className="text-xs text-muted">{formatKRW(p.priceKRW)}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.inStock ? "Mavjud" : "Tugagan"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-muted hover:text-primary transition">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-muted hover:text-red-500 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted py-8">
            {search ? "Qidiruv bo'yicha natija topilmadi" : "Hali mahsulot yo'q. Yangi mahsulot qo'shing."}
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} / {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
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
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      page === p ? "bg-primary text-white" : "hover:bg-surface"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
