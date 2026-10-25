import React from 'react';
import {
  HeartPulse,
  ShieldCheck,
  CalendarCheck,
  Clock,
  Sparkles,
  PhoneCall,
  Stethoscope,
  Info,
} from 'lucide-react';
import type { Service, Doctor } from '../types';

interface ServicesSectionProps {
  services: Service[];
  doctors: Doctor[];
  onBookClick: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  doctors,
  onBookClick,
}) => {
  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
            <span>Clinical Services Directory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hospital Medical Services
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            In accordance with our strict medical verification policy, clinical services are published
            only after official hospital confirmation.
          </p>
        </div>

        {/* Empty / Unverified Status Notice Card */}
        <div className="mt-12 max-w-3xl mx-auto bg-white rounded-3xl border border-sky-100 shadow-md p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
            <Stethoscope className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/70">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>Hospital Verification In Progress</span>
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Our clinical services will be listed here soon
            </h3>

            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Aashirwad Hospital does not list speculative medical treatments or diagnostic claims.
              Detailed consultation categories, diet regimens, and wellness packages will be published
              once administrative review is finalized.
            </p>
          </div>

          {/* OPD Direct Consultation Callout */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 max-w-lg mx-auto text-xs text-slate-700 flex items-start gap-3 text-left">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Direct Doctor Consultations Available</p>
              <p className="text-slate-500 mt-0.5">
                Patients may book a direct outpatient consultation with Dr. Nandkumar Bhutada (Diabetology & Family Care)
                or Dr. Poonam Bhutada (Gynaecology & Family Medicine).
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onBookClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Schedule Doctor Consultation (Demo)</span>
            </button>

            <a
              href="tel:+919822333770"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Call +91 9822333770</span>
            </a>
          </div>
        </div>

        {/* Clinical Integrity Guarantee */}
        <div className="mt-10 max-w-3xl mx-auto flex items-center justify-between text-xs text-slate-500 px-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ethical Medical Information Standards</span>
          </span>
          <span>Aashirwad Hospital, Hingne Khurd, Pune 411051</span>
        </div>
      </div>
    </section>
  );
};
