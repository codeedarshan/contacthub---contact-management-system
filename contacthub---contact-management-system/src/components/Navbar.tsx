import React from 'react';
import { ActiveTab, AppView } from '../types/contact';
import { 
  Users, 
  LayoutDashboard, 
  UserPlus, 
  Code2, 
  Presentation, 
  Search, 
  Database,
  Terminal,
  Command,
  Phone
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddModal: () => void;
  totalContacts: number;
  favoritesCount?: number;
  onOpenSqlConsole?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenDialpad?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  totalContacts,
  favoritesCount = 0,
  onOpenSqlConsole,
  onOpenCommandPalette,
  onOpenDialpad
}) => {
  // Listen for keyboard shortcuts: / to search, n to add new, Ctrl+K for command palette
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if ((e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) {
        e.preventDefault();
        onOpenCommandPalette?.();
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('navbar-search-input');
        searchInput?.focus();
      } else if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onOpenAddModal();
      } else if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onOpenDialpad?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAddModal, onOpenCommandPalette, onOpenDialpad]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner with Academic / Stack badge */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">
              <Database className="w-3 h-3" /> Python Flask &bull; SQLite3 &bull; Bootstrap 5
            </span>
            <span className="hidden sm:inline text-slate-400">
              Interactive Contact Management System
            </span>
          </div>

          {/* Tab Selector & Interactive Tools in Top Banner */}
          <div className="flex items-center gap-1">
            {onOpenSqlConsole && (
              <button
                onClick={onOpenSqlConsole}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-mono flex items-center gap-1.5 border border-slate-700 transition shadow-xs"
                title="Open Interactive SQLite Console"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>SQL Console</span>
              </button>
            )}

            {onOpenDialpad && (
              <button
                onClick={onOpenDialpad}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-mono flex items-center gap-1.5 border border-slate-700 transition shadow-xs"
                title="Open Phone Dialpad (Press 'D')"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Dialpad</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('app')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'app'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Live Web App</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Flask Code</span>
            </button>
            <button
              onClick={() => setActiveTab('presentation')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'presentation'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>PPT Slides</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bootstrap-style Navigation Bar */}
      <div className="bg-blue-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('app');
                setCurrentView('dashboard');
              }}
              className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-90 transition text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-xs">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="tracking-tight text-xl font-extrabold">ContactHub</span>
                <span className="block text-[10px] text-blue-100 font-normal leading-none">
                  Flask &bull; SQLite3 &bull; Bootstrap 5
                </span>
              </div>
            </button>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1 ml-6 border-l border-blue-500/50 pl-6">
              <button
                onClick={() => {
                  setActiveTab('app');
                  setCurrentView('dashboard');
                }}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'app' && currentView === 'dashboard'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('app');
                  setCurrentView('contacts');
                }}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'app' && currentView === 'contacts'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>All Contacts</span>
                <span className={`px-1.5 py-0.2 text-xs rounded-full ${
                  activeTab === 'app' && currentView === 'contacts'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-blue-700 text-blue-200'
                }`}>
                  {totalContacts}
                </span>
              </button>

              <button
                onClick={onOpenAddModal}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold text-blue-100 hover:bg-blue-700 hover:text-white transition flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            </nav>
          </div>

          {/* Right Actions: Command Palette / Search + Quick Add */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                id="navbar-search-input"
                type="text"
                placeholder="Search (/ or ⌘K)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'app') setActiveTab('app');
                  if (currentView !== 'contacts') setCurrentView('contacts');
                }}
                className="w-44 sm:w-60 bg-blue-700/80 border border-blue-400/40 rounded-xl pl-8 pr-12 py-1.5 text-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-blue-800 transition"
              />
              <Search className="w-4 h-4 text-blue-200 absolute left-2.5 top-2.5 pointer-events-none" />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-blue-200 hover:text-white text-xs"
                >
                  &times;
                </button>
              ) : (
                <button
                  onClick={() => onOpenCommandPalette?.()}
                  title="Open Command Palette (Ctrl+K)"
                  className="hidden sm:inline-flex items-center gap-0.5 absolute right-2 top-1.5 px-1.5 py-0.5 bg-blue-800 text-[10px] text-blue-200 rounded border border-blue-600 font-mono hover:text-white hover:bg-blue-900 transition"
                >
                  <Command className="w-2.5 h-2.5" />
                  <span>K</span>
                </button>
              )}
            </div>

            <button
              onClick={onOpenAddModal}
              title="Add Contact (Press 'N')"
              className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-xl text-sm font-bold shadow-xs flex items-center gap-1.5 transition shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Contact</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
