import { useState, useRef } from 'react';
import * as XLSX            from 'xlsx';
import Modal                from '@/components/common/Modal';
import Spinner              from '@/components/common/Spinner';
import useMasterStore       from '@/store/masterStore';
import { policyApi }        from '@/api/policy.api';
import { useQueryClient }   from '@tanstack/react-query';
import toast                from 'react-hot-toast';

// ── Column map: Excel header → Policy field ───────────────
const COL_MAP = {
  'sl no':                  'serialNumber',
  'serial number':          'serialNumber',
  'policyholder':           'policyHolderName',
  'policy holder name':     'policyHolderName',
  'policy holder':          'policyHolderName',
  'name':                   'policyHolderName',
  'category':               'category',        // resolved to ID below
  'broker house':           'brokerHouse',      // resolved to ID below
  'broker':                 'brokerHouse',
  'company':                'company',          // resolved to ID below
  'issue date':             'policyIssueDate',
  'policy issue date':      'policyIssueDate',
  'paid date':              'paidDate',
  'issued month':           'issuedMonth',
  'doc':                    'doc',
  'next renewal':           'nextRenewalDate',
  'next renewal date':      'nextRenewalDate',
  'premium without gst':    'premiumWithoutGST',
  'premium (no gst)':       'premiumWithoutGST',
  'premium (ex-gst)':       'premiumWithoutGST',
  'premium with gst':       'premiumWithGST',
  'premium (gst)':          'premiumWithGST',
  'premium (with gst)':     'premiumWithGST',
  'sum assured':            'sumAssured',
  'ppt':                    'premiumPayingTerm',
  'premium paying term':    'premiumPayingTerm',
  'pt':                     'policyTerm',
  'policy term':            'policyTerm',
  'bond status':            'bondStatus',
  'payment status':         'paymentStatus',
  'payout status':          'payoutStatus',
  'sys update status':      'systemUpdateStatus',
  'system update status':   'systemUpdateStatus',
  'advisor':                'advisorName',
  'advisor name':           'advisorName',
  'adv name':               'advisorName',
  'adv level 3':            'advisorLevel3',
  'adv level 3 name':       'advisorLevel3',
  'adv level 4':            'advisorLevel4',
  'top leader':             'advisorLevel4',
  'top leader name':        'advisorLevel4',
  'remarks':                'remarks',
};

// ── Parse Excel date serial or string to ISO string ───────
const parseDate = (val) => {
  if (!val) return undefined;
  if (typeof val === 'number') {
    // Excel date serial
    const date = XLSX.SSF.parse_date_code(val);
    if (date) return new Date(date.y, date.m - 1, date.d).toISOString();
  }
  const d = new Date(val);
  return isNaN(d) ? undefined : d.toISOString();
};

const DATE_FIELDS = ['policyIssueDate', 'paidDate', 'doc', 'nextRenewalDate'];
const NUM_FIELDS  = ['premiumWithoutGST', 'premiumWithGST', 'sumAssured', 'premiumPayingTerm', 'policyTerm'];

