import { useState }    from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast           from 'react-hot-toast';
import { categoryApi, brokerHouseApi, companyApi } from '@/api/master.api';
import { authApi }     from '@/api/auth.api';
import useMasterStore  from '@/store/masterStore';
import useAuthStore    from '@/store/authStore';
import Spinner         from '@/components/common/Spinner';
import ConfirmDialog   from '@/components/common/ConfirmDialog';

// ── Generic editable list ─────────────────────────────────
function MasterList({ title, items, onCreate, onDelete, loading, nameField = 'name', extra }) {
  const [input, setInput]     = useState('');
  const [delTarget, setDel]   = useState(null);

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>

      {/* Add row */}
      <div className="flex gap-2 mb-4">
        {extra && extra({ input, setInput })}
        <input
          className="input flex-1"
          placeholder={`Add new ${title.toLowerCase()}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              onCreate(input.trim());
              setInput('');
            }
          }}
        />
        <button
          onClick={() => { if (input.trim()) { onCreate(input.trim()); setInput(''); } }}
          className="btn-primary px-3"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : '+'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item._id}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 group">
            <div className="flex items-center gap-2">
              {item.colorCode && (
                <span className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.colorCode }} />
              )}
              <span className="text-sm text-gray-700">{item[nameField]}</span>
              {item.brokerHouse?.name && (
                <span className="text-xs text-gray-400">— {item.brokerHouse.name}</span>
              )}
            </div>
            <button
              onClick={() => setDel(item)}
              className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No items yet</p>
        )}
      </div>

      <ConfirmDialog
        open={!!delTarget}
        onClose={() => setDel(null)}
        onConfirm={() => { onDelete(delTarget._id); setDel(null); }}
        message={`Delete "${delTarget?.[nameField]}"?`}
      />
    </div>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { categories, brokerHouses, companies,
    addCategory, removeCategory,
    addBrokerHouse, removeBrokerHouse,
    addCompany, removeCompany } = useMasterStore();

  const isAdmin = useAuthStore((s) => s.isAdmin());

  // ── Change password ───────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('New passwords do not match'); return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwError('');
    } catch (err) {
      setPwError(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Category mutations ────────────────────────────────
  const createCat = async (name) => {
    try {
      const res = await categoryApi.create({ name });
      addCategory(res.data.data);
      toast.success('Category added');
    } catch { toast.error('Failed to add category'); }
  };
  const deleteCat = async (id) => {
    try {
      await categoryApi.remove(id);
      removeCategory(id);
      toast.success('Category deleted');
    } catch { toast.error('Failed to delete category'); }
  };

  // ── Broker mutations ──────────────────────────────────
  const createBroker = async (name) => {
    try {
      const res = await brokerHouseApi.create({ name });
      addBrokerHouse(res.data.data);
      toast.success('Broker house added');
    } catch { toast.error('Failed to add broker house'); }
  };
  const deleteBroker = async (id) => {
    try {
      await brokerHouseApi.remove(id);
      removeBrokerHouse(id);
      toast.success('Broker house deleted');
    } catch { toast.error('Failed to delete broker house'); }
  };

  // ── Company mutations (needs broker selection) ────────
  const [newCompanyBroker, setNewCompanyBroker] = useState('');
  const createCompany = async (name) => {
    if (!newCompanyBroker) { toast.error('Select a broker first'); return; }
    try {
      const res = await companyApi.create({ name, brokerHouse: newCompanyBroker });
      addCompany(res.data.data);
      toast.success('Company added');
    } catch { toast.error('Failed to add company'); }
  };
  const deleteCompany = async (id) => {
    try {
      await companyApi.remove(id);
      removeCompany(id);
      toast.success('Company deleted');
    } catch { toast.error('Failed to delete company'); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Master data — admin only */}
      {isAdmin && (
        <>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Master Data
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <MasterList
              title="Categories"
              items={categories}
              onCreate={createCat}
              onDelete={deleteCat}
            />
            <MasterList
              title="Broker Houses"
              items={brokerHouses}
              onCreate={createBroker}
              onDelete={deleteBroker}
            />
            <MasterList
              title="Companies"
              items={companies}
              onCreate={createCompany}
              onDelete={deleteCompany}
              extra={({ input, setInput }) => (
                <select
                  className="select w-40 shrink-0"
                  value={newCompanyBroker}
                  onChange={(e) => setNewCompanyBroker(e.target.value)}
                >
                  <option value="">Broker…</option>
                  {brokerHouses.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              )}
            />
          </div>
        </>
      )}

      {/* Change password */}
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Security
      </h2>
      <div className="card p-5 max-w-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Change Password</h3>
        <form onSubmit={handlePwChange} noValidate className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input"
              value={pwForm.confirm}
              onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>
          {pwError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {pwError}
            </p>
          )}
          <button type="submit" className="btn-primary w-full justify-center" disabled={pwLoading}>
            {pwLoading ? <Spinner size="sm" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
