/**
 * ContactHub - Contact Management System
 * Built with Python Flask, SQLite, and Bootstrap 5
 */

import React, { useState, useEffect } from 'react';
import { Contact, ContactCategory, ActiveTab, AppView } from './types/contact';
import { INITIAL_CONTACTS } from './data/initialContacts';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ContactsList } from './components/ContactsList';
import { ContactFormModal } from './components/ContactFormModal';
import { ContactDetailsModal } from './components/ContactDetailsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CodeViewer } from './components/CodeViewer';
import { PresentationSlides } from './components/PresentationSlides';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { SqlConsoleModal } from './components/SqlConsoleModal';
import { CallSimulatorModal } from './components/CallSimulatorModal';
import { DialpadModal } from './components/DialpadModal';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  Database,
  Code2,
  Terminal,
  Command,
  Plus,
  Phone
} from 'lucide-react';
import { downloadProjectZip, exportContactsToCsv } from './utils/zipGenerator';

interface FlashMessage {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
}

export default function App() {
  // Persistence in localStorage
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem('contacthub_contacts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load contacts from localStorage', e);
    }
    return INITIAL_CONTACTS;
  });

  // Navigation states
  const [activeTab, setActiveTab] = useState<ActiveTab>('app');
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Flash message alerts
  const [flashMessages, setFlashMessages] = useState<FlashMessage[]>([
    {
      id: 'welcome-flash',
      type: 'info',
      message: 'Connected to SQLite database "contacts.db". 7 sample contacts pre-loaded.'
    }
  ]);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Interactive Extra Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSqlConsoleOpen, setIsSqlConsoleOpen] = useState(false);
  const [isDialpadOpen, setIsDialpadOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [contactToCall, setContactToCall] = useState<Contact | null>(null);

  // Sync contacts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('contacthub_contacts', JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to save contacts to localStorage', e);
    }
  }, [contacts]);

  // Auto-dismiss flash messages after 6 seconds
  const addFlash = (type: FlashMessage['type'], message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setFlashMessages(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setFlashMessages(prev => prev.filter(m => m.id !== id));
    }, 6000);
  };

  const removeFlash = (id: string) => {
    setFlashMessages(prev => prev.filter(m => m.id !== id));
  };

  // Actions
  const handleOpenAdd = () => {
    setContactToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setContactToEdit(contact);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDelete = (contact: Contact) => {
    setContactToDelete(contact);
    setIsDeleteModalOpen(true);
  };

  const handleOpenCall = (contact: Contact) => {
    setContactToCall(contact);
    setIsCallModalOpen(true);
  };

  const handleSaveCallNote = (contactId: number, note: string) => {
    setContacts(prev =>
      prev.map(c => {
        if (c.id === contactId) {
          const updatedNote = c.notes ? `${c.notes}\n[Call Note]: ${note}` : `[Call Note]: ${note}`;
          return { ...c, notes: updatedNote };
        }
        return c;
      })
    );
    addFlash('success', 'Call note appended to contact record!');
  };

  const handleToggleFavorite = (contact: Contact) => {
    const updatedStatus = !contact.is_favorite;
    setContacts(prev =>
      prev.map(c => (c.id === contact.id ? { ...c, is_favorite: updatedStatus } : c))
    );
    if (selectedContact && selectedContact.id === contact.id) {
      setSelectedContact({ ...selectedContact, is_favorite: updatedStatus });
    }
    addFlash(
      'info',
      updatedStatus
        ? `Added "${contact.full_name}" to Favorites!`
        : `Removed "${contact.full_name}" from Favorites.`
    );
  };

  const handleSaveContact = (contactData: Omit<Contact, 'id' | 'created_at'>, id?: number) => {
    if (id) {
      // Edit existing
      setContacts(prev =>
        prev.map(c => (c.id === id ? { ...c, ...contactData } : c))
      );
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact({ ...selectedContact, ...contactData });
      }
      addFlash('success', `Contact "${contactData.full_name}" was successfully updated in SQLite database!`);
    } else {
      // Add new
      const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const newContact: Contact = {
        ...contactData,
        id: newId,
        created_at: now,
      };
      setContacts(prev => [newContact, ...prev]);
      addFlash('success', `Contact "${contactData.full_name}" was successfully added to contacts.db!`);
    }
  };

  const handleConfirmDelete = (id: number) => {
    const found = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(c => c.id !== id));
    addFlash('info', `Contact "${found ? found.full_name : 'Contact'}" has been permanently deleted.`);
  };

  const handleBulkDelete = (ids: number[]) => {
    setContacts(prev => prev.filter(c => !ids.includes(c.id)));
    addFlash('info', `Deleted ${ids.length} contacts from SQLite database.`);
  };

  const handleBulkStar = (ids: number[]) => {
    setContacts(prev =>
      prev.map(c => (ids.includes(c.id) ? { ...c, is_favorite: true } : c))
    );
    addFlash('success', `Marked ${ids.length} contacts as starred favorites!`);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all contacts to original sample dataset? Any new contacts added will be cleared.')) {
      setContacts(INITIAL_CONTACTS);
      addFlash('warning', 'Database has been reset to default initial contacts.');
    }
  };

  const handleNavigateToContacts = (category?: ContactCategory, favoritesOnly?: boolean) => {
    setActiveTab('app');
    setCurrentView('contacts');
    if (favoritesOnly) {
      setShowFavoritesOnly(true);
      setSelectedCategory('All');
    } else {
      setShowFavoritesOnly(false);
      if (category) {
        setSelectedCategory(category);
      } else {
        setSelectedCategory('All');
      }
    }
  };

  const favoritesCount = contacts.filter(c => c.is_favorite).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white relative">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAddModal={handleOpenAdd}
        totalContacts={contacts.length}
        favoritesCount={favoritesCount}
        onOpenSqlConsole={() => setIsSqlConsoleOpen(true)}
        onOpenDialpad={() => setIsDialpadOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-grow">
        {/* Flash Message Alerts (Mimicking Flask's get_flashed_messages()) */}
        {flashMessages.length > 0 && (
          <div className="space-y-2 mb-6">
            {flashMessages.map(msg => {
              let alertStyle = 'bg-blue-50 text-blue-800 border-blue-200';
              let Icon = Info;
              if (msg.type === 'success') {
                alertStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                Icon = CheckCircle2;
              } else if (msg.type === 'danger') {
                alertStyle = 'bg-rose-50 text-rose-800 border-rose-200';
                Icon = AlertTriangle;
              } else if (msg.type === 'warning') {
                alertStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                Icon = AlertTriangle;
              }

              return (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-xs transition ${alertStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{msg.message}</span>
                  </div>
                  <button
                    onClick={() => removeFlash(msg.id)}
                    className="p-1 rounded-lg hover:bg-black/5 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'app' && (
          <>
            {currentView === 'dashboard' ? (
              <Dashboard
                contacts={contacts}
                onNavigateToContacts={handleNavigateToContacts}
                onOpenAddModal={handleOpenAdd}
                onViewContact={handleOpenView}
                onEditContact={handleOpenEdit}
                onDeleteContact={handleOpenDelete}
                onToggleFavorite={handleToggleFavorite}
                onResetData={handleResetData}
              />
            ) : (
              <ContactsList
                contacts={contacts}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onOpenAddModal={handleOpenAdd}
                onViewContact={handleOpenView}
                onEditContact={handleOpenEdit}
                onDeleteContact={handleOpenDelete}
                onToggleFavorite={handleToggleFavorite}
                showFavoritesOnly={showFavoritesOnly}
                setShowFavoritesOnly={setShowFavoritesOnly}
                onCallContact={handleOpenCall}
                onBulkDelete={handleBulkDelete}
                onBulkStar={handleBulkStar}
              />
            )}
          </>
        )}

        {activeTab === 'code' && <CodeViewer />}

        {activeTab === 'presentation' && <PresentationSlides />}
      </main>

      {/* Floating Action Button (FAB) for fast access */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2.5">
        <button
          onClick={() => setIsDialpadOpen(true)}
          title="Open Interactive Phone Dialpad (Press 'D')"
          className="w-11 h-11 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg border border-emerald-500/50 flex items-center justify-center transition transform hover:scale-105"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsSqlConsoleOpen(true)}
          title="Open Interactive SQLite Console"
          className="w-11 h-11 rounded-full bg-slate-900 text-emerald-400 hover:bg-slate-800 shadow-lg border border-slate-700 flex items-center justify-center transition transform hover:scale-105"
        >
          <Terminal className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          title="Open Spotlight Command Palette (Ctrl+K)"
          className="w-11 h-11 rounded-full bg-slate-900 text-blue-400 hover:bg-slate-800 shadow-lg border border-slate-700 flex items-center justify-center transition transform hover:scale-105"
        >
          <Command className="w-5 h-5" />
        </button>
        <button
          onClick={handleOpenAdd}
          title="Quick Add Contact"
          className="w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center transition transform hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ContactHub</span>
            <span>&bull;</span>
            <span>Python Flask &bull; SQLite3 &bull; Bootstrap 5</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDialpadOpen(true)}
              className="text-slate-600 hover:text-emerald-600 font-medium transition flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dialpad</span>
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsSqlConsoleOpen(true)}
              className="text-slate-600 hover:text-blue-600 font-medium transition flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Console</span>
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setActiveTab('code')}
              className="text-slate-600 hover:text-blue-600 font-medium transition flex items-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>View Flask Code</span>
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setActiveTab('presentation')}
              className="text-slate-600 hover:text-blue-600 font-medium transition"
            >
              PPT Slides
            </button>
          </div>
        </div>
      </footer>

      {/* Core Modals */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveContact}
        contactToEdit={contactToEdit}
      />

      <ContactDetailsModal
        contact={selectedContact}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={(contact) => {
          setIsDetailsModalOpen(false);
          handleOpenEdit(contact);
        }}
        onDelete={(contact) => {
          setIsDetailsModalOpen(false);
          handleOpenDelete(contact);
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      <DeleteConfirmModal
        contact={contactToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Interactive Feature Modals */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        contacts={contacts}
        onSelectContact={handleOpenView}
        onOpenAddModal={handleOpenAdd}
        onOpenSqlConsole={() => setIsSqlConsoleOpen(true)}
        onOpenDialpad={() => setIsDialpadOpen(true)}
        onDownloadZip={downloadProjectZip}
        onExportCsv={() => exportContactsToCsv(contacts)}
        onNavigateTab={(tab, view) => {
          setActiveTab(tab);
          if (view) setCurrentView(view);
        }}
        onToggleFavoritesOnly={() => {
          setShowFavoritesOnly(prev => !prev);
          setCurrentView('contacts');
        }}
      />

      <SqlConsoleModal
        isOpen={isSqlConsoleOpen}
        onClose={() => setIsSqlConsoleOpen(false)}
        contacts={contacts}
      />

      <CallSimulatorModal
        contact={contactToCall}
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onSaveNote={handleSaveCallNote}
      />

      <DialpadModal
        isOpen={isDialpadOpen}
        onClose={() => setIsDialpadOpen(false)}
        contacts={contacts}
        onStartCall={handleOpenCall}
      />
    </div>
  );
}
