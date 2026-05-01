import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { policyApi } from '@/api/policy.api';
import usePolicyStore from '@/store/policyStore';
import toast from 'react-hot-toast';

// ── Fetch paginated + filtered list ───────────────────────
export const usePolicies = () => {
  const getQueryParams = usePolicyStore((s) => s.getQueryParams);
  const params = getQueryParams();

  return useQuery({
    queryKey: ['policies', params],
    queryFn:  () => policyApi.getAll(params).then((r) => r.data),
    keepPreviousData: true,
  });
};

// ── Fetch single policy ───────────────────────────────────
export const usePolicy = (id) =>
  useQuery({
    queryKey: ['policy', id],
    queryFn:  () => policyApi.getById(id).then((r) => r.data.data),
    enabled:  !!id,
  });

// ── Create ────────────────────────────────────────────────
export const useCreatePolicy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => policyApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy created successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to create policy'),
  });
};

// ── Update ────────────────────────────────────────────────
export const useUpdatePolicy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => policyApi.update(id, data).then((r) => r.data.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['policies'] });
      qc.invalidateQueries({ queryKey: ['policy', id] });
      toast.success('Policy updated successfully');
    },
    onError: (err) => toast.error(err.message || 'Failed to update policy'),
  });
};

// ── Delete ────────────────────────────────────────────────
export const useDeletePolicy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => policyApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy deleted');
    },
    onError: (err) => toast.error(err.message || 'Failed to delete policy'),
  });
};

// ── Toggle bookmark ───────────────────────────────────────
export const useToggleBookmark = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => policyApi.toggleBookmark(id).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['policies'] }),
  });
};

// ── Renewals ──────────────────────────────────────────────
export const useRenewals = (days = 60) =>
  useQuery({
    queryKey: ['renewals', days],
    queryFn:  () => policyApi.getRenewals({ days }).then((r) => r.data.data),
  });
