export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Completed'
  | 'No-show';

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: 'superadmin' | 'admin' | 'receptionist';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Doctor {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  bio: string;
  photoUrl: string;
  isActive: boolean;
  consultationDurationMinutes: number;
  bufferMinutes: number;
  maxDailyBookings: number;
  consultationFeeNote?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeShift {
  startTime: string; // "HH:MM" e.g. "09:00"
  endTime: string;   // "HH:MM" e.g. "13:00"
}

export interface WeeklyScheduleDay {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  isWorkingDay: boolean;
  shifts: TimeShift[];
}

export interface WeeklySchedule {
  id: string;
  doctorId: string;
  days: WeeklyScheduleDay[];
  updatedAt: string;
}

export interface ScheduleException {
  id: string;
  doctorId: string;
  date: string; // "YYYY-MM-DD"
  isDayOff: boolean;
  customShifts?: TimeShift[];
  reason?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  isPublished: boolean;
  requiresHospitalConfirmation: boolean;
  durationMinutes: number;
  assignedDoctorIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  bookingReference: string; // e.g. ASH-2026-48912
  managementTokenHash: string; // hashed token for secure lookup & patient cancellation
  doctorId: string;
  doctorName: string;
  serviceId?: string;
  serviceName?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  appointmentDate: string; // "YYYY-MM-DD"
  startTime: string;       // "HH:MM"
  endTime: string;         // "HH:MM"
  status: AppointmentStatus;
  internalNotes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentStatusHistory {
  id: string;
  appointmentId: string;
  previousStatus: AppointmentStatus;
  newStatus: AppointmentStatus;
  changedBy: string;
  note?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  performedBy: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SiteSettings {
  hospitalName: string;
  address: string;
  landmark: string;
  phone: string;
  alternatePhone?: string;
  emergencyPhone?: string;
  email: string;
  slogan: string;
  mapQuery: string;
  consultationHoursNote: string;
  cancellationNoticeHours: number; // e.g. 2 hours minimum notice
  notificationEmailEnabled: boolean;
  notificationSmsEnabled: boolean;
  resendApiKeyConfigured: boolean;
  unverifiedDisclaimer: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AvailableSlot {
  time: string; // "HH:MM"
  endTime: string; // "HH:MM"
  available: boolean;
  reason?: string;
}
