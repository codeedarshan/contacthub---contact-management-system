import React, { useState } from 'react';
import { Contact, ContactCategory } from '../types/contact';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Pencil, 
  Trash2, 
  MessageCircle,
  FileText,
  Copy,
  Check,
  Star,
  Download
} from 'lucide-react';
import { exportContactToVCard } from '../utils/zipGenerator';

interface ContactDetailsModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite?: (contact: Contact) => void;
}

export const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({
  contact,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  if (!isOpen || !contact) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(contact.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyEmail = () => {
    if (contact.email) {
      navigator.clipboard.writeText(contact.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyAddress = () => {
    const fullAddr = `${contact.address || ''}${contact.address && contact.city ? ', ' : ''}${contact.city || ''}`;
    if (fullAddr.trim()) {
      navigator.clipboard.writeText(fullAddr);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const getCategoryBadgeClass = (cat: ContactCategory) => {
    switch (cat) {
      case 'Family':
        return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30';
      case 'Friends':
        return 'bg-sky-500/20 text-sky-200 border-sky-400/30';
      case 'College':
        return 'bg-amber-500/20 text-amber-200 border-amber-400/30';
      case 'Work':
        return 'bg-blue-500/20 text-blue-200 border-blue-400/30';
      default:
        return 'bg-slate-500/20 text-slate-200 border-slate-400/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 text-white relative">
          <div className="absolute top-4 right-4 flex items-center gap-1">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(contact)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                title={contact.is_favorite ? 'Starred Favorite' : 'Mark as Favorite'}
              >
                <Star className={`w-5 h-5 ${contact.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            )}
            <button
              onClick={() => exportContactToVCard(contact)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Download vCard (.vcf)"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-blue-700 font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
              {contact.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">{contact.full_name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeClass(contact.category)}`}>
                  {contact.category}
                </span>
                {contact.is_favorite && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-400/20 text-amber-200 border border-amber-300/30 flex items-center gap-1 font-semibold">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>Favorite</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Contact ID: #{contact.id} &bull; Added {contact.created_at}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Phone Number
              </span>
              <a
                href={`tel:${contact.phone}`}
                className="font-bold text-slate-900 text-sm hover:text-blue-600 block transition"
              >
                {contact.phone}
              </a>
              <div className="flex items-center gap-1.5 mt-2.5">
                <a
                  href={`tel:${contact.phone}`}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={handleCopyPhone}
                  title="Copy number"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition ml-auto"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Email Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Email Address
              </span>
              {contact.email ? (
                <>
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-bold text-slate-900 text-sm hover:text-blue-600 block truncate transition"
                  >
                    {contact.email}
                  </a>
                  <div className="flex items-center justify-between mt-2.5">
                    <a
                      href={`mailto:${contact.email}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Send Email</span>
                    </a>
                    <button
                      onClick={handleCopyEmail}
                      title="Copy email"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </>
              ) : (
                <span className="text-slate-400 text-xs italic block mt-1">No email registered</span>
              )}
            </div>
          </div>

          {/* Location & Address */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Location & Address</span>
              </span>
              {(contact.address || contact.city) && (
                <button
                  onClick={handleCopyAddress}
                  className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {contact.address ? (
                <>
                  {contact.address}
                  {contact.city ? `, ${contact.city}` : ''}
                </>
              ) : contact.city ? (
                contact.city
              ) : (
                <span className="text-slate-400 text-xs italic font-normal">No address provided</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Notes & Context</span>
            </span>
            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
              {contact.notes || <span className="text-slate-400 italic">No remarks or notes recorded for this contact.</span>}
            </p>
          </div>

          {/* Actions Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onDelete(contact);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(contact);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Contact</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
