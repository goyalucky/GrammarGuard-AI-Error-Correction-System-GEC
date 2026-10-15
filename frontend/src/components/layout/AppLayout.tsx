import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { X } from 'lucide-react';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <div className="relative h-full">
              <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute -right-10 top-4 rounded-lg bg-white p-2 text-gray-500 shadow-md hover:text-gray-900"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
