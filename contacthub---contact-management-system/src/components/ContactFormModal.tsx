import React, { useState, useEffect } from 'react';
import { Contact, ContactCategory } from '../types/contact';
import { X, UserPlus, Pencil, AlertCircle, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'created_at'>, id?: number) => void;
  contactToEdit?: Contact | null;
}

const SAMPLE_DEMO_DATA: Omit<Contact, 'id' | 'created_at'>[] = [
  {
    full_name: 'Dr. Katherine Johnson',
    phone: '+1 (555) 432-8765',
    email: 'k.johnson@spacecenter.gov',
    address: '1 NASA Parkway',
    city: 'Houston',
    category: 'Work',
    notes: 'Senior orbital dynamics specialist. Key contact for calculation audits.',
    is_favorite: true
  },
  {
    full_name: 'Siddharth Patel',
    phone: '+91 98250 12345',
    email: 'siddharth.patel@collegemail.edu',
    address: 'Hostel 4, Room 204, Tech Campus',
    city: 'Vadodara',
    category: 'College',
    notes: 'Semester project team leader. Working on Python Web Frameworks.',
    is_favorite: true
  },
  {
    full_name: 'Aunt Maya',
    phone: '+1 (555) 321-7654',
    email: 'maya.family@gmail.com',
    address: '42 Maple Grove Lane',
    city: 'Toronto',
    category: 'Family',
    notes: 'Aunt Maya - send festival greetings and call on Sundays.',
    is_favorite: false
  }
];

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contactToEdit,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Work');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({});

  useEffect(() => {
    if (contactToEdit) {
      setFullName(contactToEdit.full_name);
      setPhone(contactToEdit.phone);
      setEmail(contactToEdit.email || '');
      setAddress(contactToEdit.address || '');
      setCity(contactToEdit.city || '');
      setCategory(contactToEdit.category);
      setNotes(contactToEdit.notes || '');
      setIsFavorite(Boolean(contactToEdit.is_favorite));
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('');
      setCategory('Work');
      setNotes('');
      setIsFavorite(false);
    }
    setErrors({});
  }, [contactToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { fullName?: string; phone?: string; email?: string } = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    }

    if (!phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (phone.trim().length < 6) {
      errs.phone = 'Please enter a valid phone number (at least 6 digits).';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFillDemo = () => {
    const pick = SAMPLE_DEMO_DATA[Math.floor(Math.random() * SAMPLE_DEMO_DATA.length)];
    setFullName(pick.full_name);
    setPhone(pick.phone);
    setEmail(pick.email);
    setAddress(pick.address);
    setCity(pick.city);
    setCategory(pick.category);
    setNotes(pick.notes);
    setIsFavorite(Boolean(pick.is_favorite));
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(
      {
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        category,
        notes: notes.trim(),
        is_favorite: isFavorite
      },
      contactToEdit ? contactToEdit.id : undefined
    );

    // Confetti celebration on adding a new contact!
    if (!contactToEdit) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (err) {
        // Safe fallback
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          contactToEdit ? 'bg-gradient-to-r from-amber-600 to-amber-700' : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/20 font-bold text-white text-base shadow-xs">
              {fullName.trim() ? fullName.slice(0, 2).toUpperCase() : (contactToEdit ? <Pencil className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />)}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {contactToEdit ? `Edit Contact: ${contactToEdit.full_name}` : 'Create New Contact'}
              </h3>
              <p className="text-xs text-white/80">
                {contactToEdit ? `Updating SQLite Record #${contactToEdit.id}` : 'Inserts new row into contacts.db'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!contactToEdit && (
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 transition"
                title="Fill with random sample data"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Fill</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Eleanor Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
              />
              {errors.phone && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. eleanor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContactCategory)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              >
                <option value="Family">Family</option>
                <option value="Friends">Friends</option>
                <option value="College">College</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                City / Town
              </label>
              <input
                type="text"
                placeholder="e.g. Chicago"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Street / Residential Address
              </label>
              <input
                type="text"
                placeholder="e.g. 742 Evergreen Terrace, Suite 10"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Notes & Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Add relationship details, project notes, or reminders..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              />
            </div>

            {/* Star as Favorite Toggle */}
            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_favorite_checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="is_favorite_checkbox" className="text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer">
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                <span>Mark as Starred / Favorite Contact</span>
              </label>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition ${
                contactToEdit
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {contactToEdit ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
