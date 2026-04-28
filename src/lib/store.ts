import { create } from "zustand";

interface CartState {
  count: number;
  setCount: (n: number) => void;
  increment: () => void;
  decrement: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  count: 0,
  setCount: (n) => set({ count: n }),
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: Math.max(0, s.count - 1) })),
}));

interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  checked: boolean;
  setUser: (user: AuthState["user"]) => void;
  setChecked: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  checked: false,
  setUser: (user) => set({ user, checked: true }),
  setChecked: () => set({ checked: true }),
  logout: () => set({ user: null }),
}));

interface LikeState {
  likedIds: string[];
  setLikedIds: (ids: string[]) => void;
  toggleLike: (id: string) => void;
}

export const useLikeStore = create<LikeState>((set) => ({
  likedIds: [],
  setLikedIds: (ids) => set({ likedIds: ids }),
  toggleLike: (id) =>
    set((s) => ({
      likedIds: s.likedIds.includes(id)
        ? s.likedIds.filter((i) => i !== id)
        : [...s.likedIds, id],
    })),
}));

export type Currency = "KRW" | "USD" | "UZS";

interface CurrencyState {
  currency: Currency;
  hydrated: boolean;
  setCurrency: (c: Currency) => void;
  hydrate: () => void;
}

const CURRENCY_KEY = "kp-currency";

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: "USD",
  hydrated: false,
  setCurrency: (currency) => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem(CURRENCY_KEY, currency); } catch {}
    }
    set({ currency });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(CURRENCY_KEY);
      if (saved === "KRW" || saved === "USD" || saved === "UZS") {
        set({ currency: saved, hydrated: true });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },
}));

export interface RateSnapshot {
  krwUsd: number;
  krwUzs: number;
  usdKrw: number;
  uzsKrw: number;
  usdUzs: number;
  updatedAt: string;
}

interface RatesState {
  rates: RateSnapshot | null;
  loading: boolean;
  setRates: (r: RateSnapshot) => void;
  setLoading: (b: boolean) => void;
}

export const useRatesStore = create<RatesState>((set) => ({
  rates: null,
  loading: false,
  setRates: (rates) => set({ rates, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
