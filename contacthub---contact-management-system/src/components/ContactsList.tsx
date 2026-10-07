import React, { useState, useMemo } from 'react';
import { Contact, ContactCategory, SortOption } from '../types/contact';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  Table as TableIcon, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Eye, 
  Pencil, 
  Trash2, 
  X, 
  FileSpreadsheet, 
  Star, 
  MessageCircle, 
  Copy, 
  Check, 
  Download, 
  Sparkles,
  PhoneCall,
  CheckSquare,
  Square,
  Flame
} from 'lucide-react';
import { exportContactsToCsv, exportContactToVCard } from '../utils/zipGenerator';

interface ContactsListProps {
  contacts: Contact[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onOpenAddModal: () => void;
  onViewContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  onToggleFavorite?: (contact: Contact) => void;
  showFavoritesOnly?: boolean;
  setShowFavoritesOnly?: (val: boolean) => void;
  onCallContact?: (contact: Contact) => void;
  onBulkDelete?: (ids: number[]) => void;
  onBulkStar?: (ids: number[]) => void;
}

// Search term highlighter helper
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 text-slate-900 rounded-xs px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenAddModal,
  onViewContact,
  onEditContact,
  onDeleteContact,
  onToggleFavorite,
  showFavoritesOnly = false,
  setShowFavoritesOnly,
  onCallContact,
  onBulkDelete,
  onBulkStar
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('All');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Distinct cities list
  const cities = useMemo(() => {
    const list = Array.from(new Set(contacts.map(c => c.city).filter(Boolean)));
    return ['All', ...list];
  }, [contacts]);

  // Filter & Sort Contacts
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Favorites only filter
    if (showFavoritesOnly) {
      result = result.filter(c => c.is_favorite);
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(c => c.category === selectedCategory);
    }

    // City filter
    if (selectedCity && selectedCity !== 'All') {
      result = result.filter(c => c.city === selectedCity);
    }

