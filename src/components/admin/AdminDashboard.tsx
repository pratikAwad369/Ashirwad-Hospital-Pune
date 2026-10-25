import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Settings,
  Shield,
  ExternalLink,
  Clock,
  HeartPulse,
  Mail,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Info,
  Sparkles,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Save,
  Phone,
  FileText,
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import type {
  AdminMetrics,
  Doctor,
  Appointment,
  AppointmentStatus,
  Service,
  ContactMessage,
  WeeklySchedule,
  ScheduleException,
} from '../../types';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'appointments' | 'doctors' | 'services' | 'settings' | 'messages'
  >('overview');

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Appointments Filter State
  const [search, setSearch] = useState('');
  const [filterDocId, setFilterDocId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Doctor Schedule & Exception State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [newExDate, setNewExDate] = useState('');
  const [newExReason, setNewExReason] = useState('');

  // Notes Modal
  const [activeNotesApt, setActiveNotesApt] = useState<Appointment | null>(null);
  const [notesInput, setNotesInput] = useState('');

  const refreshData = async () => {
    const [m, docs, appts, srvs, msgs] = await Promise.all([
      hospitalService.getAdminMetrics(),
      hospitalService.getAllDoctors(),
      hospitalService.getAdminAppointments({
        doctorId: filterDocId || undefined,
        status: (filterStatus as AppointmentStatus) || undefined,
        search: search.trim() || undefined,
      }),
      hospitalService.getAdminServices(),
      hospitalService.getContactMessages(),
    ]);

    setMetrics(m);
    setDoctors(docs);
    setAppointments(appts);
    setServices(srvs);
    setMessages(msgs);

    if (!selectedDoctorId && docs.length > 0) {
      setSelectedDoctorId(docs[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab, filterDocId, filterStatus, search]);

  useEffect(() => {
    if (selectedDoctorId) {
      hospitalService.getDoctorSchedule(selectedDoctorId).then((res) => {
        if (res.schedule) setSchedule(res.schedule);
        setExceptions(res.exceptions);
      });
    }
  }, [selectedDoctorId]);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    await hospitalService.updateAppointmentStatus(id, newStatus);
    refreshData();
  };

  const handleSaveNotes = async () => {
    if (!activeNotesApt) return;
    await hospitalService.updateAppointmentNotes(activeNotesApt.id, notesInput);
    setActiveNotesApt(null);
    refreshData();
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !newExDate) return;
    await hospitalService.addScheduleException(selectedDoctorId, {
      date: newExDate,
      isDayOff: true,
      reason: newExReason || 'Holiday / Leave',
    });
    setNewExDate('');
    setNewExReason('');
    const res = await hospitalService.getDoctorSchedule(selectedDoctorId);
    setExceptions(res.exceptions);
  };

  const handleDeleteException = async (id: string) => {
    await hospitalService.deleteScheduleException(id);
    if (selectedDoctorId) {
      const res = await hospitalService.getDoctorSchedule(selectedDoctorId);
      setExceptions(res.exceptions);
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const navItems = [
    { id: 'overview', label: 'Operations Overview', icon: TrendingUp },
    { id: 'appointments', label: 'Appointments Desk', icon: Calendar },
    { id: 'doctors', label: 'Doctors & Schedules', icon: Users },
    { id: 'services', label: 'Services Catalog', icon: HeartPulse },
    { id: 'settings', label: 'Hospital Settings', icon: Settings },
    { id: 'messages', label: 'Inquiries', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top Banner indicating demonstration mode */}
      <div className="bg-amber-600 text-white text-xs py-2 px-4 text-center font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        <span>
          Hospital Staff Dashboard Demonstration — Sample Fictional Data. Authentication & Cloud Firestore will be connected for production.
        </span>
      </div>

      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center font-bold text-white shadow-xs">
              A
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Aashirwad Hospital
              </span>
              <span className="ml-2 text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 uppercase">
                Staff Preview
              </span>
            </div>
          </div>

          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950/80 border-t border-slate-800 px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-1 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="bg-gradient-to-r from-sky-800 to-sky-950 text-white p-6 sm:p-7 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">OPD Management Console (Demo Preview)</h2>
                <p className="text-xs text-sky-200 mt-1">
                  Today's OPD Schedule (Asia/Kolkata) • Fictional Demonstration Records
                </p>
              </div>
              <button
                onClick={() => setActiveTab('appointments')}
                className="px-4 py-2 rounded-xl bg-white text-sky-950 text-xs font-bold shadow-xs hover:bg-sky-50 transition-colors cursor-pointer"
              >
                View All Appointments →
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's OPD</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{metrics?.todayCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">Sample bookings</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming</span>
                <p className="text-2xl font-black text-sky-600 mt-1">{metrics?.upcomingCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">Future scheduled</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirmed</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{metrics?.confirmedCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">Ready for doctor</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
                <p className="text-2xl font-black text-amber-500 mt-1">{metrics?.pendingCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">To be confirmed</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
                <p className="text-2xl font-black text-purple-600 mt-1">{metrics?.completedCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">Consulted</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cancelled</span>
                <p className="text-2xl font-black text-rose-600 mt-1">{metrics?.cancelledCount ?? 0}</p>
                <span className="text-[10px] text-slate-500">Cancelled</span>
              </div>
            </div>

            {/* Doctor Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Physician Outpatient Distribution
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {metrics?.doctorBreakdown.map((doc) => (
                  <div key={doc.doctorId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center font-bold text-sm">
                          {doc.doctorName.split(' ')[1]?.[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{doc.doctorName}</h4>
                          <span className="text-xs text-slate-500">Consulting Physician</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        {doc.total} Sample Appts
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Today</span>
                        <span className="text-sm font-black text-slate-900">{doc.today}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Confirmed</span>
                        <span className="text-sm font-black text-emerald-600">{doc.confirmed}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Completed</span>
                        <span className="text-sm font-black text-purple-600">{doc.completed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPOINTMENTS DESK */}
        {activeTab === 'appointments' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filter bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Filter by Patient Name, Phone, or Code (DEMO-ASH-...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <select
                value={filterDocId}
                onChange={(e) => setFilterDocId(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50"
              >
                <option value="">All Physicians</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50"
              >
                <option value="">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Demo Ref & Patient</th>
                      <th className="py-3 px-4">Physician</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Staff Notes</th>
                      <th className="py-3 px-4 text-right">Interactive Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 space-y-0.5">
                          <span className="font-mono font-bold text-sky-800 block text-[11px]">
                            {apt.bookingReference}
                          </span>
                          <span className="font-semibold text-slate-900 block text-xs">{apt.patientName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{apt.patientPhone}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 block">{apt.doctorName}</span>
                          <span className="text-[10px] text-slate-400 block">{apt.serviceName}</span>
                        </td>

                        <td className="py-3 px-4 space-y-0.5">
                          <span className="font-semibold text-slate-900 block">{apt.appointmentDate}</span>
                          <span className="text-slate-500 text-[10px] block">{apt.startTime} IST</span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                              apt.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : apt.status === 'Completed'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : apt.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          {apt.internalNotes ? (
                            <div
                              onClick={() => {
                                setActiveNotesApt(apt);
                                setNotesInput(apt.internalNotes || '');
                              }}
                              className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px] cursor-pointer hover:bg-slate-100"
                              title="Click to edit notes"
                            >
                              {apt.internalNotes}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveNotesApt(apt);
                                setNotesInput('');
                              }}
                              className="text-[11px] text-slate-400 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>+ Note</span>
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <select
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                            className="p-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-800 bg-white"
                          >
                            <option value="Confirmed">Set Confirmed</option>
                            <option value="Completed">Set Completed</option>
                            <option value="Pending">Set Pending</option>
                            <option value="Cancelled">Set Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOCTORS & SCHEDULES */}
        {activeTab === 'doctors' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Physician Schedule & Holiday Management</h3>
                <p className="text-xs text-slate-500">
                  Select a doctor to view their weekly morning & evening OPD shift configuration.
                </p>
              </div>

              <div className="flex gap-2">
                {doctors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDoctorId(d.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDoctorId === d.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d.name.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Shifts list */}
            {schedule && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Weekly Consultation Timings
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {schedule.days.map((day) => (
                    <div key={day.dayOfWeek} className="p-3 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 w-32">{dayNames[day.dayOfWeek]}</span>
                      <div>
                        {day.isWorkingDay ? (
                          <div className="flex gap-2">
                            {day.shifts.map((s, idx) => (
                              <span
                                key={idx}
                                className="bg-sky-50 text-sky-800 border border-sky-100 px-2 py-0.5 rounded text-[11px] font-medium"
                              >
                                {s.startTime} – {s.endTime}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Hospital OPD Closed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Holiday exceptions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Holiday & Doctor Leave Overrides
              </h4>
              <form onSubmit={handleAddException} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  required
                  value={newExDate}
                  onChange={(e) => setNewExDate(e.target.value)}
                  className="p-2 rounded-lg border border-slate-200 text-xs font-medium"
                />
                <input
                  type="text"
                  required
                  placeholder="Holiday reason (e.g. Festival Closure)"
                  value={newExReason}
                  onChange={(e) => setNewExReason(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-xs font-medium"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
                >
                  Add Holiday
                </button>
              </form>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {exceptions.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No holiday exceptions added.</div>
                ) : (
                  exceptions.map((ex) => (
                    <div key={ex.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{ex.date}</span>
                        <span className="text-slate-600">{ex.reason}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteException(ex.id)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES CATALOG */}
        {activeTab === 'services' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900">Medical Services Catalog Preview</h3>
              <p className="text-xs text-slate-500">
                Hospital staff can define, review, and confirm clinical services here before publishing them to the public website.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((srv) => (
                <div key={srv.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded uppercase">
                      {srv.category}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Draft (Unpublished)
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{srv.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{srv.description}</p>
                  <p className="text-[11px] text-slate-400">Duration: ~{srv.durationMinutes} mins</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Hospital Operational Configuration (Preview)</h3>
            <p className="text-slate-500">
              Verified clinical metadata displayed across patient-facing pages.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Hospital Name</span>
                <span className="font-semibold text-slate-900 text-sm">Aashirwad Hospital</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Public Telephone</span>
                <span className="font-semibold text-slate-900 text-sm font-mono">+91 9822333770</span>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Physical Address</span>
                <span className="font-semibold text-slate-900 text-xs">
                  213/26, Ram Mandir Temple Lane, Damodar Nagar Road, near Rokdoba Temple, Hingne Khurd, Pune 411051
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: INQUIRIES */}
        {activeTab === 'messages' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Patient Contact Inquiries (Demo Records)
              </h3>
            </div>

            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{msg.name}</span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sky-700 font-mono font-medium">{msg.phone}</div>
                  <p className="font-bold text-slate-800">{msg.subject}</p>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Staff Notes Modal */}
      {activeNotesApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Internal Staff Notes</h4>
              <button onClick={() => setActiveNotesApt(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Patient: <strong className="text-slate-800">{activeNotesApt.patientName}</strong> ({activeNotesApt.bookingReference})
            </p>
            <textarea
              rows={4}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Enter private internal note..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveNotesApt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
