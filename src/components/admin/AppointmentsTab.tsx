import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  FileText,
  History,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Phone,
} from 'lucide-react';
import { api } from '../../api';
import type { Appointment, AppointmentStatus, Doctor, AppointmentStatusHistory } from '../../types';

interface AppointmentsTabProps {
  doctors: Doctor[];
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ doctors }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals
  const [selectedAppointmentForNotes, setSelectedAppointmentForNotes] = useState<Appointment | null>(null);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const [historyAppointment, setHistoryAppointment] = useState<Appointment | null>(null);
  const [statusHistory, setStatusHistory] = useState<AppointmentStatusHistory[]>([]);

  const fetchAppointments = () => {
    setLoading(true);
    api
      .getAdminAppointments({
        page,
        limit: 15,
        doctorId: selectedDoctorId || undefined,
        status: (selectedStatus as AppointmentStatus) || undefined,
        date: selectedDate || undefined,
        search: search.trim() || undefined,
      })
      .then((res) => {
        setAppointments(res.appointments || []);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err) => console.error('Failed to load appointments:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, selectedDoctorId, selectedStatus, selectedDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await api.updateAppointmentStatus(appointmentId, newStatus);
      fetchAppointments();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointmentForNotes) return;
    setSavingNotes(true);
    try {
      await api.updateAppointmentNotes(selectedAppointmentForNotes.id, notesText);
      setSelectedAppointmentForNotes(null);
      fetchAppointments();
    } catch (err: any) {
      alert(`Error saving internal notes: ${err.message}`);
    } finally {
      setSavingNotes(false);
    }
  };

  const openNotesModal = (apt: Appointment) => {
    setSelectedAppointmentForNotes(apt);
    setNotesText(apt.internalNotes || '');
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Completed':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Rescheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'No-show':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Patient Name, Phone, Reference (ASH-...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Search
          </button>

          <a
            href={api.exportAppointmentsCsvUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50"
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50"
            >
              <option value="">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="No-show">No-show</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref & Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Internal Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No appointments found matching current filters.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Patient & Ref */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <span className="font-mono font-bold text-sky-800 block">
                        {apt.bookingReference}
                      </span>
                      <span className="font-semibold text-slate-900 block text-xs">
                        {apt.patientName}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {apt.patientPhone}
                      </span>
                    </td>

                    {/* Doctor */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{apt.doctorName}</span>
                      {apt.serviceName && (
                        <span className="text-[10px] text-slate-400 block">{apt.serviceName}</span>
                      )}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <span className="font-semibold text-slate-900 block">{apt.appointmentDate}</span>
                      <span className="text-slate-500 text-[11px] block">
                        {apt.startTime} – {apt.endTime} IST
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] border ${getStatusBadge(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                    </td>

                    {/* Internal Notes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {apt.internalNotes ? (
                        <div
                          onClick={() => openNotesModal(apt)}
                          className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-900 text-[11px] line-clamp-2 cursor-pointer hover:bg-amber-100/70"
                          title="Click to edit internal notes"
                        >
                          {apt.internalNotes}
                        </div>
                      ) : (
                        <button
                          onClick={() => openNotesModal(apt)}
                          className="text-[11px] text-slate-400 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>+ Add Note</span>
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                        className="p-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-800 bg-white"
                      >
                        <option value="Confirmed">Confirm</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Rescheduled">Reschedule</option>
                        <option value="Cancelled">Cancel</option>
                        <option value="No-show">No-Show</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Total: <strong>{total}</strong> appointments
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {page} of {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Internal Notes Modal */}
      {selectedAppointmentForNotes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                Internal Administrative Notes (Private)
              </h4>
              <button
                onClick={() => setSelectedAppointmentForNotes(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              For: <strong className="text-slate-800">{selectedAppointmentForNotes.patientName}</strong> (
              {selectedAppointmentForNotes.bookingReference})
              <br />
              * These notes are strictly internal and are never visible to the patient.
            </p>

            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="e.g. Follow-up required, confirmed over phone call, requested morning OPD slot"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-600 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedAppointmentForNotes(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={savingNotes}
                onClick={handleSaveNotes}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
