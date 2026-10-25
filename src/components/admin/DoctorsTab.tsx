import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  Shield,
} from 'lucide-react';
import { api } from '../../api';
import type { Doctor, WeeklySchedule, ScheduleException, TimeShift } from '../../types';

interface DoctorsTabProps {
  doctors: Doctor[];
  onRefreshDoctors: () => void;
}

export const DoctorsTab: React.FC<DoctorsTabProps> = ({
  doctors,
  onRefreshDoctors,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || '');
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // New Exception form
  const [newExDate, setNewExDate] = useState('');
  const [newExReason, setNewExReason] = useState('');
  const [newExIsDayOff, setNewExIsDayOff] = useState(true);

  // Doctor Edit Modal
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [savingDoctor, setSavingDoctor] = useState(false);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchScheduleAndExceptions = (doctorId: string) => {
    if (!doctorId) return;
    setLoadingSchedule(true);
    api
      .getDoctorSchedule(doctorId)
      .then((res) => {
        if (res.weekly) setSchedule(res.weekly);
        setExceptions(res.exceptions || []);
      })
      .catch((err) => console.error('Error fetching doctor schedule:', err))
      .finally(() => setLoadingSchedule(false));
  };

  useEffect(() => {
    if (selectedDoctorId) {
      fetchScheduleAndExceptions(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  const handleToggleWorkingDay = (dayIndex: number) => {
    if (!schedule) return;
    const updatedDays = [...schedule.days];
    updatedDays[dayIndex].isWorkingDay = !updatedDays[dayIndex].isWorkingDay;
    if (updatedDays[dayIndex].isWorkingDay && updatedDays[dayIndex].shifts.length === 0) {
      updatedDays[dayIndex].shifts = [
        { startTime: '10:00', endTime: '13:00' },
        { startTime: '17:30', endTime: '20:30' },
      ];
    }
    setSchedule({ ...schedule, days: updatedDays });
  };

  const handleUpdateShift = (dayIndex: number, shiftIndex: number, field: 'startTime' | 'endTime', value: string) => {
    if (!schedule) return;
    const updatedDays = [...schedule.days];
    updatedDays[dayIndex].shifts[shiftIndex][field] = value;
    setSchedule({ ...schedule, days: updatedDays });
  };

  const handleSaveSchedule = async () => {
    if (!schedule || !selectedDoctorId) return;
    setSavingSchedule(true);
    try {
      await api.saveDoctorSchedule(selectedDoctorId, schedule.days);
      alert('Consultation schedule successfully updated!');
    } catch (err: any) {
      alert(`Error saving schedule: ${err.message}`);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExDate || !selectedDoctorId) return;

    try {
      await api.addScheduleException(selectedDoctorId, {
        date: newExDate,
        isDayOff: newExIsDayOff,
        reason: newExReason || 'Holiday / Unavailable',
      });
      setNewExDate('');
      setNewExReason('');
      fetchScheduleAndExceptions(selectedDoctorId);
    } catch (err: any) {
      alert(`Error adding exception: ${err.message}`);
    }
  };

  const handleDeleteException = async (id: string) => {
    try {
      await api.deleteScheduleException(id);
      fetchScheduleAndExceptions(selectedDoctorId);
    } catch (err: any) {
      alert(`Error deleting exception: ${err.message}`);
    }
  };

  const handleSaveDoctorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setSavingDoctor(true);
    try {
      await api.saveDoctor(editingDoctor);
      setEditingDoctor(null);
      onRefreshDoctors();
    } catch (err: any) {
      alert(`Error updating doctor: ${err.message}`);
    } finally {
      setSavingDoctor(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="space-y-8">
      {/* Doctors Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {doctors.map((doc) => {
          const isSelected = selectedDoctorId === doc.id;
          return (
            <div
              key={doc.id}
              onClick={() => setSelectedDoctorId(doc.id)}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                isSelected
                  ? 'border-sky-600 shadow-md ring-2 ring-sky-600/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-base">
                    {doc.name.split(' ')[1]?.[0]}
                    {doc.name.split(' ')[2]?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{doc.name}</h4>
                    <p className="text-xs font-semibold text-sky-700">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500">{doc.qualifications} • {doc.experienceYears} Years Exp.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingDoctor({ ...doc });
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-slate-100 cursor-pointer"
                  title="Edit Doctor Details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className={`font-bold ${doc.isActive ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {doc.isActive ? 'Active OPD' : 'Inactive'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Slot Time</span>
                  <span className="font-bold text-slate-800">{doc.consultationDurationMinutes} min</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Daily Limit</span>
                  <span className="font-bold text-slate-800">{doc.maxDailyBookings} slots</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Doctor Weekly Schedule Management */}
      {selectedDoctor && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                <span>Consultation Schedule: {selectedDoctor.name}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure weekly working days and shift times. Slots will automatically compute within these boundaries.
              </p>
            </div>

            <button
              disabled={savingSchedule || !schedule}
              onClick={handleSaveSchedule}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingSchedule ? 'Saving...' : 'Save Schedule Changes'}</span>
            </button>
          </div>

          {/* Schedule Days */}
          {loadingSchedule ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading schedule...</div>
          ) : schedule ? (
            <div className="space-y-3">
              {schedule.days.map((day, dIdx) => (
                <div
                  key={day.dayOfWeek}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    day.isWorkingDay ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 w-40 shrink-0">
                    <input
                      type="checkbox"
                      id={`day-${day.dayOfWeek}`}
                      checked={day.isWorkingDay}
                      onChange={() => handleToggleWorkingDay(dIdx)}
                      className="w-4 h-4 rounded-sm text-sky-600 focus:ring-sky-500"
                    />
                    <label htmlFor={`day-${day.dayOfWeek}`} className="text-xs font-bold text-slate-900 cursor-pointer">
                      {dayNames[day.dayOfWeek]}
                    </label>
                  </div>

                  <div className="flex-1">
                    {day.isWorkingDay ? (
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {day.shifts.map((shift, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
                          >
                            <span className="text-[11px] font-semibold text-slate-500">Shift {sIdx + 1}:</span>
                            <input
                              type="time"
                              value={shift.startTime}
                              onChange={(e) => handleUpdateShift(dIdx, sIdx, 'startTime', e.target.value)}
                              className="font-mono text-xs font-bold text-slate-900 border-b border-slate-200 focus:outline-none"
                            />
                            <span className="text-slate-400">to</span>
                            <input
                              type="time"
                              value={shift.endTime}
                              onChange={(e) => handleUpdateShift(dIdx, sIdx, 'endTime', e.target.value)}
                              className="font-mono text-xs font-bold text-slate-900 border-b border-slate-200 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs italic text-slate-400">Clinic Closed (No Consultations)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Schedule Exceptions & Holidays */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            <span>Date-Specific Holidays & Leave Overrides</span>
          </h3>
          <p className="text-xs text-slate-500">
            Add official festival holidays, clinical closures, or doctor leave dates. Patients cannot book slots on these dates.
          </p>
        </div>

        {/* Add Exception Form */}
        <form onSubmit={handleAddException} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date (YYYY-MM-DD)
            </label>
            <input
              type="date"
              required
              value={newExDate}
              onChange={(e) => setNewExDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900 bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reason / Holiday Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Diwali Hospital Holiday, Doctor at Medical Conference"
              value={newExReason}
              onChange={(e) => setNewExReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900 bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday / Leave</span>
            </button>
          </div>
        </form>

        {/* Existing Exceptions List */}
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
          {exceptions.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              No holiday or schedule exceptions currently active for {selectedDoctor?.name}.
            </div>
          ) : (
            exceptions.map((ex) => (
              <div key={ex.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">{ex.date}</span>
                  <span className="text-slate-700">{ex.reason || 'Hospital Closure'}</span>
                  <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-semibold">
                    Day Off (Closed)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteException(ex.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Remove Exception"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-base text-slate-900">
                Edit Doctor Profile: {editingDoctor.name}
              </h4>
              <button onClick={() => setEditingDoctor(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoctorProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Specialty
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.specialty}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialty: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Qualifications (Degrees)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.qualifications}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, qualifications: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Experience (Yrs)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingDoctor.experienceYears}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Slot Duration (Mins)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingDoctor.consultationDurationMinutes}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, consultationDurationMinutes: parseInt(e.target.value) || 15 })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Max Daily Bookings
                  </label>
                  <input
                    type="number"
                    required
                    value={editingDoctor.maxDailyBookings}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, maxDailyBookings: parseInt(e.target.value) || 30 })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Professional Biography
                </label>
                <textarea
                  rows={3}
                  value={editingDoctor.bio}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="doc-active"
                  checked={editingDoctor.isActive}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, isActive: e.target.checked })}
                  className="w-4 h-4 rounded-sm text-sky-600"
                />
                <label htmlFor="doc-active" className="font-semibold text-slate-800 cursor-pointer">
                  Accepting Online OPD Bookings (Active)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDoctor}
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {savingDoctor ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
