import { create } from 'zustand';

const DEFAULT_FILTERS = {
  search:          '',
  category:        '',
  brokerHouse:     '',
  company:         '',
  paymentStatus:   '',
  bondStatus:      '',
  payoutStatus:    '',
  advisorName:     '',
  advisorLevel4:   '',   // Top Leader Name
  isBookmarked:    '',
  issueDateFrom:   '',
  issueDateTo:     '',
  paidDateFrom:    '',
  paidDateTo:      '',
  renewalDateFrom: '',
  renewalDateTo:   '',
  premiumMin:      '',
  premiumMax:      '',
};

const usePolicyStore = create((set, get) => ({
  filters: { ...DEFAULT_FILTERS },

  setFilter:    (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  setFilters:   (partial)    => set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: ()           => set({ filters: { ...DEFAULT_FILTERS } }),

  activeFilterCount: () =>
    Object.values(get().filters).filter((v) => v !== '' && v !== false).length,

  page:  1,
  limit: 25,
  setPage:  (page)  => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),

  sort: '-createdAt',
  setSort: (sort) => set({ sort }),

  getQueryParams: () => {
    const { filters, page, limit, sort } = get();
    const params = { page, limit, sort };
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) params[k] = v;
    });
    return params;
  },
}));

export default usePolicyStore;
