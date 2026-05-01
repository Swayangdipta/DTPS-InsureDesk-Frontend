import { create } from 'zustand';
import { categoryApi, brokerHouseApi, companyApi } from '@/api/master.api';

const useMasterStore = create((set, get) => ({
  categories:   [],
  brokerHouses: [],
  companies:    [],
  loading:      false,

  // ── Fetch all master data at once (called on app load) ──
  fetchAll: async () => {
    set({ loading: true });
    try {
      const [cats, brokers, companies] = await Promise.all([
        categoryApi.getAll(),
        brokerHouseApi.getAll(),
        companyApi.getAll(),
      ]);
      set({
        categories:   cats.data.data,
        brokerHouses: brokers.data.data,
        companies:    companies.data.data,
      });
    } finally {
      set({ loading: false });
    }
  },

  // ── Companies filtered by broker (for cascading dropdown) ──
  getCompaniesByBroker: (brokerHouseId) => {
    if (!brokerHouseId) return get().companies;
    return get().companies.filter(
      (c) => c.brokerHouse?._id === brokerHouseId || c.brokerHouse === brokerHouseId
    );
  },

  // ── Local add/update/remove after mutations ─────────────
  addCategory:   (cat)     => set((s) => ({ categories:   [...s.categories,   cat] })),
  updateCategory:(cat)     => set((s) => ({ categories:   s.categories.map((c)   => c._id === cat._id ? cat : c) })),
  removeCategory:(id)      => set((s) => ({ categories:   s.categories.filter((c)   => c._id !== id) })),

  addBrokerHouse:   (bh)   => set((s) => ({ brokerHouses: [...s.brokerHouses, bh] })),
  updateBrokerHouse:(bh)   => set((s) => ({ brokerHouses: s.brokerHouses.map((b) => b._id === bh._id ? bh : b) })),
  removeBrokerHouse:(id)   => set((s) => ({ brokerHouses: s.brokerHouses.filter((b) => b._id !== id) })),

  addCompany:   (co)       => set((s) => ({ companies:    [...s.companies,    co] })),
  updateCompany:(co)       => set((s) => ({ companies:    s.companies.map((c)    => c._id === co._id ? co : c) })),
  removeCompany:(id)       => set((s) => ({ companies:    s.companies.filter((c)    => c._id !== id) })),
}));

export default useMasterStore;
