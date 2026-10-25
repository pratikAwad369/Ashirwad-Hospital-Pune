import React from 'react';
import {
  Heart,
  ShieldCheck,
  CheckCircle,
  Users,
  Building,
  Activity,
  Award,
} from 'lucide-react';
import type { SiteSettings } from '../types';

interface AboutSectionProps {
  settings: SiteSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  return (
    <section id="about" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold uppercase tracking-wider border border-sky-100">
            <Heart className="w-3.5 h-3.5 text-sky-600" />
            <span>About Aashirwad Hospital</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Compassionate, Grounded Healthcare in Hingne Khurd
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            "{settings.slogan}" — A community medical practice dedicated to reliable family care,
            diabetology, and personalized wellness for individuals and families in Pune.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Family-Centered Care</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We believe in long-term doctor-patient relationships. Our consultations prioritize patient listening,
              careful examination, and family-tailored healthcare guidance.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Diabetology & Metabolic Health</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              With over 22 years of experience by Dr. Nandkumar Bhutada, M.D. (Diet) (Ayu.), we focus on
              evidence-based lifestyle modification, nutritional counseling, and blood glucose control.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Women’s Health & Family Medicine</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dr. Poonam Bhutada, B.A.M.S., D.Y.A. (Ayu.), provides 20 years of clinical practice in women’s wellness,
              gynaecological consultations, and holistic wellness support.
            </p>
          </div>
        </div>

        {/* Medical Integrity Notice */}
        <div className="mt-12 bg-sky-50/70 border border-sky-100 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-bold text-slate-900 text-base">Verified Hospital Information Policy</h4>
            <p className="text-xs text-slate-600 max-w-2xl">
              Aashirwad Hospital values ethical medical transparency. We publish only verified doctor qualifications,
              authorized experience records, and confirmed consultation hours. We never invent arbitrary awards or inflated claims.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-xs font-bold text-sky-800 shadow-2xs border border-sky-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified Practice Standards</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
