import { Outlet }     from 'react-router-dom';
import { useEffect }  from 'react';
import Sidebar        from './Sidebar';
import Header         from './Header';
import SunMoonEffect  from '@/components/common/SunMoonEffect';
import useMasterStore from '@/store/masterStore';
import useUIStore     from '@/store/uiStore';

export default function Layout() {
  const fetchAll    = useMasterStore((s) => s.fetchAll);
  const initDarkMode = useUIStore((s) => s.initDarkMode);

  useEffect(() => {
    fetchAll();
    initDarkMode(); // ensure <html> class is in sync after hydration
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

      {/* Full-screen watermark behind everything */}
      <div className="watermark" aria-hidden="true" />

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />

        <main className="flex-1 overflow-y-auto relative">
          {/* Page content sits above watermark & sun/moon */}
          <div className="relative z-10 p-4 md:p-6 pb-36">
            <Outlet />
          </div>
        </main>

        {/* Sunrise / moonrise — sits at bottom of content area */}
        <div className="relative z-0">
          <SunMoonEffect />
        </div>
      </div>
    </div>
  );
}
