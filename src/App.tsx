import React, { useState, useEffect } from 'react';
import { hospitalService } from './services/hospitalService';
import type { SiteSettings, Doctor, Service } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DoctorsSection } from './components/DoctorsSection';
import { DoctorDetailModal } from './components/DoctorDetailModal';
import { ServicesSection } from './components/ServicesSection';
import { BookingWizard } from './components/BookingWizard';
import { BookingLookupModal } from './components/BookingLookupModal';
import { ContactSection } from './components/ContactSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Dashboard Preview Toggle
  const [isAdminView, setIsAdminView] = useState(false);

  // Modals & Navigation
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupInitialRef, setLookupInitialRef] = useState('DEMO-ASH-84920');
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<Doctor | null>(null);

  // Booking Wizard Prefills
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string>('');
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    // Check if initial URL or hash points to #admin
    if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
      setIsAdminView(true);
    }

    // Load verified hospital info and doctors from service layer
    Promise.all([
      hospitalService.getHospitalInfo(),
      hospitalService.getDoctors(),
      hospitalService.getPublicServices(),
    ])
      .then(([info, docs, srvs]) => {
        setSettings(info);
        setDoctors(docs);
        setServices(srvs);
      })
      .catch((err) => console.error('Failed to initialize hospital presentation data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleScrollToBooking = (doctorId?: string) => {
    if (doctorId) setPreselectedDoctorId(doctorId);

    if (isAdminView) {
      setIsAdminView(false);
      setTimeout(() => {
        const el = document.getElementById('booking');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminToggle = () => {
    setIsAdminView(!isAdminView);
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md animate-pulse">
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v20M2 12h20" strokeWidth="3" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800">Aashirwad Hospital</h2>
          <p className="text-xs text-slate-500">Preparing hospital demonstration portal...</p>
        </div>
      </div>
    );
  }

  // If in Staff Dashboard Preview Mode
  if (isAdminView) {
    return (
      <AdminDashboard
        onExitAdmin={() => setIsAdminView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <Header
        settings={settings}
        onBookClick={() => handleScrollToBooking()}
        onLookupClick={() => setShowLookupModal(true)}
        onAdminToggle={handleAdminToggle}
        isAdminOpen={isAdminView}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          settings={settings}
          onBookClick={() => handleScrollToBooking()}
          onExploreDoctors={() => {
            const el = document.getElementById('doctors');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* About Section */}
        <AboutSection settings={settings} />

        {/* Doctors Section */}
        <DoctorsSection
          doctors={doctors}
          onSelectDoctorToBook={(docId) => handleScrollToBooking(docId)}
          onViewDoctorDetails={(doc) => setSelectedDoctorForModal(doc)}
        />

        {/* Services Directory Section (Shows verified coming soon notice) */}
        <ServicesSection
          services={services}
          doctors={doctors}
          onBookClick={() => handleScrollToBooking()}
        />

        {/* Booking Wizard Section (Interactive Demo Mode) */}
        <BookingWizard
          doctors={doctors}
          preselectedDoctorId={preselectedDoctorId}
          onBookingComplete={(ref) => {
            setLookupInitialRef(ref);
          }}
        />

        {/* Contact and Location Section */}
        <ContactSection settings={settings} />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onBookClick={() => handleScrollToBooking()}
        onAdminClick={handleAdminToggle}
      />

      {/* Doctor Detail Modal */}
      <DoctorDetailModal
        doctor={selectedDoctorForModal}
        onClose={() => setSelectedDoctorForModal(null)}
        onBookDoctor={(docId) => handleScrollToBooking(docId)}
      />

      {/* Patient Lookup & Cancel Demo Modal */}
      <BookingLookupModal
        isOpen={showLookupModal}
        onClose={() => setShowLookupModal(false)}
        initialReference={lookupInitialRef}
      />
    </div>
  );
}