export default function BulkImport({ open, onClose }) {
  const qc = useQueryClient();
  const { categories, brokerHouses, companies } = useMasterStore();

  const fileRef         = useRef();
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // upload | preview | done

  // ── Build lookup maps (name → id, case-insensitive) ──────
  const catMap     = Object.fromEntries(categories.map(c  => [c.name.toLowerCase(),  c._id]));
  const brokerMap  = Object.fromEntries(brokerHouses.map(b => [b.name.toLowerCase(),  b._id]));
  const companyMap = Object.fromEntries(companies.map(c    => [c.name.toLowerCase(),  c._id]));

  // ── Parse uploaded Excel file ─────────────────────────
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb   = XLSX.read(ev.target.result, { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const raw  = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const mapped = raw.map((row, i) => {
        const policy = {};
        Object.entries(row).forEach(([header, val]) => {
          const key = COL_MAP[header.toLowerCase().trim()];
          if (!key) return;

          if (DATE_FIELDS.includes(key)) {
            policy[key] = parseDate(val) || undefined;
          } else if (NUM_FIELDS.includes(key)) {
            const n = parseFloat(val);
            policy[key] = isNaN(n) ? undefined : n;
          } else if (key === 'category') {
            policy[key] = catMap[String(val).toLowerCase().trim()];
          } else if (key === 'brokerHouse') {
            policy[key] = brokerMap[String(val).toLowerCase().trim()];
          } else if (key === 'company') {
            policy[key] = companyMap[String(val).toLowerCase().trim()];
          } else {
            policy[key] = String(val).trim() || undefined;
          }
        });
        return policy;
      });

      // Validate
      const errs = [];
      mapped.forEach((p, i) => {
        if (!p.policyHolderName) errs.push(`Row ${i + 2}: Missing policyholder name`);
        if (!p.category)         errs.push(`Row ${i + 2}: Category not found or missing`);
      });

      setRows(mapped);
      setErrors(errs);
      setStep('preview');
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Submit to backend ─────────────────────────────────
  // Strip undefined / null / empty-string values from each row so Joi
  // never sees absent-but-present keys. Also normalise status fields
  // that might have come from Excel with wrong capitalisation.
  const cleanRow = (row) => {
    const cleaned = {};
    Object.entries(row).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      cleaned[k] = v;
    });
    // Normalise status enums (case-insensitive match)
    const PAYMENT = { paid:'Paid', unpaid:'Unpaid', bounced:'Bounced', partial:'Partial', returned:'Returned', dtps:'Dtps' };
    const BOND    = { pending:'Pending', received:'Received', dispatched:'Dispatched', na:'NA', issued:'Issued', returned:'Returned', hold:'Hold' };
    const PAYOUT  = { due:'Due', paid:'Paid', na:'NA', unpaid:'Unpaid', returned:'Returned' };
    if (cleaned.paymentStatus) cleaned.paymentStatus = PAYMENT[cleaned.paymentStatus.toLowerCase()] ?? cleaned.paymentStatus;
    if (cleaned.bondStatus)    cleaned.bondStatus    = BOND[cleaned.bondStatus.toLowerCase()]    ?? cleaned.bondStatus;
    if (cleaned.payoutStatus)  cleaned.payoutStatus  = PAYOUT[cleaned.payoutStatus.toLowerCase()] ?? cleaned.payoutStatus;
    return cleaned;
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const valid = rows
        .filter(r => r.policyHolderName && r.category)
        .map(cleanRow);
      await policyApi.bulkImport({ policies: valid });
      qc.invalidateQueries({ queryKey: ['policies'] });
      toast.success(`${valid.length} policies imported successfully!`);
      setStep('done');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setRows([]); setErrors([]); setStep('upload');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <Modal open={open} onClose={handleClose} title="Bulk Import Policies" size="lg">

      {/* ── Step 1: Upload ── */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Drop zone */}
          <label
            className="flex flex-col items-center justify-center w-full h-48 border-2
              border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer
              hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors"
          >
            <div className="text-center">
              <p className="text-4xl mb-2">📂</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Click to upload Excel file
              </p>
              <p className="text-xs text-gray-400 mt-1">.xlsx or .xls — max 500 rows</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFile}
            />
          </label>

          {/* Column guide */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Supported column headers (case-insensitive):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'SL No','Policyholder','Category','Broker House','Company',
                'Issue Date','Paid Date','Issued Month','DOC','Next Renewal Date',
                'Premium Without GST','Premium With GST','Sum Assured',
                'PPT','PT','Bond Status','Payment Status','Payout Status',
                'Advisor Name','ADV Level 3','Top Leader Name','Remarks',
              ].map(h => (
                <span key={h} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800
                  text-gray-600 dark:text-gray-400 rounded text-xs font-mono">
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Download template link */}
          <p className="text-xs text-center text-gray-400">
            Make sure Category, Broker House, and Company names match exactly what's in the system.
          </p>
        </div>
      )}

      {/* ── Step 2: Preview ── */}
      {step === 'preview' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex gap-3">
            <div className="card px-4 py-3 flex-1 text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{rows.length}</p>
              <p className="text-xs text-gray-400">Rows found</p>
            </div>
            <div className="card px-4 py-3 flex-1 text-center">
              <p className="text-xl font-bold text-green-600">{rows.length - errors.length}</p>
              <p className="text-xs text-gray-400">Ready to import</p>
            </div>
            <div className="card px-4 py-3 flex-1 text-center">
              <p className="text-xl font-bold text-red-500">{errors.length}</p>
              <p className="text-xs text-gray-400">With issues</p>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900
              rounded-lg p-3 max-h-32 overflow-y-auto">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Issues detected:</p>
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 dark:text-red-400">{e}</p>
              ))}
            </div>
          )}

          {/* Preview table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 max-h-64">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  {['#','Policyholder','Category','Premium (ex-GST)','Payment Status'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={i} className={!r.policyHolderName || !r.category
                    ? 'bg-red-50 dark:bg-red-950/30' : ''}>
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">
                      {r.policyHolderName || <span className="text-red-500">Missing</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {r.category
                        ? categories.find(c => c._id === r.category)?.name
                        : <span className="text-red-500">Not found</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {r.premiumWithoutGST ? `₹${r.premiumWithoutGST.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {r.paymentStatus || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p className="text-xs text-center text-gray-400 py-2">
                Showing 20 of {rows.length} rows
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <button onClick={reset} className="btn-secondary">
              ← Re-upload
            </button>
            <button
              onClick={handleImport}
              className="btn-primary min-w-[140px] justify-center"
              disabled={loading || rows.filter(r => r.policyHolderName && r.category).length === 0}
            >
              {loading ? <Spinner size="sm" /> : `Import ${rows.filter(r => r.policyHolderName && r.category).length} policies`}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Done ── */}
      {step === 'done' && (
        <div className="text-center py-10">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Import Complete!</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Your policies have been added to the system.
          </p>
          <button onClick={handleClose} className="btn-primary">
            Done
          </button>
        </div>
      )}

    </Modal>
  );
}
