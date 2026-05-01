import { useState, useEffect } from 'react';
import Modal          from '@/components/common/Modal';
import Spinner        from '@/components/common/Spinner';
import useUIStore     from '@/store/uiStore';
import useMasterStore from '@/store/masterStore';
import { useCreatePolicy, useUpdatePolicy } from '@/hooks/usePolicies';

// ── Accordion section wrapper ─────────────────────────────
function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Empty form state ──────────────────────────────────────
const EMPTY = {
  serialNumber: '', policyHolderName: '',
  category: '', brokerHouse: '', company: '',
  paidDate: '', policyIssueDate: '', issuedMonth: '', doc: '', nextRenewalDate: '',
  premiumWithoutGST: '', premiumWithGST: '', sumAssured: '',
  premiumPayingTerm: '', policyTerm: '',
  systemUpdateStatus: '',
  bondStatus: 'Pending', paymentStatus: 'Unpaid', payoutStatus: 'Due',
  advisorName: '', advisorLevel3: '', advisorLevel4: '',
  remarks: '',
};

export default function PolicyForm() {
  const { policyModalOpen, closePolicyModal, editingPolicy } = useUIStore();
  const { categories, brokerHouses, getCompaniesByBroker }   = useMasterStore();
  const createMutation = useCreatePolicy();
  const updateMutation = useUpdatePolicy();

  const [form, setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const isEditing  = !!editingPolicy;
  const isLoading  = createMutation.isPending || updateMutation.isPending;
  const companies  = getCompaniesByBroker(form.brokerHouse);

  // Populate form when editing
  useEffect(() => {
    if (editingPolicy) {
      setForm({
        ...EMPTY,
        ...editingPolicy,
        category:    editingPolicy.category?._id    ?? editingPolicy.category    ?? '',
        brokerHouse: editingPolicy.brokerHouse?._id ?? editingPolicy.brokerHouse ?? '',
        company:     editingPolicy.company?._id     ?? editingPolicy.company     ?? '',
        paidDate:        fmtDateInput(editingPolicy.paidDate),
        policyIssueDate: fmtDateInput(editingPolicy.policyIssueDate),
        doc:             fmtDateInput(editingPolicy.doc),
        nextRenewalDate: fmtDateInput(editingPolicy.nextRenewalDate),
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [editingPolicy, policyModalOpen]);

  const fmtDateInput = (d) =>
    d ? new Date(d).toISOString().split('T')[0] : '';

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  // ── Validation ────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.policyHolderName.trim()) errs.policyHolderName = 'Required';
    if (!form.category)                errs.category         = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Strip empty strings → undefined so backend doesn't get blank values
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '')
    );

    if (isEditing) {
      await updateMutation.mutateAsync({ id: editingPolicy._id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    closePolicyModal();
  };

  const inp = (key, extra = {}) => ({
    className: `input ${errors[key] ? 'border-red-400 focus:ring-red-400' : ''}`,
    value:     form[key] ?? '',
    onChange:  (e) => set(key, e.target.value),
    ...extra,
  });

  const sel = (key) => ({
    className: `select ${errors[key] ? 'border-red-400' : ''}`,
    value:     form[key] ?? '',
    onChange:  (e) => set(key, e.target.value),
  });

  return (
    <Modal
      open={policyModalOpen}
      onClose={closePolicyModal}
      title={isEditing ? 'Edit Policy' : 'Add New Policy'}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate>

        {/* 1. Basic Info */}
        <Section title="1 — Basic Information" defaultOpen>
          <Field label="Policyholder Name" required>
            <input {...inp('policyHolderName')} placeholder="Full name" />
            {errors.policyHolderName && (
              <p className="text-xs text-red-500 mt-1">{errors.policyHolderName}</p>
            )}
          </Field>

          <Field label="Serial Number">
            <input {...inp('serialNumber')} placeholder="SL No" />
          </Field>

          <Field label="Category" required>
            <select {...sel('category')}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </Field>

          <Field label="Issued Month">
            <input {...inp('issuedMonth')} placeholder="e.g. January 2024" />
          </Field>

          <Field label="Broker House">
            <select
              {...sel('brokerHouse')}
              onChange={(e) => { set('brokerHouse', e.target.value); set('company', ''); }}
            >
              <option value="">Select broker</option>
              {brokerHouses.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Company">
            <select {...sel('company')} disabled={!form.brokerHouse}>
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </Section>

        {/* 2. Dates */}
        <Section title="2 — Dates">
          <Field label="Policy Issue Date">
            <input type="date" {...inp('policyIssueDate')} />
          </Field>
          <Field label="Paid Date (DTPS)">
            <input type="date" {...inp('paidDate')} />
          </Field>
          <Field label="Date of Commencement (DOC)">
            <input type="date" {...inp('doc')} />
          </Field>
          <Field label="Next Renewal Date">
            <input type="date" {...inp('nextRenewalDate')} />
          </Field>
        </Section>

        {/* 3. Financial Details */}
        <Section title="3 — Financial Details">
          <Field label="Premium without GST (₹)">
            <input type="number" min="0" {...inp('premiumWithoutGST')} placeholder="0" />
          </Field>
          <Field label="Premium with GST (₹)">
            <input type="number" min="0" {...inp('premiumWithGST')} placeholder="0" />
          </Field>
          <Field label="Sum Assured (₹)">
            <input type="number" min="0" {...inp('sumAssured')} placeholder="0" />
          </Field>
          <Field label="Premium Paying Term (PPT — years)">
            <input type="number" min="0" {...inp('premiumPayingTerm')} placeholder="e.g. 10" />
          </Field>
          <Field label="Policy Term (PT — years)">
            <input type="number" min="0" {...inp('policyTerm')} placeholder="e.g. 20" />
          </Field>
        </Section>

        {/* 4. Status */}
        <Section title="4 — Status">
          <Field label="Payment Status">
            <select {...sel('paymentStatus')}>
              {['Paid', 'Unpaid', 'Bounced', 'Partial'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Bond Status">
            <select {...sel('bondStatus')}>
              {['Pending', 'Received', 'Dispatched', 'NA'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Payout Status">
            <select {...sel('payoutStatus')}>
              {['Due', 'Paid', 'NA'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="System Update Status">
            <input {...inp('systemUpdateStatus')} placeholder="e.g. Updated" />
          </Field>
        </Section>

        {/* 5. Advisors */}
        <Section title="5 — Advisors">
          <Field label="Advisor Name (ADV Name)">
            <input {...inp('advisorName')} placeholder="Primary advisor" />
          </Field>
          <Field label="ADV Level 3 Name">
            <input {...inp('advisorLevel3')} placeholder="Level 3" />
          </Field>
          <Field label="Top Leader Name">
            <input {...inp('advisorLevel4')} placeholder="Level 4" />
          </Field>
          <Field label="Remarks">
            <input {...inp('remarks')} placeholder="Optional notes" />
          </Field>
        </Section>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closePolicyModal}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary min-w-[120px]" disabled={isLoading}>
            {isLoading
              ? <Spinner size="sm" />
              : isEditing ? 'Save Changes' : 'Create Policy'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
