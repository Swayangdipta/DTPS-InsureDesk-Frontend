import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set, get) => ({
      // ── Sidebar ────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar:  ()     => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // ── Filter drawer ──────────────────────────────────
      filterDrawerOpen: false,
      toggleFilterDrawer:  ()     => set((s) => ({ filterDrawerOpen: !s.filterDrawerOpen })),
      setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),

      // ── Policy form modal ──────────────────────────────
      policyModalOpen: false,
      editingPolicy:   null,
      openPolicyModal:  (policy = null) => set({ policyModalOpen: true,  editingPolicy: policy }),
      closePolicyModal: ()              => set({ policyModalOpen: false, editingPolicy: null  }),

      // ── Confirm delete dialog ──────────────────────────
      deleteDialog: { open: false, id: null, name: '' },
      openDeleteDialog:  (id, name) => set({ deleteDialog: { open: true,  id, name } }),
      closeDeleteDialog: ()         => set({ deleteDialog: { open: false, id: null, name: '' } }),

      // ── Dark mode ──────────────────────────────────────
      darkMode: false,
      toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        // Apply/remove the 'dark' class on <html> for Tailwind
        document.documentElement.classList.toggle('dark', next);
      },
      // Call once on app boot to sync class with persisted state
      initDarkMode: () => {
        const dm = get().darkMode;
        document.documentElement.classList.toggle('dark', dm);
      },
    }),
    {
      name: 'ui-storage',
      partialize: (s) => ({ darkMode: s.darkMode, sidebarOpen: s.sidebarOpen }),
    }
  )
);

export default useUIStore;
