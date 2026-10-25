import React, { useState } from 'react';
import {
  UserCheck,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  ExternalLink,
  CalendarCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import type { Doctor } from '../types';

interface DoctorsSectionProps {
  doctors: Doctor[];
  onSelectDoctorToBook: (doctorId: string) => void;
  onViewDoctorDetails: (doctor: Doctor) => void;
}

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({
  doctors,
  onSelectDoctorToBook,
  onViewDoctorDetails,
}) => {
  return (
    <section id="doctors" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold uppercase tracking-wider border border-sky-100">
            <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
            <span>Consulting Physicians</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Senior Medical Consultants
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            With over two decades of dedicated medical service in Hingne Khurd, Pune, our doctors provide
            patient-centered clinical care, specialized diabetes management, and comprehensive family medicine.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {doctors.map((doc) => {
            const isNandkumar = doc.slug.includes('nandkumar');

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 shadow-sm hover:shadow-xl hover:shadow-sky-900/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Doctor Card Top / Visual Profile */}
                <div>
                  <div className="p-6 sm:p-8 bg-gradient-to-b from-sky-50/70 to-white border-b border-slate-100 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                    {/* Authorized Medical Portrait / Silhouette */}
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-sky-800 to-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-800/15 group-hover:scale-102 transition-transform">
                        {doc.photoUrl ? (
                          <img
                            src={doc.photoUrl}
                            alt={doc.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-sky-100">
                            <span className="text-3xl font-bold tracking-tight">
                              {doc.name.split(' ')[1]?.[0] || 'D'}
                              {doc.name.split(' ')[2]?.[0] || 'B'}
                            </span>
                            <span className="text-[10px] text-sky-200 uppercase tracking-widest mt-1">Physician</span>
                          </div>
                        )}
                      </div>
                      <div
                        className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-sm"
                        title="Authorized Hospital Practitioner"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Name, Degrees, Experience */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          {doc.name}
                        </h3>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          {doc.experienceYears} Years Exp.
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-sky-700">{doc.specialty}</p>

                      <div className="pt-1">
                        <span className="inline-block text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          Verified Degree: <strong className="text-slate-800">{doc.qualifications}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Bio & Key Practice Areas */}
                  <div className="p-6 sm:p-8 space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {doc.bio}
                    </p>

                    {/* Verified Clinical Practice Focus */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Clinical Focus:
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        {isNandkumar ? (
                          <>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              <span>Diabetic Lifestyle & Diet</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              <span>Metabolic Health & Monitoring</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              <span>General Primary Healthcare</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              <span>Preventive Checkups</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              <span>Family Medicine</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              <span>Consulting Gynaecology</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              <span>Women’s Health & Wellness</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              <span>Holistic Health Guidance</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    {/* Schedule Badge */}
                    <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs text-slate-700 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-600" />
                        <span>Mon – Sat Consultations</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {doc.consultationDurationMinutes} min / slot
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onSelectDoctorToBook(doc.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/15 hover:shadow-lg hover:shadow-sky-600/25 transition-all cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Book with {doc.name.split(' ')[1]}</span>
                  </button>

                  <button
                    onClick={() => onViewDoctorDetails(doc)}
                    className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-200 transition-colors cursor-pointer"
                  >
                    <span>Full Schedule</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
