"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { formatUSD, formatKRW } from "@/lib/utils";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  nameUz: string;
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
  brand: string;
  volume: string;
  inStock: boolean;
  featured: boolean;
  categoryId: string;
  category: Category;
}

const emptyForm = {
  name: "", nameUz: "", description: "", descriptionUz: "",
  priceKRW: 0, image: "", brand: "", volume: "",
  categoryId: "", inStock: true, featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", nameUz: "" });

  const fetchData = () => {
    Promise.all([
      fetch("/api/products?limit=100").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([p, c]) => {
      setProducts(p.products || []);
      setCategories(c);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openEdit = (product: Product) => {
    setForm({
      name: product.name, nameUz: product.nameUz,
      description: product.description, descriptionUz: product.descriptionUz,
      priceKRW: product.priceKRW, image: product.image,
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

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    });
    if (res.ok) {
      toast.success("Kategoriya qo'shildi");
      setNewCategory({ name: "", nameUz: "" });
      setShowCategoryForm(false);
      fetchData();
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-xl" />)}
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mahsulotlar ({products.length})</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-surface transition"
          >
            + Kategoriya
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-light transition flex items-center gap-2"
          >
            <Plus size={16} /> Mahsulot qo&apos;shish
          </button>
        </div>
      </div>

      {showCategoryForm && (
        <form onSubmit={addCategory} className="bg-white rounded-2xl border border-border p-4 mb-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium">Nomi (EN)</label>
            <input
              required value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium">Nomi (UZ)</label>
            <input
              required value={newCategory.nameUz}
              onChange={(e) => setNewCategory({ ...newCategory, nameUz: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Qo&apos;shish</button>
        </form>
      )}

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
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nameUz || c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rasm URL *</label>
                <input required value={form.image} onChange={(e) => update("image", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm" placeholder="https://..." />
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
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">Mahsulot</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted">Kategoriya</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted">Narx</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-surface"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100/f3f4f6/9ca3af?text=?"; }} />
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
        {products.length === 0 && (
          <p className="text-center text-muted py-8">Hali mahsulot yo&apos;q. Yangi mahsulot qo&apos;shing.</p>
        )}
      </div>
    </div>
  );
}
