import React, { useState } from 'react';
import { Contact, ContactCategory } from '../types/contact';
import { 
  Users, 
  UserPlus, 
  Heart, 
  Smile, 
  GraduationCap, 
  Briefcase, 
  Folder, 
  Clock, 
  ArrowRight, 
  Phone, 
  Mail, 
  Eye, 
  Pencil, 
  Trash2, 
  Database, 
  Download, 
  RotateCcw, 
  Sparkles,
  Star,
  MessageCircle,
  Copy,
  Check,
  TrendingUp,
  Award
} from 'lucide-react';
import { exportContactsToCsv, exportContactsToJson, downloadProjectZip } from '../utils/zipGenerator';

interface DashboardProps {
  contacts: Contact[];
  onNavigateToContacts: (category?: ContactCategory, favoritesOnly?: boolean) => void;
  onOpenAddModal: () => void;
  onViewContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  onToggleFavorite?: (contact: Contact) => void;
  onResetData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  contacts,
  onNavigateToContacts,
  onOpenAddModal,
  onViewContact,
  onEditContact,
  onDeleteContact,
  onToggleFavorite,
  onResetData
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Counts
  const total = contacts.length;
  const countByCategory = (cat: ContactCategory) => contacts.filter(c => c.category === cat).length;

  const familyCount = countByCategory('Family');
  const friendsCount = countByCategory('Friends');
  const collegeCount = countByCategory('College');
  const workCount = countByCategory('Work');
  const otherCount = countByCategory('Other');
  const favoriteCount = contacts.filter(c => c.is_favorite).length;

  // Percentage distribution
  const pct = (cnt: number) => total > 0 ? Math.round((cnt / total) * 100) : 0;

