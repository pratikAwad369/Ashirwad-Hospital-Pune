export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Completed'
  | 'No-show';

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
  startTime: string;
  endTime: string;
}

export interface WeeklyScheduleDay {
  dayOfWeek: number;
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
  date: string;
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
  bookingReference: string;
  doctorId: string;
  doctorName: string;
  serviceId?: string;
  serviceName?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
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
  cancellationNoticeHours: number;
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
  time: string;
  endTime: string;
  available: boolean;
  reason?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
  lastLoginAt?: string;
}

export interface AdminMetrics {
  currentDate: string;
  totalCount: number;
  todayCount: number;
  upcomingCount: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  doctorBreakdown: {
    doctorId: string;
    doctorName: string;
    total: number;
    today: number;
    confirmed: number;
    completed: number;
  }[];
}
