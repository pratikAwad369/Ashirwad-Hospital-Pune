import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Info,
} from 'lucide-react';
import { hospitalService } from '../services/hospitalService';
import type { SiteSettings } from '../types';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [demoNotice, setDemoNotice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setDemoNotice('');

    try {
      await hospitalService.submitContactMessage({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });

      setDemoNotice(
        `Thank you, ${name.trim()}! In this demonstration mode, your message has been simulated and added to the Staff Dashboard preview. In production, this form will deliver inquiries to the hospital desk.`
      );
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold uppercase tracking-wider border border-sky-100">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Hospital Location & Direct Helpdesk</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Reach Aashirwad Hospital
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Conveniently situated in Damodar Nagar, Hingne Khurd, Pune. We are here to assist with
            family healthcare, OPD schedule questions, and directions.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
          {/* Hospital Address & Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Address Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Hospital Address</h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    213/26, Ram Mandir Temple Lane, Damodar Nagar Road, near Rokdoba Temple,
                    Hingne Khurd, Pune, Maharashtra 411051, India
                  </p>
                  <p className="text-xs font-semibold text-sky-800 pt-1">
                    Landmark: Near Rokdoba Temple, Ram Mandir Temple Lane
                  </p>
                </div>
              </div>

              {/* Google Maps Search/Directions Link */}
              <div className="pt-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Aashirwad+Hospital+Damodar+Nagar+Hingne+Khurd+Pune+411051"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-100/70 hover:bg-sky-100 py-2.5 px-4 rounded-xl transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Directions on Google Maps</span>
                </a>
              </div>
            </div>

            {/* Telephone & OPD Hours */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">Telephone Contact</h4>
                  <p className="text-xs text-slate-500">Reception and patient inquiries:</p>
                  <a
                    href="tel:+919822333770"
                    className="inline-block text-lg font-extrabold text-slate-900 hover:text-sky-700 font-mono"
                  >
                    +91 9822333770
                  </a>
                </div>
              </div>

              {/* Consultation Hours */}
              <div className="pt-3 border-t border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
                <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">OPD Consultation Hours:</span>
                  <p className="text-slate-600 mt-0.5">
                    Monday to Saturday: Morning 10:00 AM – 1:30 PM & Evening 5:30 PM – 8:30 PM
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">* Sunday closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form Demo */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-lg shadow-sky-950/5 p-6 sm:p-8">
            <div className="space-y-1 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Hospital Inquiry Form</h3>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Demo Preview
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Test the client inquiry experience. Submissions will populate the administrative demonstration panel.
              </p>
            </div>

            {demoNotice && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{demoNotice}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Mobile / Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="sample.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Question about diabetic consultation"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can our clinical team assist you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry (Demo)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
