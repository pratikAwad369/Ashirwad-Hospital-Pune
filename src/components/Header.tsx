import React, { useState } from 'react';
import {
  Phone,
  Clock,
  MapPin,
  CalendarCheck,
  Search,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import type { SiteSettings } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  onBookClick: () => void;
  onLookupClick: () => void;
  onAdminToggle: () => void;
  isAdminOpen: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onBookClick,
  onLookupClick,
  onAdminToggle,
  isAdminOpen,
  activeSection,
  setActiveSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'services', label: 'Services' },
    { id: 'booking', label: 'Book Appointment' },
    { id: 'contact', label: 'Location & Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    if (id === 'booking') {
      onBookClick();
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-sky-100">
      {/* Top Clinical & Demonstration Utility Bar */}
      <div className="bg-sky-900 text-sky-100 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-sky-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
              title="Call Aashirwad Hospital"
            >
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium tracking-wide">{settings.phone}</span>
            </a>
            <span className="hidden md:inline-flex items-center gap-1.5 text-sky-200">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>Hingne Khurd, Pune 411051</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-sky-200">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Mon – Sat: 10:00 AM – 1:30 PM & 5:30 PM – 8:30 PM</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-800/80 px-2 py-0.5 rounded-sm">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Client Demo Preview</span>
            </span>

            <button
              onClick={onLookupClick}
              className="inline-flex items-center gap-1 text-sky-200 hover:text-white text-xs py-0.5 px-2 rounded-sm bg-sky-800/80 hover:bg-sky-800 transition-colors cursor-pointer"
            >
              <Search className="w-3 h-3 text-sky-300" />
              <span>Lookup Demo</span>
            </button>

            <button
              onClick={onAdminToggle}
              className={`inline-flex items-center gap-1 text-xs py-0.5 px-2.5 rounded-sm transition-colors cursor-pointer ${
                isAdminOpen
                  ? 'bg-amber-400 text-slate-900 font-bold shadow-xs'
                  : 'bg-sky-950/80 text-sky-200 hover:text-white hover:bg-sky-950'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Staff Dashboard Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Hospital Branding */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Hospital Emblem */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-700 via-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform duration-200">
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M2 12h20" strokeWidth="3" />
                <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeOpacity="0.7" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Aashirwad
                </span>
                <span className="text-xl sm:text-2xl font-light tracking-tight text-sky-700">
                  Hospital
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 tracking-wide flex items-center gap-1">
                <span>Hingne Khurd, Pune</span>
                <span className="text-sky-300">•</span>
                <span className="text-sky-700 font-medium italic">"Your Health, Our Priority"</span>
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === link.id
                    ? 'text-sky-700 bg-sky-50 font-semibold'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Primary CTA & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBookClick}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-medium text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 transition-all duration-200 cursor-pointer active:scale-98"
            >
              <CalendarCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Book Appointment (Demo)</span>
              <span className="sm:hidden">Book Demo</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLookupClick();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              <Search className="w-4 h-4 text-sky-600" />
              Lookup Booking Demo
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onAdminToggle();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-sky-800 bg-sky-50 rounded-lg hover:bg-sky-100"
            >
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Staff Dashboard Preview
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
