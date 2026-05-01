import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/auth.api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      // ── Login ───────────────────────────────────────────
      login: async (credentials) => {
        const res = await authApi.login(credentials);
        const { token, user } = res.data;
        set({ token, user });
        toast.success(`Welcome back, ${user.fullName}!`);
        return user;
      },

      // ── Logout ──────────────────────────────────────────
      logout: () => {
        set({ user: null, token: null });
        toast.success('Logged out successfully');
      },

      // ── Update user in store (after profile changes) ────
      setUser: (user) => set({ user }),

      // ── Helpers ─────────────────────────────────────────
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name:    'auth-storage',      // localStorage key
      partialize: (s) => ({         // only persist token + user
        token: s.token,
        user:  s.user,
      }),
    }
  )
);

export default useAuthStore;
