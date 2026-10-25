import React, { useState, useEffect } from 'react';
import {
  Save,
  Building,
  Phone,
  Clock,
  Shield,
  Mail,
  Bell,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../api';
import type { SiteSettings } from '../../types';

export const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .getAdminSettings()
      .then((res) => setSettings(res.settings))
      .catch((err) => console.error('Failed to load settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await api.saveAdminSettings(settings);
      setSettings(res.settings);
      setMessage('Hospital settings successfully updated and saved!');
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading hospital settings...</div>;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Hospital Configuration & Operational Settings</h3>
          <p className="text-xs text-slate-500">
            Control verified contact numbers, address, consultation policy notices, and external notification settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Basic Hospital Identity */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-xs">
            <Building className="w-4 h-4 text-sky-600" />
            <span>Hospital Name & Public Slogan</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hospital Name
              </label>
              <input
                type="text"
                value={settings.hospitalName}
                onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={settings.slogan}
                onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Address & Phone */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-xs">
            <Phone className="w-4 h-4 text-sky-600" />
            <span>Verified Address & Contact Phone</span>
          </h4>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Complete Postal Address
            </label>
            <textarea
              rows={2}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Contact Telephone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Hospital Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Consultation Hours Note & Cancellation Policy */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Consultation Timings Note & Cancellation Rules</span>
          </h4>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Public Consultation Hours Text
            </label>
            <input
              type="text"
              value={settings.consultationHoursNote}
              onChange={(e) => setSettings({ ...settings, consultationHoursNote: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
            />
          </div>

          <div className="w-full sm:w-1/2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Minimum Cancellation Notice (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={48}
              value={settings.cancellationNoticeHours}
              onChange={(e) =>
                setSettings({ ...settings, cancellationNoticeHours: parseInt(e.target.value) || 2 })
              }
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Appointments scheduled within this window cannot be cancelled online by patients.
            </p>
          </div>
        </div>

        {/* Notification Providers Status */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-xs">
            <Bell className="w-4 h-4 text-sky-600" />
            <span>Notification Service & Provider Credentials</span>
          </h4>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Development Outbox & Console Logger</span>
                <span className="text-slate-500 text-[11px]">
                  Masked notifications are logged safely to the console during development.
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                Always Active
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block">Resend Transactional Email Provider</span>
                <span className="text-slate-500 text-[11px]">
                  Requires <code className="font-mono text-sky-700">RESEND_API_KEY</code> in environment variables.
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                  process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'MY_RESEND_API_KEY'
                    ? 'text-emerald-700 bg-emerald-100'
                    : 'text-slate-500 bg-slate-200'
                }`}
              >
                {process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'MY_RESEND_API_KEY'
                  ? 'Configured'
                  : 'Disabled (Awaiting Key)'}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
