import React from 'react';
import { Contact } from '../types/contact';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (contactId: number) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  contact,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-slate-900">"{contact.full_name}"</span>?
            </p>
            <p className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-100 mt-3">
              This action will remove the record (ID #{contact.id}) from the SQLite database.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(contact.id);
                onClose();
              }}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Yes, Delete Contact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
