"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  nameUz: string;
  isActive: boolean;
  _count: { products: number };
  createdAt: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", nameUz: "" });

  const fetchCategories = () => {
    fetch("/api/categories?all=true")
      .then((r) => r.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchCategories(); }, []);

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, nameUz: cat.nameUz });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.nameUz.trim()) return;

    if (editingId) {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name: form.name, nameUz: form.nameUz }),
      });
      if (res.ok) {
        toast.success("Kategoriya yangilandi");
      } else {
        toast.error("Xatolik");
        return;
      }
    } else {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Kategoriya qo'shildi");
      } else {
        toast.error("Xatolik");
        return;
      }
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", nameUz: "" });
    fetchCategories();
  };

  const handleDelete = async (cat: Category) => {
    const msg = cat._count.products > 0
      ? `Bu kategoriyada ${cat._count.products} ta mahsulot bor. Kategoriya o'chirilsa ham, mavjud mahsulotlar saqlanib qoladi. O'chirishni tasdiqlaysizmi?`
      : "Kategoriyani o'chirishni tasdiqlaysizmi?";

    if (!confirm(msg)) return;

    const res = await fetch(`/api/categories?id=${cat.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Kategoriya o'chirildi");
      fetchCategories();
    } else {
      toast.error("Xatolik");
    }
  };

  const handleRestore = async (id: string) => {
    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: true }),
    });
    if (res.ok) {
      toast.success("Kategoriya tiklandi");
      fetchCategories();
    }
  };

  const activeCategories = categories.filter((c) => c.isActive);
  const inactiveCategories = categories.filter((c) => !c.isActive);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kategoriyalar ({activeCategories.length})</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", nameUz: "" }); }}
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-light transition flex items-center gap-2"
        >
          <Plus size={16} /> Kategoriya qo&apos;shish
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingId ? "Tahrirlash" : "Yangi kategoriya"}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nomi (EN) *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm"
                  placeholder="Perfume"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nomi (UZ) *</label>
                <input
                  required
                  value={form.nameUz}
                  onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm"
                  placeholder="Parfyum"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition"
              >
                {editingId ? "Saqlash" : "Qo'shish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Active categories */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted">Nomi (UZ)</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted">Nomi (EN)</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted">Mahsulotlar</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted">Holati</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activeCategories.map((cat) => (
              <tr key={cat.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 text-sm font-medium">{cat.nameUz}</td>
                <td className="px-4 py-3 text-sm text-muted">{cat.name}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className="bg-surface px-2.5 py-1 rounded-full text-xs font-medium">
                    {cat._count.products}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Faol</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 text-muted hover:text-primary transition">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(cat)} className="p-2 text-muted hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activeCategories.length === 0 && (
          <p className="text-center text-muted py-8">Hali kategoriya yo&apos;q</p>
        )}
      </div>

      {/* Inactive (deleted) categories */}
      {inactiveCategories.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 text-muted">O&apos;chirilgan kategoriyalar</h2>
          <div className="bg-white rounded-2xl border border-border overflow-hidden opacity-75">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Nomi (UZ)</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">Nomi (EN)</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted">Mahsulotlar</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted">Holati</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inactiveCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 text-sm font-medium line-through">{cat.nameUz}</td>
                    <td className="px-4 py-3 text-sm text-muted line-through">{cat.name}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="bg-surface px-2.5 py-1 rounded-full text-xs font-medium">
                        {cat._count.products}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">O&apos;chirilgan</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleRestore(cat.id)}
                          className="p-2 text-muted hover:text-green-600 transition"
                          title="Tiklash"
                        >
                          <RotateCcw size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
