import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import Spinner      from '@/components/common/Spinner';
import toast        from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const login    = useAuthStore((s) => s.login);

  const [form, setForm]       = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Both fields are required');
      return;
    }
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 flex items-center justify-center p-4">
      {/* Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-64
        bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-3 shadow-lg">
              <span className="text-white text-2xl font-bold">ID</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">InsureDesk</h1>
            <p className="text-sm text-gray-500 mt-1">Policy Management System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                placeholder="Enter username"
                autoComplete="username"
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full justify-center py-2.5 mt-2"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-6">
            Default: <span className="font-mono">admin / admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
