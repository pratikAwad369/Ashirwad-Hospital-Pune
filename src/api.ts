import type {
  Doctor,
  Service,
  SiteSettings,
  AvailableSlot,
  Appointment,
  AppointmentStatus,
  AppointmentStatusHistory,
  AuditLog,
  ContactMessage,
  AdminUser,
  AdminMetrics,
  WeeklySchedule,
  ScheduleException,
} from './types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Public
  getHospitalInfo: () => request<SiteSettings>('/hospital-info'),
  getDoctors: () => request<{ doctors: Doctor[] }>('/doctors'),
  getDoctorBySlug: (slug: string) => request<{ doctor: Doctor; schedule?: WeeklySchedule }>(`/doctors/${slug}`),
  getServices: () => request<{ services: Service[] }>('/services'),
  getAvailability: (doctorId: string, date: string) =>
    request<{ slots: AvailableSlot[]; message?: string }>(`/availability?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`),
  bookAppointment: (payload: {
    doctorId: string;
    serviceId?: string;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    appointmentDate: string;
    startTime: string;
  }) =>
    request<{
      success: boolean;
      message: string;
      bookingReference: string;
      managementToken: string;
      appointment: Appointment;
    }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  lookupAppointment: (bookingReference: string, verification: string) =>
    request<{ appointment: Appointment }>('/appointments/lookup', {
      method: 'POST',
      body: JSON.stringify({ bookingReference, verification }),
    }),
  cancelAppointment: (bookingReference: string, managementToken: string, reason?: string) =>
    request<{ success: boolean; message: string }>('/appointments/cancel', {
      method: 'POST',
      body: JSON.stringify({ bookingReference, managementToken, reason }),
    }),
  sendContactMessage: (payload: {
    name: string;
    phone: string;
    email?: string;
    subject: string;
    message: string;
    honeypot?: string;
  }) =>
    request<{ success: boolean; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Admin Auth
  adminLogin: (username: string, password: string) =>
    request<{ success: boolean; user: AdminUser; sessionId: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  adminLogout: () =>
    request<{ success: boolean }>('/admin/logout', {
      method: 'POST',
    }),
  adminMe: () => request<{ user: AdminUser }>('/admin/me'),

  // Admin Endpoints
  getMetrics: () => request<AdminMetrics>('/admin/metrics'),
  getAdminAppointments: (params?: {
    page?: number;
    limit?: number;
    doctorId?: string;
    date?: string;
    status?: AppointmentStatus;
    search?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', params.page.toString());
    if (params?.limit) q.set('limit', params.limit.toString());
    if (params?.doctorId) q.set('doctorId', params.doctorId);
    if (params?.date) q.set('date', params.date);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return request<{
      appointments: Appointment[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/admin/appointments?${q.toString()}`);
  },
  updateAppointmentStatus: (id: string, status: AppointmentStatus, note?: string) =>
    request<{ appointment: Appointment; history: AppointmentStatusHistory[] }>(`/admin/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),
  updateAppointmentNotes: (id: string, notes: string) =>
    request<{ appointment: Appointment }>(`/admin/appointments/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),
  exportAppointmentsCsvUrl: () => `${API_BASE}/admin/appointments/export`,

  // Admin Doctor Management
  getAdminDoctors: () => request<{ doctors: Doctor[] }>('/admin/doctors'),
  saveDoctor: (doctor: Partial<Doctor> & { name: string }) =>
    request<{ doctor: Doctor }>('/admin/doctors', {
      method: 'POST',
      body: JSON.stringify(doctor),
    }),
  getDoctorSchedule: (doctorId: string) =>
    request<{ weekly?: WeeklySchedule; exceptions: ScheduleException[] }>(`/admin/doctors/${doctorId}/schedule`),
  saveDoctorSchedule: (doctorId: string, days: WeeklySchedule['days']) =>
    request<{ schedule: WeeklySchedule }>(`/admin/doctors/${doctorId}/schedule`, {
      method: 'PUT',
      body: JSON.stringify({ days }),
    }),
  addScheduleException: (
    doctorId: string,
    exception: { date: string; isDayOff: boolean; reason?: string; customShifts?: any[] }
  ) =>
    request<{ exception: ScheduleException }>(`/admin/doctors/${doctorId}/exceptions`, {
      method: 'POST',
      body: JSON.stringify(exception),
    }),
  deleteScheduleException: (exceptionId: string) =>
    request<{ success: boolean }>(`/admin/exceptions/${exceptionId}`, {
      method: 'DELETE',
    }),

  // Admin Services
  getAdminServices: () => request<{ services: Service[] }>('/admin/services'),
  saveService: (service: Partial<Service> & { title: string }) =>
    request<{ service: Service }>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(service),
    }),
  deleteService: (serviceId: string) =>
    request<{ success: boolean }>(`/admin/services/${serviceId}`, {
      method: 'DELETE',
    }),

  // Admin Settings
  getAdminSettings: () => request<{ settings: SiteSettings }>('/admin/settings'),
  saveAdminSettings: (settings: Partial<SiteSettings>) =>
    request<{ settings: SiteSettings }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Admin Audit & Messages
  getAuditLogs: (limit = 100) => request<{ logs: AuditLog[] }>(`/admin/audit-logs?limit=${limit}`),
  getAdminMessages: () => request<{ messages: ContactMessage[] }>('/admin/messages'),
  markMessageRead: (id: string) =>
    request<{ success: boolean }>(`/admin/messages/${id}/read`, {
      method: 'PATCH',
    }),
};
