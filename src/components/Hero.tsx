import React from 'react';
import {
  CalendarCheck,
  Award,
  ShieldCheck,
  MapPin,
  Clock,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  HeartPulse,
} from 'lucide-react';
import type { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onBookClick: () => void;
  onExploreDoctors: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onBookClick,
  onExploreDoctors,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-sky-100">
      {/* Decorative Subtle Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-100/50 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100/90 border border-sky-200 text-sky-800 text-xs sm:text-sm font-semibold tracking-wide">
              <span className="flex h-2 w-2 rounded-full bg-sky-600 animate-pulse" />
              <span>Hingne Khurd, Pune • Trusted Community Healthcare</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Experienced Family Care & Specialized Consultations
            </h1>

            {/* Slogan & Verified Mission */}
            <div className="space-y-3">
              <p className="text-lg sm:text-xl font-medium text-sky-700 italic">
                "{settings.slogan || 'Your Health, Our Priority.'}"
              </p>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Welcome to <strong className="text-slate-900">Aashirwad Hospital</strong> in Damodar Nagar, Hingne Khurd.
                Led by <span className="text-slate-800 font-semibold">Dr. Nandkumar Bhutada</span> (22 yrs exp.) and{' '}
                <span className="text-slate-800 font-semibold">Dr. Poonam Bhutada</span> (20 yrs exp.), providing
                thorough primary healthcare, dedicated diabetology care, maternal and gynaecological guidance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onBookClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-base px-6 py-3.5 rounded-xl shadow-lg shadow-sky-600/25 hover:shadow-xl hover:shadow-sky-600/35 transition-all duration-200 cursor-pointer active:scale-98"
              >
                <CalendarCheck className="w-5 h-5" />
                <span>Book Doctor Appointment</span>
              </button>

              <button
                onClick={onExploreDoctors}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base px-6 py-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-300 transition-colors cursor-pointer"
              >
                <UserCheck className="w-5 h-5 text-sky-600" />
                <span>View Doctor Profiles</span>
              </button>
            </div>

            {/* Verified Clinical Guarantees */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="flex items-start gap-2.5 bg-white/80 p-3 rounded-xl border border-slate-100 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Verified Doctors</h4>
                  <p className="text-xs text-slate-500">20+ & 22+ years of senior clinical experience</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/80 p-3 rounded-xl border border-slate-100 shadow-2xs">
                <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Slots</h4>
                  <p className="text-xs text-slate-500">Real-time scheduling with atomic conflict check</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/80 p-3 rounded-xl border border-slate-100 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Patient Privacy</h4>
                  <p className="text-xs text-slate-500">No medical data or Aadhaar required for booking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info & Verified Card Column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl shadow-sky-900/5 border border-sky-100 p-6 sm:p-8 space-y-6 relative">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Hospital Consultation Desk</h3>
                    <p className="text-xs text-slate-500">Hingne Khurd, Pune 411051</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Booking Open
                </span>
              </div>

              {/* Verified Doctors Mini-List */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Dr. Nandkumar Bhutada</span>
                      <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-sm font-semibold">22 yrs</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Family Physician & Diabetologist</p>
                    <p className="text-[11px] text-slate-400">M.D. (Diet) (Ayu.)</p>
                  </div>
                  <button
                    onClick={onBookClick}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  >
                    Select →
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Dr. Poonam Bhutada</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-sm font-semibold">20 yrs</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Family Physician & Gynaecologist</p>
                    <p className="text-[11px] text-slate-400">B.A.M.S., D.Y.A. (Ayu.)</p>
                  </div>
                  <button
                    onClick={onBookClick}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  >
                    Select →
                  </button>
                </div>
              </div>

              {/* Consultation Timings Summary */}
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-sky-900 font-semibold">
                  <Clock className="w-4 h-4 text-sky-700" />
                  <span>Standard Consultation Shifts</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div>
                    <span className="font-medium text-slate-900">Morning Session:</span>
                    <p className="text-slate-600">10:00 AM – 1:30 PM</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Evening Session:</span>
                    <p className="text-slate-600">5:30 PM – 8:30 PM</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-sky-100">
                  * Sunday consultations are closed. Please book an available weekday slot.
                </p>
              </div>

              {/* Direct Call & Address Link */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                  <span>Call Hospital</span>
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Aashirwad+Hospital+Damodar+Nagar+Hingne+Khurd+Pune+411051"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Directions Link</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