  // 5 Most recently added
  const recentContacts = [...contacts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getCategoryBadgeClass = (cat: ContactCategory) => {
    switch (cat) {
      case 'Family':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Friends':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'College':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Work':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
              Active Session
            </span>
            <span className="text-xs text-slate-400">SQLite &bull; Python Flask</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contacts Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your personal and professional contacts with real-time analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => downloadProjectZip()}
            title="Download full Python Flask + SQLite project for localhost"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Flask (.ZIP)</span>
          </button>
          <button
            onClick={() => onNavigateToContacts(undefined, true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition flex items-center gap-1.5 shadow-xs"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Favorites ({favoriteCount})</span>
          </button>
          <button
            onClick={() => onNavigateToContacts()}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>View All ({total})</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Contact</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Card */}
        <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-100">Total Contacts</span>
              <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-4xl font-extrabold mt-2 tracking-tight">{total}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-blue-100 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                <span>{favoriteCount} Starred Favorites</span>
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
            <span>Database: <code className="text-white font-mono">contacts.db</code></span>
            <button
              onClick={() => onNavigateToContacts()}
              className="font-medium hover:text-white flex items-center gap-1 group"
            >
              Browse list <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="absolute -right-4 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* Family */}
        <button
          onClick={() => onNavigateToContacts('Family')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition text-left flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-600">{pct(familyCount)}%</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-800">{familyCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Family</div>
          </div>
        </button>

        {/* Friends */}
        <button
          onClick={() => onNavigateToContacts('Friends')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition text-left flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition">
              <Smile className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-sky-600">{pct(friendsCount)}%</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-800">{friendsCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Friends</div>
          </div>
        </button>

        {/* College */}
        <button
          onClick={() => onNavigateToContacts('College')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition text-left flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-amber-600">{pct(collegeCount)}%</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-800">{collegeCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">College</div>
          </div>
        </button>

        {/* Work */}
        <button
          onClick={() => onNavigateToContacts('Work')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition text-left flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-blue-600">{pct(workCount)}%</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-800">{workCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Work</div>
          </div>
        </button>
      </div>

      {/* Category Distribution Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Directory Distribution</span>
          </span>
          <span className="text-slate-400">{total} contacts categorized</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
          {familyCount > 0 && (
            <div
              style={{ width: `${(familyCount / total) * 100}%` }}
              className="bg-emerald-500 rounded-full transition-all duration-500"
              title={`Family: ${familyCount} (${pct(familyCount)}%)`}
            />
          )}
          {friendsCount > 0 && (
            <div
              style={{ width: `${(friendsCount / total) * 100}%` }}
              className="bg-sky-500 rounded-full transition-all duration-500"
              title={`Friends: ${friendsCount} (${pct(friendsCount)}%)`}
            />
          )}
          {collegeCount > 0 && (
            <div
              style={{ width: `${(collegeCount / total) * 100}%` }}
              className="bg-amber-500 rounded-full transition-all duration-500"
              title={`College: ${collegeCount} (${pct(collegeCount)}%)`}
            />
          )}
          {workCount > 0 && (
            <div
              style={{ width: `${(workCount / total) * 100}%` }}
              className="bg-blue-600 rounded-full transition-all duration-500"
              title={`Work: ${workCount} (${pct(workCount)}%)`}
            />
          )}
          {otherCount > 0 && (
            <div
              style={{ width: `${(otherCount / total) * 100}%` }}
              className="bg-slate-400 rounded-full transition-all duration-500"
              title={`Other: ${otherCount} (${pct(otherCount)}%)`}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Family ({familyCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Friends ({friendsCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> College ({collegeCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" /> Work ({workCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Other ({otherCount})
          </span>
        </div>
      </div>

      {/* Recently Added Contacts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Recently Added Contacts</h2>
              <p className="text-xs text-slate-500">Last 5 entries recorded in the SQLite database</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToContacts()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all {total} contacts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Email</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 hidden md:table-cell">City</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* Favorite star */}
                        {onToggleFavorite && (
                          <button
                            onClick={() => onToggleFavorite(contact)}
                            className="p-1 rounded text-slate-300 hover:text-amber-500 transition"
                            title={contact.is_favorite ? 'Remove Favorite' : 'Mark Favorite'}
                          >
                            <Star className={`w-4 h-4 ${contact.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                        )}

                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {contact.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <button
                            onClick={() => onViewContact(contact)}
                            className="font-semibold text-slate-900 hover:text-blue-600 text-left transition flex items-center gap-1.5"
                          >
                            <span>{contact.full_name}</span>
                          </button>
                          {contact.notes && (
                            <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                              {contact.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={`tel:${contact.phone}`}
                          className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.phone}</span>
                        </a>
                        <button
                          onClick={() => handleCopy(contact.phone, `phone-${contact.id}`)}
                          className="p-1 rounded text-slate-300 hover:text-slate-600 transition"
                          title="Copy phone"
                        >
                          {copiedId === `phone-${contact.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        {/* WhatsApp launcher */}
                        <a
                          href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      {contact.email ? (
                        <div className="inline-flex items-center gap-1">
                          <a
                            href={`mailto:${contact.email}`}
                            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition truncate max-w-[180px]"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{contact.email}</span>
                          </a>
                          <button
                            onClick={() => handleCopy(contact.email, `mail-${contact.id}`)}
                            className="p-1 rounded text-slate-300 hover:text-slate-600 transition"
                            title="Copy email"
                          >
                            {copiedId === `mail-${contact.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No email</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onNavigateToContacts(contact.category)}
                        title={`Filter by ${contact.category}`}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition transform hover:scale-105 cursor-pointer ${getCategoryBadgeClass(contact.category)}`}
                      >
                        {contact.category}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-slate-600">
                      {contact.city || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                          onClick={() => onViewContact(contact)}
                          title="View Details"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditContact(contact)}
                          title="Edit Contact"
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-white rounded transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteContact(contact)}
                          title="Delete Contact"
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-white rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800">No contacts in database</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Get started by adding your first contact to the SQLite table.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Add First Contact
            </button>
          </div>
        )}
      </div>

      {/* Quick Tools & Database Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Tools */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Data Operations & Export</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Export contacts for spreadsheet tools or backups</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => exportContactsToCsv(contacts)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportContactsToJson(contacts)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onResetData}
              title="Reset contacts back to initial seed data"
              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Samples</span>
            </button>
          </div>
        </div>

        {/* SQLite Database Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Database Architecture</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">SQLite Engine with ACID compliance</p>
          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between py-0.5 border-b border-slate-100">
              <span className="text-slate-500">File Name:</span>
              <span className="font-mono font-medium text-slate-800">contacts.db</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-100">
              <span className="text-slate-500">Table:</span>
              <span className="font-mono font-medium text-slate-800">contacts (9 columns)</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Driver:</span>
              <span className="font-mono font-medium text-emerald-600">python3 sqlite3</span>
            </div>
          </div>
        </div>

        {/* Flask Routes Reference Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Folder className="w-4 h-4 text-indigo-600" />
            <span>Flask Route Map</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">RESTful endpoints in `app.py`</p>
          <div className="mt-2.5 flex flex-wrap gap-1 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">GET /</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">GET /contacts</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">GET/POST /add</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">GET /view/&lt;id&gt;</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">GET/POST /edit/&lt;id&gt;</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">POST /delete/&lt;id&gt;</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">GET /search</span>
          </div>
        </div>
      </div>
    </div>
  );
};
