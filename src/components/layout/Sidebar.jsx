import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import useUIStore   from '@/store/uiStore';

const NAV_ITEMS = [
  { to: '/',          icon: '⊞', label: 'Dashboard'  },
  { to: '/policies',  icon: '📋', label: 'Policies'   },
  { to: '/renewals',  icon: '🔔', label: 'Renewals'   },
  { to: '/analytics', icon: '📊', label: 'Analytics'  },
  { to: '/calendar',  icon: '📅', label: 'Calendar'   },
  { to: '/settings',  icon: '⚙️', label: 'Settings'   },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-white border-r border-gray-200 shadow-sm
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-56' : 'w-16'}
          lg:relative lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">ID</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">InsureDesk</p>
              <p className="text-xs text-gray-400 truncate">Policy Manager</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150 group
                ${isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="truncate">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-gray-100 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <span className="text-brand-700 text-xs font-semibold">
                  {user?.fullName?.charAt(0) ?? 'U'}
                </span>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-medium text-gray-800 truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-400 capitalize truncate">{user?.role}</p>
              </div>
            </div>
          ) : null}

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-red-600 hover:bg-red-50 transition-colors
              ${!sidebarOpen ? 'justify-center' : ''}
            `}
          >
            <span className="shrink-0">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
