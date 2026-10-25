import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  ShieldCheck,
  Printer,
  Sparkles,
  MapPin,
  Stethoscope,
  Info,
  Copy,
} from 'lucide-react';
import { hospitalService } from '../services/hospitalService';
import type { Doctor, AvailableSlot, Appointment } from '../types';

interface BookingWizardProps {
  doctors: Doctor[];
  preselectedDoctorId?: string;
  onBookingComplete?: (ref: string) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  doctors,
  preselectedDoctorId,
  onBookingComplete,
}) => {
  // Wizard State
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form selections
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    preselectedDoctorId || doctors[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // Patient inputs
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  // Availability query state
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotErrorMessage, setSlotErrorMessage] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    if (preselectedDoctorId) {
      setSelectedDoctorId(preselectedDoctorId);
    }
  }, [preselectedDoctorId]);

  // Today in Asia/Kolkata
  const todayInKolkata = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSlotErrorMessage('');
    setSelectedSlot(null);

    hospitalService
      .getAvailabilitySlots(selectedDoctorId, selectedDate)
      .then((res) => {
        setAvailableSlots(res.slots || []);
        if (res.message) {
          setSlotErrorMessage(res.message);
        } else if (res.slots.length === 0) {
          setSlotErrorMessage('No slots available on this date.');
        }
      })
      .catch((err) => {
        setSlotErrorMessage(err.message || 'Unable to fetch slots.');
        setAvailableSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctorId, selectedDate]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleConfirmDemoBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      const res = await hospitalService.submitDemoBooking({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim() || undefined,
        appointmentDate: selectedDate,
        startTime: selectedSlot.time,
      });

      setConfirmedAppointment(res.appointment);
      setStep(5);
      if (onBookingComplete) {
        onBookingComplete(res.bookingReference);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefToClipboard = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <section id="booking" className="py-16 sm:py-20 bg-gradient-to-b from-white via-sky-50/40 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wizard Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Interactive Appointment Demonstration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Schedule a Consultation (Demo)
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Experience our multi-step outpatient scheduling workflow with Dr. Nandkumar Bhutada or Dr. Poonam Bhutada.
          </p>

          {/* Prominent Demo Notice */}
          <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-4 max-w-2xl mx-auto text-xs text-sky-900 flex items-start gap-3 text-left">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Client Presentation Demo Notice</p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                This form demonstrates the patient booking experience. Illustrative slots are provided for demonstration purposes.
                Submissions are not sent to hospital staff. Production booking will be enabled when persistent cloud storage is configured.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar (Steps 1 to 4) */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className={step >= 1 ? 'text-sky-700 font-bold' : ''}>1. Physician</span>
              <span className={step >= 2 ? 'text-sky-700 font-bold' : ''}>2. Date & Time</span>
              <span className={step >= 3 ? 'text-sky-700 font-bold' : ''}>3. Patient Info</span>
              <span className={step >= 4 ? 'text-sky-700 font-bold' : ''}>4. Review & Summary</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600 transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Wizard Card Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-sky-950/5 border border-sky-100 p-6 sm:p-10 relative">
          {/* STEP 1: Select Physician */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Step 1: Choose Consulting Physician</h3>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Demo Mode
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Select either Dr. Nandkumar Bhutada (Diabetologist) or Dr. Poonam Bhutada (Gynaecologist).
                </p>
              </div>

              {/* Doctor Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/60 shadow-md ring-2 ring-sky-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                            isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {doc.name.split(' ')[1]?.[0]}
                          {doc.name.split(' ')[2]?.[0]}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-900">{doc.name}</h4>
                          <p className="text-xs font-semibold text-sky-700">{doc.specialty}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{doc.qualifications}</p>
                          <p className="text-[11px] text-slate-400">{doc.experienceYears} Years Clinical Exp.</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Slot duration:</span>
                        <span className="font-semibold text-slate-800">{doc.consultationDurationMinutes} mins</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next Step Action */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedDoctorId}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <span>Select Consultation Date</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Date & Time Slot */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Step 2: Choose Date & Time Slot</h3>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Illustrative Sample Slots
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Select a date. Monday to Saturday OPD slots are computed in Asia/Kolkata timezone.
                </p>
              </div>

              {/* Doctor Summary Pill */}
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold text-slate-900">{selectedDoctor?.name}</span>
                  <span className="text-slate-500">({selectedDoctor?.specialty})</span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sky-600 hover:text-sky-800 font-semibold underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Consultation Date (Mon – Sat):
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayInKolkata}
                    max={maxDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3.5 pl-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 bg-white"
                  />
                  <CalendarIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500">
                  * Note: Sundays are hospital holidays. Past dates cannot be booked.
                </p>
              </div>

              {/* Available Slots Display */}
              {selectedDate && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-sky-600" />
                      <span>Illustrative Slots for {selectedDate}:</span>
                    </h4>
                    {loadingSlots && (
                      <span className="text-xs text-sky-600 animate-pulse font-medium">Loading slots...</span>
                    )}
                  </div>

                  {slotErrorMessage && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{slotErrorMessage}</span>
                    </div>
                  )}

                  {!loadingSlots && availableSlots.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-1 max-h-56 overflow-y-auto p-1">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot?.time === slot.time;

                        if (!slot.available) {
                          return (
                            <button
                              key={slot.time}
                              disabled
                              className="p-2.5 rounded-lg border border-slate-100 bg-slate-100 text-slate-400 text-xs text-center cursor-not-allowed line-through"
                              title={slot.reason || 'Unavailable'}
                            >
                              {slot.time}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-300'
                                : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-200 hover:border-sky-300'
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!selectedDate || !selectedSlot}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <span>Patient Information</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Patient Information */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Step 3: Patient Contact Information</h3>
                <p className="text-xs text-slate-500">
                  Please provide sample patient details to simulate booking confirmation.
                </p>
              </div>

              {/* Privacy Notice Box */}
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-sky-900">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Patient Data Privacy:</strong> No sensitive medical symptoms, diagnoses, or Aadhaar numbers are collected. In this presentation demo, details remain in-memory only.
                </p>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Patient Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kulkarni"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full p-3.5 pl-11 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Phone (10 digits) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. 9822333770"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full p-3.5 pl-11 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="sample.patient@example.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full p-3.5 pl-11 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!patientName.trim() || patientPhone.replace(/\D/g, '').length < 10}
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <span>Review Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review Summary */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Step 4: Review Booking Summary</h3>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Demo Mode Preview
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Verify the consultation details below before generating the demo booking slip.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-semibold">Doctor:</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedDoctor?.name}</p>
                    <p className="text-sky-700 font-medium">{selectedDoctor?.specialty}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-semibold">Hospital Location:</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">Aashirwad Hospital</p>
                    <p className="text-slate-600">Hingne Khurd, Pune 411051</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-semibold">Date & Time:</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedDate} at {selectedSlot?.time} IST
                    </p>
                    <p className="text-slate-500">Duration: ~{selectedDoctor?.consultationDurationMinutes} minutes</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-semibold">Patient:</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{patientName}</p>
                    <p className="text-slate-600 font-mono">{patientPhone}</p>
                  </div>
                </div>
              </div>

              {/* Clear Demonstration Disclaimer */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Notice:</strong> This is a presentation demonstration. Clicking "Generate Demo Booking" will simulate successful submission and show the patient booking slip. No actual hospital appointment is confirmed in this demo.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmDemoBooking}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Generate Demo Booking</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Successful Demo Confirmation & Printable Slip */}
          {step === 5 && confirmedAppointment && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Demo Booking Simulated
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Demo Booking Slip: {confirmedAppointment.patientName}
                </h3>
                <p className="text-xs text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200 max-w-md mx-auto">
                  Demonstration Only — Not a confirmed hospital appointment.
                </p>
              </div>

              {/* Sample Slip Card */}
              <div className="bg-sky-50/70 border-2 border-dashed border-sky-300 rounded-2xl p-6 text-left space-y-4 max-w-xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-sky-200/70 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                      Demo Reference Code
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-sky-950 font-mono tracking-wide">
                      {confirmedAppointment.bookingReference}
                    </p>
                  </div>
                  <button
                    onClick={() => copyRefToClipboard(confirmedAppointment.bookingReference)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3 py-1.5 rounded-lg border border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedRef ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 font-medium">Physician:</span>
                    <p className="font-bold text-slate-900">{confirmedAppointment.doctorName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Scheduled Date & Time:</span>
                    <p className="font-bold text-slate-900">
                      {confirmedAppointment.appointmentDate} at {confirmedAppointment.startTime} IST
                    </p>
                  </div>
                </div>

                <div className="text-xs pt-2 border-t border-sky-200/50 flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <span>213/26, Ram Mandir Temple Lane, Damodar Nagar Road, near Rokdoba Temple, Hingne Khurd, Pune 411051</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Sample Slip</span>
                </button>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Aashirwad+Hospital+Hingne+Khurd+Pune+411051"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs shadow-2xs transition-colors"
                >
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Google Maps Directions</span>
                </a>

                <button
                  onClick={() => {
                    setStep(1);
                    setConfirmedAppointment(null);
                    setSelectedSlot(null);
                    setSelectedDate('');
                    setPatientName('');
                    setPatientPhone('');
                    setPatientEmail('');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sky-700 hover:text-sky-900 hover:bg-sky-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Restart Booking Demo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
