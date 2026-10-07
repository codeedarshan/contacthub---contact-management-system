import React, { useState, useEffect } from 'react';
import { Contact } from '../types/contact';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Grid, 
  X,
  FileText,
  User,
  Check
} from 'lucide-react';

interface CallSimulatorModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveNote?: (contactId: number, note: string) => void;
}

export const CallSimulatorModal: React.FC<CallSimulatorModalProps> = ({
  contact,
  isOpen,
  onClose,
  onSaveNote
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callNote, setCallNote] = useState('');
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    if (!isOpen || !contact) {
      setCallStatus('calling');
      setSeconds(0);
      setIsMuted(false);
      setIsSpeaker(false);
      setCallNote('');
      setSavedNote(false);
      return;
    }

    // Simulate connection after 2 seconds
    const timer1 = setTimeout(() => {
      setCallStatus('connected');
    }, 2200);

    return () => clearTimeout(timer1);
  }, [isOpen, contact]);

  // Call timer
  useEffect(() => {
    let interval: any;
    if (isOpen && callStatus === 'connected') {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, callStatus]);

  if (!isOpen || !contact) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleSaveNoteSubmit = () => {
    if (callNote.trim() && onSaveNote) {
      onSaveNote(contact.id, callNote.trim());
      setSavedNote(true);
      setTimeout(() => setSavedNote(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center p-6 space-y-6">
        {/* Top Dismiss Button */}
        <div className="w-full flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Info */}
        <div className="text-center space-y-2">
          {/* Avatar with Ring Animation */}
          <div className="relative inline-block mx-auto">
            {callStatus === 'calling' && (
              <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
            )}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 relative z-10">
              {contact.full_name.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xl tracking-tight text-white">{contact.full_name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{contact.phone}</p>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {callStatus === 'calling' && (
              <span className="text-blue-400 animate-pulse">Calling &bull;&bull;&bull;</span>
            )}
            {callStatus === 'connected' && (
              <span className="text-emerald-400 font-mono text-sm">{formatTime(seconds)}</span>
            )}
            {callStatus === 'ended' && (
              <span className="text-rose-400">Call Ended</span>
            )}
          </div>
        </div>

        {/* Action Controls Grid */}
        <div className="grid grid-cols-3 gap-4 w-full px-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition ${
              isMuted ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition ${
              isSpeaker ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-[10px] font-medium">Speaker</span>
          </button>

          <a
            href={`tel:${contact.phone}`}
            className="p-3.5 rounded-2xl bg-slate-800/80 text-slate-300 hover:bg-slate-800 flex flex-col items-center gap-1.5 transition"
          >
            <Phone className="w-5 h-5" />
            <span className="text-[10px] font-medium">Real Dial</span>
          </a>
        </div>

        {/* Call Note Input */}
        {callStatus === 'connected' && (
          <div className="w-full bg-slate-800/50 p-3 rounded-2xl border border-slate-700/60 space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <FileText className="w-3 h-3 text-blue-400" />
              <span>Quick Call Notes:</span>
            </span>
            <input
              type="text"
              placeholder="e.g. Scheduled sync for Thursday at 3 PM..."
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {callNote && (
              <button
                onClick={handleSaveNoteSubmit}
                className="w-full py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition flex items-center justify-center gap-1"
              >
                {savedNote ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : null}
                <span>{savedNote ? 'Saved to Contact Notes!' : 'Save Note'}</span>
              </button>
            )}
          </div>
        )}

        {/* End Call Button */}
        <div className="pt-2">
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition transform hover:scale-105 active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
