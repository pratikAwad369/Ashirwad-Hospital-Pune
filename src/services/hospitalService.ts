/**
 * Aashirwad Hospital — Service & Data Access Layer
 *
 * Designed for clean separation of concerns. In presentation demo mode, this service
 * coordinates in-memory state and illustrative appointments.
 * When ready for production, this exact interface can be swapped directly with
 * Firebase Firestore (getDocs, addDoc, updateDoc) and Firebase Authentication.
 */

import type {
  Doctor,
  Service,
  SiteSettings,
  AvailableSlot,
  Appointment,
  AppointmentStatus,
  AdminMetrics,
  WeeklySchedule,
  ScheduleException,
  ContactMessage,
} from '../types';
import {
  INITIAL_SITE_SETTINGS,
  INITIAL_DOCTORS,
  INITIAL_SCHEDULES,
  INITIAL_EXCEPTIONS,
  INITIAL_SAMPLE_APPOINTMENTS,
  INITIAL_SAMPLE_MESSAGES,
} from './mockData';

class HospitalService {
  private settings: SiteSettings = { ...INITIAL_SITE_SETTINGS };
  private doctors: Doctor[] = [...INITIAL_DOCTORS];
  private schedules: Record<string, WeeklySchedule> = { ...INITIAL_SCHEDULES };
  private exceptions: ScheduleException[] = [...INITIAL_EXCEPTIONS];
  private appointments: Appointment[] = [...INITIAL_SAMPLE_APPOINTMENTS];
  private messages: ContactMessage[] = [...INITIAL_SAMPLE_MESSAGES];

  // --- Public Information ---
  async getHospitalInfo(): Promise<SiteSettings> {
    return { ...this.settings };
  }

  async getDoctors(): Promise<Doctor[]> {
    return this.doctors.filter((d) => d.isActive);
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return [...this.doctors];
  }

  async getDoctorBySlug(slug: string): Promise<{ doctor: Doctor; schedule?: WeeklySchedule }> {
    const doctor = this.doctors.find((d) => d.slug === slug);
    if (!doctor) throw new Error('Doctor not found');
    const schedule = this.schedules[doctor.id];
    return { doctor, schedule };
  }

  // --- Services (Public directory is kept empty/coming soon as required by prompt) ---
  async getPublicServices(): Promise<Service[]> {
    // Kept empty until the hospital officially confirms verified offerings
    return [];
  }

