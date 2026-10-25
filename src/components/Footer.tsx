import React, { useState } from 'react';
import {
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Heart,
  AlertTriangle,
  Lock,
  Sparkles,
} from 'lucide-react';
import type { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onAdminClick: () => void;
  onBookClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onAdminClick,
  onBookClick,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Emergency Advisory Strip */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4 sm:px-6 lg:px-8 text-amber-200 text-xs">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong>Emergency Advisory:</strong> Aashirwad Hospital provides scheduled outpatient family medicine, diabetology, and gynaecology consultations.
            For critical trauma, severe cardiac distress, or acute life-threatening emergencies, please immediately call{' '}
            <strong className="text-white">108 (India Emergency Ambulance)</strong> or proceed to the nearest emergency trauma center.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Hospital Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold shadow-md">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg tracking-tight">Aashirwad Hospital</h3>
                <p className="text-xs text-sky-400 font-medium italic">"{settings.slogan}"</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Family healthcare, specialized diabetology, and gynaecology consultations in Hingne Khurd, Pune.
              Led by Dr. Nandkumar Bhutada (22 yrs exp.) and Dr. Poonam Bhutada (20 yrs exp.).
            </p>
          </div>

          {/* Col 2: Doctors & Specialties */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Consulting Doctors</h4>
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-bold text-slate-100">Dr. Nandkumar Bhutada</p>
                <p className="text-slate-400">Family Physician and Diabetologist</p>
                <p className="text-[11px] text-sky-400 font-medium">M.D. (Diet) (Ayu.) • 22 Years Exp.</p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="font-bold text-slate-100">Dr. Poonam Bhutada</p>
                <p className="text-slate-400">Family Physician and Consulting Gynaecologist</p>
                <p className="text-[11px] text-teal-400 font-medium">B.A.M.S., D.Y.A. (Ayu.) • 20 Years Exp.</p>
              </div>
            </div>
          </div>

          {/* Col 3: Address & Phone */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hospital Location</h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  213/26, Ram Mandir Temple Lane, Damodar Nagar Road, near Rokdoba Temple,
                  Hingne Khurd, Pune, Maharashtra 411051
                </span>
              </p>
              <p className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="font-mono font-bold text-white hover:text-sky-300"
                >
                  {settings.phone}
                </a>
              </p>
              <p className="flex items-center gap-2 pt-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Mon – Sat: 10:00 AM – 1:30 PM & 5:30 PM – 8:30 PM</span>
              </p>
            </div>
          </div>

          {/* Col 4: Quick Actions & Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Presentation Actions</h4>
            <div className="space-y-2">
              <button
                onClick={onBookClick}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Schedule Consultation (Demo)
              </button>

              <button
                onClick={onAdminClick}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Staff Dashboard Preview</span>
              </button>

              <button
                onClick={() => setShowPrivacyModal(true)}
                className="w-full text-center py-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Patient Data Privacy Notice
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Aashirwad Hospital, Hingne Khurd, Pune. Client presentation preview.</p>
          <div className="flex items-center gap-4">
            <span className="text-amber-400 font-semibold">• Interactive Demonstration Mode</span>
            <span>•</span>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-slate-300 cursor-pointer"
            >
              Privacy & Notice
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Patient Privacy & Demonstration Notice</h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed max-h-80 overflow-y-auto">
              <p>
                <strong>1. Demonstration Architecture:</strong> This version operates in presentation demonstration mode. Submissions are processed in-memory and are not delivered to external servers.
              </p>
              <p>
                <strong>2. Data Minimization:</strong> When patient appointment booking is launched into production, Aashirwad Hospital will only require patient name and contact phone number. We strictly never store symptoms, diagnoses, or Aadhaar numbers online.
              </p>
              <p>
                <strong>3. Production Security:</strong> For live deployment, Firebase Authentication and Firestore Security Rules will govern staff access and prevent unauthorized appointment inspection.
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