    // Search query filter (searches across name, phone, email, city, category, notes)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.full_name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.full_name.localeCompare(b.full_name);
      } else if (sortBy === 'name_desc') {
        return b.full_name.localeCompare(a.full_name);
      } else if (sortBy === 'date_asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        // date_desc
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [contacts, selectedCategory, searchQuery, sortBy, showFavoritesOnly, selectedCity]);

  const categories: (ContactCategory | 'All')[] = ['All', 'Family', 'Friends', 'College', 'Work', 'Other'];

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

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkExport = () => {
    const selected = contacts.filter(c => selectedIds.includes(c.id));
    exportContactsToCsv(selected.length > 0 ? selected : filteredContacts);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Contacts Directory</span>
            {showFavoritesOnly && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                Starred Only
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500">
            {filteredContacts.length} of {contacts.length} total contacts displayed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {setShowFavoritesOnly && (
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                showFavoritesOnly
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : 'text-amber-500 fill-amber-500'}`} />
              <span>{showFavoritesOnly ? 'Show All' : 'Favorites'}</span>
            </button>
          )}

          <button
            onClick={() => exportContactsToCsv(filteredContacts)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5"
            title="Export filtered list to CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Search by name, phone, email, city, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter contacts by category"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition pr-8"
              >
                <option value="All">All Categories</option>
                <option value="Family">Family</option>
                <option value="Friends">Friends</option>
                <option value="College">College</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3 flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort contacts by field"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition pr-8"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="name_asc">Name (A &rarr; Z)</option>
                <option value="name_desc">Name (Z &rarr; A)</option>
              </select>
              <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                title="Card Grid View"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'card' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1">Categories:</span>
          {categories.map((cat) => {
            const count = cat === 'All' ? contacts.length : contacts.filter(c => c.category === cat).length;
            const isActive = selectedCategory === cat || (cat === 'All' && (!selectedCategory || selectedCategory === 'All'));
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* City Chips */}
          {cities.length > 2 && (
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-slate-400 font-medium mr-1">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-100 text-slate-700 border-none rounded-lg px-2 py-0.5 text-xs font-semibold"
              >
                {cities.map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
          )}

          {(searchQuery || (selectedCategory && selectedCategory !== 'All') || showFavoritesOnly || selectedCity !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedCity('All');
                setShowFavoritesOnly && setShowFavoritesOnly(false);
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Contacts List Representation */}
      {filteredContacts.length > 0 ? (
        viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300"
                        title="Select All"
                      />
                    </th>
                    <th className="py-3.5 px-4">Contact Name</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Email Address</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">City</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((contact) => {
                    const isSelected = selectedIds.includes(contact.id);
                    return (
                      <tr key={contact.id} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-blue-50/40' : ''}`}>
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(contact.id)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {/* Star favorite button */}
                            {onToggleFavorite && (
                              <button
                                onClick={() => onToggleFavorite(contact)}
                                className="p-1 rounded text-slate-300 hover:text-amber-500 transition"
                                title={contact.is_favorite ? 'Starred' : 'Add to Starred'}
                              >
                                <Star className={`w-4 h-4 ${contact.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                              </button>
                            )}

                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {contact.full_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <button
                                onClick={() => onViewContact(contact)}
                                className="font-semibold text-slate-900 hover:text-blue-600 text-left transition"
                              >
                                <HighlightText text={contact.full_name} query={searchQuery} />
                              </button>
                              {contact.notes && (
                                <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                                  <HighlightText text={contact.notes} query={searchQuery} />
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => onCallContact ? onCallContact(contact) : null}
                              title="Interactive Call Simulator"
                              className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </button>

                            <a
                              href={`tel:${contact.phone}`}
                              className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 transition"
                            >
                              <span><HighlightText text={contact.phone} query={searchQuery} /></span>
                            </a>
                            <button
                              onClick={() => handleCopy(contact.phone, `phone-${contact.id}`)}
                              className="p-1 rounded text-slate-300 hover:text-slate-600 transition"
                              title="Copy number"
                            >
                              {copiedId === `phone-${contact.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <a
                              href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp Chat"
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
                                <span className="truncate"><HighlightText text={contact.email} query={searchQuery} /></span>
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
                            onClick={() => setSelectedCategory(contact.category)}
                            title={`Filter by ${contact.category}`}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition transform hover:scale-105 cursor-pointer ${getCategoryBadgeClass(contact.category)}`}
                          >
                            {contact.category}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell text-slate-600">
                          {contact.city ? (
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span><HighlightText text={contact.city} query={searchQuery} /></span>
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            {onCallContact && (
                              <button
                                onClick={() => onCallContact(contact)}
                                title="Interactive Call Simulator"
                                className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg transition"
                              >
                                <PhoneCall className="w-4 h-4 text-emerald-600" />
                              </button>
                            )}
                            <button
                              onClick={() => exportContactToVCard(contact)}
                              title="Download vCard (.vcf) for phone"
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onViewContact(contact)}
                              title="View Details"
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditContact(contact)}
                              title="Edit Contact"
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-white rounded-lg transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteContact(contact)}
                              title="Delete Contact"
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Card Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => {
              const isSelected = selectedIds.includes(contact.id);
              return (
                <div
                  key={contact.id}
                  className={`bg-white p-5 rounded-3xl border shadow-xs hover:shadow-md transition flex flex-col justify-between group ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(contact.id)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300"
                        />
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {contact.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <button
                            onClick={() => onViewContact(contact)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left transition"
                          >
                            <HighlightText text={contact.full_name} query={searchQuery} />
                          </button>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedCategory(contact.category)}
                              title={`Filter by ${contact.category}`}
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition transform hover:scale-105 cursor-pointer ${getCategoryBadgeClass(contact.category)}`}
                            >
                              {contact.category}
                            </button>
                          </div>
                        </div>
                      </div>

                      {onToggleFavorite && (
                        <button
                          onClick={() => onToggleFavorite(contact)}
                          className="p-1 text-slate-300 hover:text-amber-500 transition"
                          title={contact.is_favorite ? 'Starred' : 'Add to Starred'}
                        >
                          <Star className={`w-4 h-4 ${contact.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onCallContact ? onCallContact(contact) : null}
                            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            title="Interactive Call Simulator"
                          >
                            <PhoneCall className="w-3 h-3" />
                          </button>
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-1 hover:text-blue-600 transition"
                          >
                            <span className="font-medium text-slate-800">
                              <HighlightText text={contact.phone} query={searchQuery} />
                            </span>
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(contact.phone, `phone-card-${contact.id}`)}
                            className="p-1 rounded text-slate-300 hover:text-slate-600"
                          >
                            {copiedId === `phone-card-${contact.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {contact.email && (
                        <div className="flex items-center justify-between">
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-2 hover:text-blue-600 transition truncate max-w-[210px]"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              <HighlightText text={contact.email} query={searchQuery} />
                            </span>
                          </a>
                          <button
                            onClick={() => handleCopy(contact.email, `mail-card-${contact.id}`)}
                            className="p-1 rounded text-slate-300 hover:text-slate-600"
                          >
                            {copiedId === `mail-card-${contact.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}

                      {(contact.city || contact.address) && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            <HighlightText
                              text={`${contact.city ? contact.city : ''}${contact.city && contact.address ? ', ' : ''}${contact.address ? contact.address : ''}`}
                              query={searchQuery}
                            />
                          </span>
                        </div>
                      )}

                      {contact.notes && (
                        <p className="mt-2 text-slate-500 bg-slate-50 p-2 rounded-xl line-clamp-2 italic text-[11px]">
                          "<HighlightText text={contact.notes} query={searchQuery} />"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">ID #{contact.id}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => exportContactToVCard(contact)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                        title="Download vCard (.vcf)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onViewContact(contact)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditContact(contact)}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteContact(contact)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No contacts found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No contacts matched "${searchQuery}". Check the spelling or reset your category filter.`
              : showFavoritesOnly
              ? 'You have not starred any contacts as favorites yet.'
              : 'There are no contacts recorded in this category.'}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {(searchQuery || selectedCategory !== 'All' || showFavoritesOnly || selectedCity !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedCity('All');
                  setShowFavoritesOnly && setShowFavoritesOnly(false);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                Clear Search & Filters
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              Add New Contact
            </button>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <span className="text-xs font-semibold text-slate-300">
            <span className="font-bold text-white">{selectedIds.length}</span> selected
          </span>

          <div className="h-4 w-px bg-slate-700" />

          {onBulkStar && (
            <button
              onClick={() => onBulkStar(selectedIds)}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Star All</span>
            </button>
          )}

          <button
            onClick={handleBulkExport}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {onBulkDelete && (
            <button
              onClick={() => {
                if (window.confirm(`Delete ${selectedIds.length} selected contacts permanently?`)) {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="px-3 py-1 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <button
            onClick={() => setSelectedIds([])}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition ml-1"
            title="Deselect all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