  async getAdminServices(): Promise<Service[]> {
    // Returns draft services catalog preview for hospital administration review
    return [
      {
        id: 'srv-preview-1',
        slug: 'family-medicine',
        title: 'General Family Medicine OPD',
        category: 'Family Healthcare',
        description: 'Comprehensive primary health consultations, routine clinical checkups, and acute illness diagnosis.',
        isPublished: false,
        requiresHospitalConfirmation: true,
        durationMinutes: 15,
        assignedDoctorIds: ['doc-nandkumar-bhutada', 'doc-poonam-bhutada'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'srv-preview-2',
        slug: 'diabetology-consultation',
        title: 'Diabetology & Dietary Guidance',
        category: 'Metabolic Health',
        description: 'Personalized dietary regimens, glycemic control, and blood glucose management with Dr. Nandkumar Bhutada, M.D. (Diet) (Ayu.).',
        isPublished: false,
        requiresHospitalConfirmation: true,
        durationMinutes: 15,
        assignedDoctorIds: ['doc-nandkumar-bhutada'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'srv-preview-3',
        slug: 'gynaecology-consultation',
        title: 'Women’s Health & Gynaecology Consultation',
        category: 'Gynaecology',
        description: 'Consultations on maternal wellness, reproductive health, and lifestyle advice with Dr. Poonam Bhutada, B.A.M.S., D.Y.A. (Ayu.).',
        isPublished: false,
        requiresHospitalConfirmation: true,
        durationMinutes: 20,
        assignedDoctorIds: ['doc-poonam-bhutada'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // --- Availability Slots Generator ---
  async getAvailabilitySlots(doctorId: string, date: string): Promise<{ slots: AvailableSlot[]; message?: string }> {
    const doctor = this.doctors.find((d) => d.id === doctorId);
    if (!doctor || !doctor.isActive) {
      return { slots: [], message: 'This doctor is currently not accepting bookings in demo mode.' };
    }

    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const dayOfWeek = dateObj.getUTCDay();

    // Sunday check
    if (dayOfWeek === 0) {
      return { slots: [], message: 'Aashirwad Hospital OPD is closed on Sundays. Please select a weekday (Monday – Saturday).' };
    }

    // Check exceptions / holiday
    const ex = this.exceptions.find((e) => e.doctorId === doctorId && e.date === date);
    if (ex && ex.isDayOff) {
      return { slots: [], message: ex.reason || 'Doctor is unavailable / hospital holiday on this date.' };
    }

    // Illustrative available slots for presentation demonstration
    const slots: AvailableSlot[] = [
      { time: '10:00', endTime: '10:15', available: true },
      { time: '10:15', endTime: '10:30', available: false, reason: 'Sample occupied slot' },
      { time: '10:30', endTime: '10:45', available: true },
      { time: '10:45', endTime: '11:00', available: true },
      { time: '11:00', endTime: '11:15', available: true },
      { time: '11:15', endTime: '11:30', available: false, reason: 'Sample occupied slot' },
      { time: '11:30', endTime: '11:45', available: true },
      { time: '11:45', endTime: '12:00', available: true },
      { time: '12:00', endTime: '12:15', available: true },
      { time: '17:30', endTime: '17:45', available: true },
      { time: '17:45', endTime: '18:00', available: true },
      { time: '18:00', endTime: '18:15', available: false, reason: 'Sample occupied slot' },
      { time: '18:15', endTime: '18:30', available: true },
      { time: '18:30', endTime: '18:45', available: true },
      { time: '18:45', endTime: '19:00', available: true },
      { time: '19:00', endTime: '19:15', available: true },
      { time: '19:15', endTime: '19:30', available: true },
      { time: '19:30', endTime: '19:45', available: true },
      { time: '19:45', endTime: '20:00', available: true },
      { time: '20:00', endTime: '20:15', available: true },
    ];

    return { slots };
  }

  // --- Demo Booking Submission (Does not store real patient records) ---
  async submitDemoBooking(payload: {
    doctorId: string;
    doctorName: string;
    serviceName?: string;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    appointmentDate: string;
    startTime: string;
  }): Promise<{ bookingReference: string; appointment: Appointment }> {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const bookingReference = `DEMO-ASH-${randomCode}`;

    const newAppointment: Appointment = {
      id: `demo-${Date.now()}`,
      bookingReference,
      doctorId: payload.doctorId,
      doctorName: payload.doctorName,
      serviceName: payload.serviceName || 'General Consultation',
      patientName: payload.patientName,
      patientPhone: payload.patientPhone,
      patientEmail: payload.patientEmail,
      appointmentDate: payload.appointmentDate,
      startTime: payload.startTime,
      endTime: payload.startTime, // approximate
      status: 'Confirmed',
      internalNotes: 'Created in interactive demonstration mode.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Prepend to in-memory demo list so it appears in the admin demonstration
    this.appointments.unshift(newAppointment);

    return { bookingReference, appointment: newAppointment };
  }

  // --- Lookup Demo Booking ---
  async lookupDemoBooking(ref: string): Promise<Appointment | null> {
    const found = this.appointments.find((a) => a.bookingReference.toUpperCase() === ref.trim().toUpperCase());
    return found ? { ...found } : null;
  }

  // --- Admin Metrics ---
  async getAdminMetrics(): Promise<AdminMetrics> {
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = this.appointments.filter((a) => a.appointmentDate === today);
    const upcoming = this.appointments.filter((a) => a.appointmentDate >= today && a.status !== 'Cancelled');

    return {
      currentDate: today,
      totalCount: this.appointments.length,
      todayCount: todayAppts.length,
      upcomingCount: upcoming.length,
      pendingCount: this.appointments.filter((a) => a.status === 'Pending').length,
      confirmedCount: this.appointments.filter((a) => a.status === 'Confirmed').length,
      completedCount: this.appointments.filter((a) => a.status === 'Completed').length,
      cancelledCount: this.appointments.filter((a) => a.status === 'Cancelled').length,
      noShowCount: this.appointments.filter((a) => a.status === 'No-show').length,
      doctorBreakdown: this.doctors.map((d) => {
        const docAppts = this.appointments.filter((a) => a.doctorId === d.id);
        return {
          doctorId: d.id,
          doctorName: d.name,
          total: docAppts.length,
          today: docAppts.filter((a) => a.appointmentDate === today).length,
          confirmed: docAppts.filter((a) => a.status === 'Confirmed').length,
          completed: docAppts.filter((a) => a.status === 'Completed').length,
        };
      }),
    };
  }

  // --- Admin Appointments ---
  async getAdminAppointments(filters?: {
    doctorId?: string;
    status?: AppointmentStatus;
    search?: string;
    date?: string;
  }): Promise<Appointment[]> {
    let list = [...this.appointments];

    if (filters?.doctorId) {
      list = list.filter((a) => a.doctorId === filters.doctorId);
    }
    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.date) {
      list = list.filter((a) => a.appointmentDate === filters.date);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientPhone.includes(q) ||
          a.bookingReference.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
    const apt = this.appointments.find((a) => a.id === id);
    if (apt) {
      apt.status = status;
      apt.updatedAt = new Date().toISOString();
    }
  }

  async updateAppointmentNotes(id: string, notes: string): Promise<void> {
    const apt = this.appointments.find((a) => a.id === id);
    if (apt) {
      apt.internalNotes = notes;
      apt.updatedAt = new Date().toISOString();
    }
  }

  // --- Doctor Schedule & Exceptions Management Preview ---
  async getDoctorSchedule(doctorId: string): Promise<{ schedule?: WeeklySchedule; exceptions: ScheduleException[] }> {
    const schedule = this.schedules[doctorId];
    const exceptions = this.exceptions.filter((e) => e.doctorId === doctorId);
    return { schedule, exceptions };
  }

  async saveDoctorSchedule(doctorId: string, days: WeeklySchedule['days']): Promise<void> {
    if (this.schedules[doctorId]) {
      this.schedules[doctorId].days = days;
      this.schedules[doctorId].updatedAt = new Date().toISOString();
    }
  }

  async addScheduleException(doctorId: string, exception: { date: string; isDayOff: boolean; reason?: string }): Promise<void> {
    this.exceptions.push({
      id: `ex-${Date.now()}`,
      doctorId,
      date: exception.date,
      isDayOff: exception.isDayOff,
      reason: exception.reason,
      createdAt: new Date().toISOString(),
    });
  }

  async deleteScheduleException(id: string): Promise<void> {
    this.exceptions = this.exceptions.filter((e) => e.id !== id);
  }

  // --- Contact Messages Demo ---
  async submitContactMessage(msg: { name: string; phone: string; email?: string; subject: string; message: string }): Promise<void> {
    this.messages.unshift({
      id: `msg-${Date.now()}`,
      name: msg.name,
      phone: msg.phone,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return [...this.messages];
  }

  async markMessageRead(id: string): Promise<void> {
    const msg = this.messages.find((m) => m.id === id);
    if (msg) msg.isRead = true;
  }
}

export const hospitalService = new HospitalService();
