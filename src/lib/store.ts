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
