import React, { useState, useEffect, useRef } from 'react';
import { Contact } from '../types/contact';
import { X, Phone, Delete, UserCheck, PhoneCall, Volume2, VolumeX } from 'lucide-react';

interface DialpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onStartCall: (contact: Contact) => void;
}

const DIALPAD_KEYS = [
  { digit: '1', sub: '', freq: [697, 1209] },
  { digit: '2', sub: 'ABC', freq: [697, 1336] },
  { digit: '3', sub: 'DEF', freq: [697, 1477] },
  { digit: '4', sub: 'GHI', freq: [770, 1209] },
  { digit: '5', sub: 'JKL', freq: [770, 1336] },
  { digit: '6', sub: 'MNO', freq: [770, 1477] },
  { digit: '7', sub: 'PQRS', freq: [852, 1209] },
  { digit: '8', sub: 'TUV', freq: [852, 1336] },
  { digit: '9', sub: 'WXYZ', freq: [852, 1477] },
  { digit: '*', sub: '', freq: [941, 1209] },
  { digit: '0', sub: '+', freq: [941, 1336] },
  { digit: '#', sub: '', freq: [941, 1477] },
];

export const DialpadModal: React.FC<DialpadModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onStartCall,
}) => {
  const [typedNumber, setTypedNumber] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context on demand
  const playTone = (freqs: number[]) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const duration = 0.12;

      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {
      // Audio might be blocked by browser policy until gesture
    }
  };

  const handleKeyPress = (digit: string, freqs?: number[]) => {
    if (freqs) playTone(freqs);
    setTypedNumber(prev => (prev.length < 18 ? prev + digit : prev));
  };

  const handleBackspace = () => {
    setTypedNumber(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setTypedNumber('');
  };

  // Live match contacts based on typed digits or name
  const matchedContacts = typedNumber.trim()
    ? contacts.filter(c => {
        const cleanPhone = c.phone.replace(/\D/g, '');
        const cleanTyped = typedNumber.replace(/\D/g, '');
        return cleanPhone.includes(cleanTyped) || c.full_name.toLowerCase().includes(typedNumber.toLowerCase());
      })
    : [];

  const topMatch = matchedContacts[0] || null;

  // Handle direct call
  const handleCall = () => {
    if (!typedNumber.trim()) return;

    if (topMatch) {
      onClose();
      onStartCall(topMatch);
    } else {
      // Create a temporary contact for dialing
      const dialContact: Contact = {
        id: -1,
        full_name: `Dialed: ${typedNumber}`,
        phone: typedNumber,
        email: '',
        address: 'Direct Dial',
        city: 'Local',
        category: 'Other',
        notes: 'Outbound simulated call from interactive dialpad.',
        created_at: new Date().toISOString()
      };
      onClose();
      onStartCall(dialContact);
    }
  };

  // Keyboard support while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleCall();
      } else {
        const found = DIALPAD_KEYS.find(k => k.digit === e.key);
        if (found) {
          handleKeyPress(found.digit, found.freq);
        } else if (e.key === '+') {
          handleKeyPress('0', [941, 1336]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, typedNumber, topMatch, soundEnabled]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Interactive Phone Dialpad</h3>
              <p className="text-[10px] text-slate-400">Audio feedback &amp; real-time contact lookup</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              title={soundEnabled ? 'Mute Keypad Tones' : 'Enable Keypad Tones'}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 min-h-[100px] flex flex-col justify-center">
          {/* Matched Contact Peek */}
          {topMatch ? (
            <button
              onClick={() => {
                setTypedNumber(topMatch.phone);
              }}
              className="mb-1 text-left px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-between text-xs text-blue-800 transition hover:bg-blue-100"
            >
              <span className="flex items-center gap-1.5 truncate font-medium">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{topMatch.full_name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-200/60 font-semibold">{topMatch.category}</span>
              </span>
              <span className="text-[10px] text-blue-600 font-mono shrink-0 ml-1">{topMatch.phone}</span>
            </button>
          ) : typedNumber.trim() ? (
            <div className="text-[11px] text-slate-400 mb-1 px-1">
              New number (no matching contact)
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 mb-1 px-1">
              Enter phone number or use keyboard
            </div>
          )}

          {/* Number Display */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="text-2xl font-bold font-mono tracking-wider text-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
              {typedNumber || <span className="text-slate-300 font-normal text-xl">--- --- ----</span>}
            </div>

            {typedNumber && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleBackspace}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Backspace"
                >
                  <Delete className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClear}
                  className="text-[11px] text-slate-400 hover:text-slate-600 px-1 font-semibold"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dialpad Buttons Grid */}
        <div className="p-5 bg-white">
          <div className="grid grid-cols-3 gap-3">
            {DIALPAD_KEYS.map((key) => (
              <button
                key={key.digit}
                onClick={() => handleKeyPress(key.digit, key.freq)}
                className="h-14 rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border border-slate-200 hover:border-blue-300 transition-all transform active:scale-95 flex flex-col items-center justify-center shadow-xs group"
              >
                <span className="text-xl font-bold text-slate-800 group-hover:text-blue-600 leading-none">
                  {key.digit}
                </span>
                {key.sub && (
                  <span className="text-[9px] font-semibold text-slate-400 group-hover:text-blue-500 tracking-wider mt-0.5 leading-none">
                    {key.sub}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Call Action Button */}
          <div className="mt-5 flex items-center justify-center">
            <button
              onClick={handleCall}
              disabled={!typedNumber.trim()}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition transform active:scale-98"
            >
              <PhoneCall className="w-5 h-5 animate-pulse" />
              <span>Call {topMatch ? topMatch.full_name.split(' ')[0] : 'Number'}</span>
            </button>
          </div>

          {/* Quick shortcuts note */}
          <div className="mt-3 text-center text-[10px] text-slate-400">
            Press <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">Enter</span> to dial &bull; <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">Esc</span> to close
          </div>
        </div>
      </div>
    </div>
  );
};
