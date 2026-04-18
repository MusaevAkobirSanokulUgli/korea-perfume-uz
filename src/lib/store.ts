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
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
