import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, HelpCircle, Settings as SettingsIcon, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onMobileMenu: () => void;
}

const routeTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/': { title: 'Dashboard', breadcrumb: 'Home' },
  '/correction': { title: 'Grammar Correction', breadcrumb: 'Grammar Correction' },
  '/documents': { title: 'Document Review', breadcrumb: 'Document Review' },
  '/analytics': { title: 'My Writing Analytics', breadcrumb: 'Analytics' },
  '/learning': { title: 'Grammar Learning', breadcrumb: 'Grammar Learning' },
  '/settings': { title: 'Settings', breadcrumb: 'Settings' },
};

export default function Topbar({ onMobileMenu }: TopbarProps) {
  const location = useLocation();
  const routeInfo = routeTitles[location.pathname] ?? { title: 'GrammarGuard AI', breadcrumb: 'Page' };
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setShowHelp(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenu}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900">{routeInfo.title}</h1>
          <p className="hidden text-xs text-gray-400 sm:block">{routeInfo.breadcrumb}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search…"
              className="w-56 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="relative" ref={helpRef}>
          <button
            onClick={() => setShowHelp((s) => !s)}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          {showHelp && (
            <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
              <p className="text-sm font-semibold text-gray-900">Need help?</p>
              <p className="mt-1 text-xs text-gray-500">
                Use the Grammar Correction workspace to paste text and run the simulated
                correction pipeline. Explore the Grammar Learning page for interactive lessons.
              </p>
              <p className="mt-2 text-xs text-gray-400">
                This is a Phase 1 frontend demo — no live AI model is running.
              </p>
            </div>
          )}
        </div>

        <Link
          to="/settings"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Settings"
        >
          <SettingsIcon className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
