import React, { useState } from 'react';
import {
  X,
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';
import { hospitalService } from '../services/hospitalService';
import type { Appointment } from '../types';

interface BookingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReference?: string;
}

export const BookingLookupModal: React.FC<BookingLookupModalProps> = ({
  isOpen,
  onClose,
  initialReference = 'DEMO-ASH-84920',
}) => {
  const [reference, setReference] = useState(initialReference);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await hospitalService.lookupDemoBooking(reference.trim());
      setAppointment(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-sky-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-base text-white">Booking Lookup (Demo Mode)</h3>
              <p className="text-[11px] text-sky-300">Test appointment tracking and status lookup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sky-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Demo Note:</strong> Enter any sample code (e.g. <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded-sm">DEMO-ASH-84920</code>) or a code generated from the booking demo.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Booking Reference Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. DEMO-ASH-84920"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  className="flex-1 p-3 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 uppercase"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  {loading ? 'Checking...' : 'Check Status'}
                </button>
              </div>
            </div>
          </form>

          {/* Results */}
          {searched && (
            <div className="pt-2 border-t border-slate-100">
              {appointment ? (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-mono font-bold text-sky-800 text-sm">
                      {appointment.bookingReference}
                    </span>
                    <span className="font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Status: {appointment.status} (Demo)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient</span>
                      <span className="font-bold text-slate-900">{appointment.patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Physician</span>
                      <span className="font-bold text-slate-900">{appointment.doctorName}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Time</span>
                      <span className="font-bold text-slate-900">
                        {appointment.appointmentDate} at {appointment.startTime} IST
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                    * Cancellation workflows and status synchronization will be secured via Cloud Firestore in production.
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  No sample appointment found matching <strong className="font-mono">{reference}</strong>. Try typing <strong className="font-mono">DEMO-ASH-84920</strong>.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
