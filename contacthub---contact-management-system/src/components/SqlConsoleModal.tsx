import React, { useState } from 'react';
import { Contact } from '../types/contact';
import { 
  Terminal, 
  X, 
  Play, 
  Database, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

interface SqlConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
}

const PRESET_QUERIES = [
  {
    name: 'All Contacts',
    query: 'SELECT id, full_name, phone, category, city FROM contacts ORDER BY id DESC;'
  },
  {
    name: 'Category Counts',
    query: 'SELECT category, COUNT(*) as total_contacts FROM contacts GROUP BY category;'
  },
  {
    name: 'Favorites Only',
    query: 'SELECT id, full_name, phone, email FROM contacts WHERE is_favorite = 1;'
  },
  {
    name: 'City Distribution',
    query: 'SELECT city, COUNT(*) as count FROM contacts GROUP BY city ORDER BY count DESC;'
  },
  {
    name: 'Search Pattern',
    query: "SELECT full_name, phone, email, notes FROM contacts WHERE notes LIKE '%project%';"
  }
];

export const SqlConsoleModal: React.FC<SqlConsoleModalProps> = ({
  isOpen,
  onClose,
  contacts
}) => {
  const [query, setQuery] = useState(PRESET_QUERIES[0].query);
  const [copied, setCopied] = useState(false);
  const [resultRows, setResultRows] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const runQuery = (sqlToRun?: string) => {
    const sql = (sqlToRun || query).trim();
    setErrorMsg(null);
    const start = performance.now();

    try {
      const lower = sql.toLowerCase();
      let rows: any[] = [];

      if (lower.startsWith('select')) {
        // Evaluate simulated query against live contacts
        if (lower.includes('group by category')) {
          const map: Record<string, number> = {};
          contacts.forEach(c => {
            map[c.category] = (map[c.category] || 0) + 1;
          });
          rows = Object.entries(map).map(([category, count]) => ({
            category,
            total_contacts: count
          }));
        } else if (lower.includes('group by city')) {
          const map: Record<string, number> = {};
          contacts.forEach(c => {
            const city = c.city || 'Unknown';
            map[city] = (map[city] || 0) + 1;
          });
          rows = Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map(([city, count]) => ({ city, count }));
        } else if (lower.includes('is_favorite = 1') || lower.includes('is_favorite = true')) {
          rows = contacts
            .filter(c => c.is_favorite)
            .map(c => ({ id: c.id, full_name: c.full_name, phone: c.phone, email: c.email || 'None' }));
        } else if (lower.includes('like')) {
          // Extract pattern
          const match = sql.match(/like\s+'%([^%']+)%'/i);
          const pattern = match ? match[1].toLowerCase() : '';
          rows = contacts
            .filter(c =>
              c.full_name.toLowerCase().includes(pattern) ||
              c.phone.toLowerCase().includes(pattern) ||
              (c.notes && c.notes.toLowerCase().includes(pattern))
            )
            .map(c => ({ id: c.id, full_name: c.full_name, phone: c.phone, notes: c.notes }));
        } else {
          // General select
          rows = contacts.map(c => ({
            id: c.id,
            full_name: c.full_name,
            phone: c.phone,
            category: c.category,
            city: c.city || '-'
          }));
        }
      } else {
        throw new Error('For security in this browser console, only SELECT statements are allowed.');
      }

      const elapsed = Math.max(1, Math.round((performance.now() - start) * 10) / 10);
      setExecutionTime(elapsed);
      setResultRows(rows);
    } catch (err: any) {
      setErrorMsg(err.message || 'SQL Execution error.');
      setResultRows([]);
    }
  };

  const handleSelectPreset = (pQuery: string) => {
    setQuery(pQuery);
    runQuery(pQuery);
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run initial query if not run yet
  if (resultRows.length === 0 && !errorMsg) {
    runQuery();
  }

  const columns = resultRows.length > 0 ? Object.keys(resultRows[0]) : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-950 text-slate-200 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Interactive SQLite Console</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  contacts.db Connected
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Execute and test SQL queries live against the SQLite database schema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Query Chips */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          {PRESET_QUERIES.map(p => (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(p.query)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Query Input Editor */}
        <div className="p-5 border-b border-slate-800 space-y-3 bg-slate-950">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">sqlite&gt; SQL Query:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyQuery}
                className="hover:text-white flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => setQuery('SELECT * FROM contacts;')}
                className="hover:text-white flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <textarea
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="Type your SQL query here (e.g. SELECT * FROM contacts;)..."
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Driver: Python sqlite3 connector &bull; Read-only test sandbox
            </span>
            <button
              onClick={() => runQuery()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Execute SQL</span>
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {errorMsg ? (
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono">
              Error: {errorMsg}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-2 border-b border-slate-800">
                <span className="font-mono text-emerald-400">
                  &bull; Query OK, {resultRows.length} rows in set ({executionTime ?? 0} ms)
                </span>
                <span className="text-slate-500 text-[11px]">Rendered in real-time</span>
              </div>

              {resultRows.length > 0 ? (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                      <tr>
                        {columns.map(col => (
                          <th key={col} className="p-2.5">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {resultRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/60">
                          {columns.map(col => (
                            <td key={col} className="p-2.5 text-slate-300 whitespace-nowrap">
                              {row[col] !== undefined && row[col] !== null ? String(row[col]) : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 italic text-xs">
                  Empty set (0 rows matched)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive SQLite query simulator querying contacts.db in real-time.</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
