import React, { useState, useEffect } from 'react';
import { Contact, ActiveTab, AppView } from '../types/contact';
import { 
  Search, 
  UserPlus, 
  Users, 
  Star, 
  Download, 
  Terminal, 
  FileCode, 
  Presentation, 
  Phone, 
  X,
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onOpenAddModal: () => void;
  onOpenSqlConsole: () => void;
  onOpenDialpad?: () => void;
  onDownloadZip: () => void;
  onExportCsv: () => void;
  onNavigateTab: (tab: ActiveTab, view?: AppView) => void;
  onToggleFavoritesOnly: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onSelectContact,
  onOpenAddModal,
  onOpenSqlConsole,
  onOpenDialpad,
  onDownloadZip,
  onExportCsv,
  onNavigateTab,
  onToggleFavoritesOnly,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredContacts = query.trim()
    ? contacts.filter(
        c =>
          c.full_name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.toLowerCase().includes(query.toLowerCase()) ||
          (c.email && c.email.toLowerCase().includes(query.toLowerCase())) ||
          (c.city && c.city.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : contacts.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a contact name, phone, or command (e.g. 'Add', 'SQL', 'Export')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-mono border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-3 max-h-[420px] overflow-y-auto space-y-4 text-xs">
          {/* Contacts Section */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Contacts ({filteredContacts.length})
            </div>
            <div className="space-y-1">
              {filteredContacts.length > 0 ? (
                filteredContacts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onClose();
                      onSelectContact(c);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {c.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                          <span>{c.full_name}</span>
                          {c.is_favorite && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                        </div>
                        <div className="text-[11px] text-slate-500">{c.phone} &bull; {c.category}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600 flex items-center gap-0.5">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-slate-400 italic">No contacts match "{query}"</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Quick Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 flex items-center gap-2.5 transition"
              >
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Create New Contact</div>
                  <div className="text-[11px] text-slate-400">Add name, phone, email, category and notes</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenSqlConsole();
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 flex items-center gap-2.5 transition"
              >
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Open Interactive SQLite Console</div>
                  <div className="text-[11px] text-slate-400">Execute live SQL queries on contacts.db</div>
                </div>
              </button>

              {onOpenDialpad && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDialpad();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center gap-2.5 transition"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold">Open Interactive Phone Dialpad (Press 'D')</div>
                    <div className="text-[11px] text-slate-400">Audio tones, live lookup, and call simulator</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onDownloadZip();
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center gap-2.5 transition"
              >
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Download Flask Project (.ZIP)</div>
                  <div className="text-[11px] text-slate-400">Ready to run on your local computer's localhost:5000</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onExportCsv();
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-700 flex items-center gap-2.5 transition"
              >
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Export Contacts to CSV</div>
                  <div className="text-[11px] text-slate-400">Download formatted spreadsheet file</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>SQLite3 Table: <code>contacts</code></span>
          </span>
          <span>Tip: Press <strong>Ctrl + K</strong> anywhere to toggle</span>
        </div>
      </div>
    </div>
  );
};
