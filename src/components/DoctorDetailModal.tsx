import React, { useEffect, useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  Award,
  CheckCircle2,
  CalendarCheck,
  ShieldCheck,
  Phone,
  Info,
} from 'lucide-react';
import { hospitalService } from '../services/hospitalService';
import type { Doctor, WeeklySchedule } from '../types';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookDoctor: (doctorId: string) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  onClose,
  onBookDoctor,
}) => {
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctor) return;
    setLoading(true);
    hospitalService
      .getDoctorBySlug(doctor.slug)
      .then((res) => {
        if (res.schedule) {
          setSchedule(res.schedule);
        }
      })
      .catch((err) => console.error('Failed to load doctor schedule:', err))
      .finally(() => setLoading(false));
  }, [doctor]);

  if (!doctor) return null;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-sky-800 to-sky-700 text-white flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold text-sky-100">
              {doctor.name.split(' ')[1]?.[0]}
              {doctor.name.split(' ')[2]?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{doctor.name}</h3>
                <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Verified Doctor
                </span>
              </div>
              <p className="text-sky-200 text-sm font-medium">{doctor.specialty}</p>
              <p className="text-sky-300 text-xs">Clinical Experience: {doctor.experienceYears} Years</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-sky-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Verified Qualifications Banner */}
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start gap-3">
            <Award className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                Authorized Qualifications & Medical Credentials
              </h4>
              <p className="text-slate-700">
                Primary Medical Qualification: <strong className="text-sky-900">{doctor.qualifications}</strong>
              </p>
              <p className="text-slate-500">
                Verified through hospital administrative records at Hingne Khurd, Pune.
              </p>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Professional Biography
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
          </div>

          {/* Consultation Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Weekly Consultation Schedule (Asia/Kolkata)</span>
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {doctor.consultationDurationMinutes} mins / patient
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">Loading consultation schedule...</div>
            ) : schedule ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {schedule.days.map((day) => (
                  <div
                    key={day.dayOfWeek}
                    className={`p-3 flex items-center justify-between ${
                      day.isWorkingDay ? 'bg-white' : 'bg-slate-50/70 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold text-slate-800 w-28">
                      {dayNames[day.dayOfWeek]}
                    </span>
                    <div className="flex-1">
                      {day.isWorkingDay && day.shifts.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {day.shifts.map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-100 px-2 py-1 rounded-md font-medium"
                            >
                              <Clock className="w-3 h-3 text-sky-600" />
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
            ) : (
              <p className="text-xs text-slate-500">Standard hours: Monday to Saturday (10:00 AM – 1:30 PM & 5:30 PM – 8:30 PM).</p>
            )}
          </div>

          {/* Consultation Guidelines */}
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Patient Consultation Notice</p>
              <p className="text-amber-800 leading-relaxed">
                Please arrive 10 minutes prior to your allocated slot at Aashirwad Hospital, Hingne Khurd.
                Consultation fees and prescription charges are settled directly at the hospital reception desk.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onBookDoctor(doctor.id);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book Appointment with {doctor.name.split(' ')[1]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
