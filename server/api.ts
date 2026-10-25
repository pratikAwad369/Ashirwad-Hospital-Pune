import express from 'express';
import { z } from 'zod';
import { db } from './db.js';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  generateManagementToken,
  createSession,
  destroySession,
  requireAdmin,
  rateLimit,
  type AuthenticatedRequest,
} from './auth.js';
import { calculateAvailableSlots, getNowInKolkata } from './availability.js';
import { notificationService } from './notifications.js';
import type { AppointmentStatus } from './types.js';

export const apiRouter = express.Router();

// ----------------------------------------------------
// Public Endpoints
// ----------------------------------------------------

// Health check
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Aashirwad Hospital Core API',
    uptimeSeconds: Math.floor(process.uptime()),
    database: 'connected (ACID JSON Store)',
  });
});

// Hospital public information & settings
apiRouter.get('/hospital-info', (_req, res) => {
  const settings = db.getSettings();
  res.json({
    hospitalName: settings.hospitalName,
    address: settings.address,
    landmark: settings.landmark,
    phone: settings.phone,
    alternatePhone: settings.alternatePhone,
    emergencyPhone: settings.emergencyPhone,
    email: settings.email,
    slogan: settings.slogan,
    consultationHoursNote: settings.consultationHoursNote,
    cancellationNoticeHours: settings.cancellationNoticeHours,
    unverifiedDisclaimer: settings.unverifiedDisclaimer,
  });
});

// Public Doctors list
apiRouter.get('/doctors', (_req, res) => {
  const doctors = db.getDoctors(true);
  res.json({ doctors });
});

// Doctor profile by slug
apiRouter.get('/doctors/:slug', (req, res) => {
  const doctor = db.getDoctorBySlug(req.params.slug);
  if (!doctor || !doctor.isActive) {
    res.status(404).json({ error: 'Doctor not found or currently inactive.' });
    return;
  }
  const schedule = db.getWeeklySchedule(doctor.id);
  res.json({ doctor, schedule });
});

// Public Services list
apiRouter.get('/services', (_req, res) => {
  // Returns published services
  const services = db.getServices(true);
  res.json({ services });
});

// Availability query
apiRouter.get('/availability', (req, res) => {
  const doctorId = req.query.doctorId as string;
  const date = req.query.date as string;

  if (!doctorId || !date) {
    res.status(400).json({ error: 'doctorId and date query parameters are required.' });
    return;
  }

  const result = calculateAvailableSlots({ doctorId, date });
  res.json(result);
});

// Appointment Booking Schema
const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  serviceId: z.string().optional(),
  patientName: z
    .string()
    .trim()
    .min(2, 'Patient name must be at least 2 characters')
    .max(100, 'Patient name must be under 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name should only contain letters, spaces, and punctuation'),
  patientPhone: z
    .string()
    .trim()
    .regex(/^(\+91[\-\s]?)?[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number (e.g., 9822333770)'),
  patientEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time format must be HH:MM'),
});

// Book appointment endpoint (Rate limited: 10 bookings per 15 min per IP)
apiRouter.post(
  '/appointments',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 15, message: 'Too many booking attempts. Please slow down.' }),
  async (req, res) => {
    try {
      const parsed = bookAppointmentSchema.parse(req.body);

      // Verify doctor
      const doctor = db.getDoctorById(parsed.doctorId);
      if (!doctor || !doctor.isActive) {
        res.status(400).json({ error: 'The selected doctor is currently inactive.' });
        return;
      }

      // Recheck availability immediately before booking
      const availabilityCheck = calculateAvailableSlots({
        doctorId: parsed.doctorId,
        date: parsed.appointmentDate,
      });

      const slot = availabilityCheck.slots.find((s) => s.time === parsed.startTime);
      if (!slot || !slot.available) {
        res.status(409).json({
          error: slot?.reason || 'The requested appointment slot is no longer available. Please pick another time.',
        });
        return;
      }

      // Generate secure management token (given only to patient on creation)
      const managementToken = generateManagementToken();
      const managementTokenHash = hashToken(managementToken);

      // Resolve optional service
      let serviceTitle = undefined;
      if (parsed.serviceId) {
        const srv = db.getServiceById(parsed.serviceId);
        if (srv) serviceTitle = srv.title;
      }

      // Book atomically
      const appointment = await db.bookAppointmentAtomic({
        doctorId: doctor.id,
        doctorName: doctor.name,
        serviceId: parsed.serviceId,
        serviceName: serviceTitle,
        patientName: parsed.patientName,
        patientPhone: parsed.patientPhone,
        patientEmail: parsed.patientEmail || undefined,
        appointmentDate: parsed.appointmentDate,
        startTime: parsed.startTime,
        endTime: slot.endTime,
        managementTokenHash,
      });

      // Dispatch non-blocking notification
      notificationService.sendBookingConfirmation({
        bookingReference: appointment.bookingReference,
        doctorName: appointment.doctorName,
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
        patientEmail: appointment.patientEmail,
        serviceTitle: appointment.serviceName,
      });

      res.status(201).json({
        success: true,
        message: 'Appointment successfully booked!',
        bookingReference: appointment.bookingReference,
        managementToken, // Patient saves this to lookup or cancel
        appointment: {
          id: appointment.id,
          bookingReference: appointment.bookingReference,
          doctorName: appointment.doctorName,
          serviceName: appointment.serviceName,
          appointmentDate: appointment.appointmentDate,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          patientName: appointment.patientName,
          status: appointment.status,
          createdAt: appointment.createdAt,
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.issues[0]?.message || 'Validation failed' });
        return;
      }
      res.status(409).json({ error: err.message || 'Failed to complete appointment booking.' });
    }
  }
);

// Patient Appointment Lookup
const lookupSchema = z.object({
  bookingReference: z.string().trim().min(5),
  verification: z.string().trim().min(4, 'Enter phone number or management token'),
});

apiRouter.post(
  '/appointments/lookup',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => {
    try {
      const { bookingReference, verification } = lookupSchema.parse(req.body);
      const appointment = db.getAppointmentByReference(bookingReference);

      if (!appointment) {
        res.status(404).json({ error: 'No appointment found with the provided booking reference.' });
        return;
      }

      // Verify either managementToken hash OR matching patient phone number
      const hashedAttempt = hashToken(verification);
      const tokenMatch = appointment.managementTokenHash === hashedAttempt;
      const cleanInput = verification.replace(/\D/g, '');
      const cleanPhone = appointment.patientPhone.replace(/\D/g, '');
      const phoneMatch = cleanPhone.endsWith(cleanInput) && cleanInput.length >= 4;

      if (!tokenMatch && !phoneMatch) {
        res.status(403).json({ error: 'Verification failed. Please check the reference and phone number or token.' });
        return;
      }

      // Return minimal sanitized information (do NOT expose private notes or raw hashes)
      res.json({
        appointment: {
          bookingReference: appointment.bookingReference,
          doctorName: appointment.doctorName,
          serviceName: appointment.serviceName,
          appointmentDate: appointment.appointmentDate,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          patientName: appointment.patientName,
          status: appointment.status,
          createdAt: appointment.createdAt,
          cancelledAt: appointment.cancelledAt,
          cancellationReason: appointment.cancellationReason,
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.issues[0]?.message || 'Invalid input' });
        return;
      }
      res.status(500).json({ error: 'Lookup request failed.' });
    }
  }
);

// Patient Appointment Cancellation
const cancelAppointmentSchema = z.object({
  bookingReference: z.string().trim().min(5),
  managementToken: z.string().trim().min(10, 'Management token is required to cancel appointment'),
  reason: z.string().trim().max(300).optional(),
});

apiRouter.post(
  '/appointments/cancel',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  async (req, res) => {
    try {
      const { bookingReference, managementToken, reason } = cancelAppointmentSchema.parse(req.body);
      const appointment = db.getAppointmentByReference(bookingReference);

      if (!appointment) {
        res.status(404).json({ error: 'Appointment not found.' });
        return;
      }

      // Check token
      const hashedAttempt = hashToken(managementToken);
      if (appointment.managementTokenHash !== hashedAttempt) {
        res.status(403).json({ error: 'Invalid management token. Cancellation not authorized.' });
        return;
      }

      if (appointment.status === 'Cancelled') {
        res.status(400).json({ error: 'This appointment is already cancelled.' });
        return;
      }

      // Enforce cancellation notice rule (e.g. 2 hours before scheduled time in Asia/Kolkata)
      const settings = db.getSettings();
      const { currentDate, currentTime } = getNowInKolkata();

      if (appointment.appointmentDate < currentDate) {
        res.status(400).json({ error: 'Past appointments cannot be cancelled.' });
        return;
      }

      if (appointment.appointmentDate === currentDate) {
        const [curH, curM] = currentTime.split(':').map(Number);
        const [aptH, aptM] = appointment.startTime.split(':').map(Number);
        const diffMinutes = (aptH * 60 + aptM) - (curH * 60 + curM);
        const minNoticeMinutes = (settings.cancellationNoticeHours || 2) * 60;

        if (diffMinutes < minNoticeMinutes) {
          res.status(400).json({
            error: `Appointments must be cancelled at least ${settings.cancellationNoticeHours} hours in advance. For urgent queries, please call the hospital directly at ${settings.phone}.`,
          });
          return;
        }
      }

      const updated = await db.updateAppointmentStatus(
        appointment.id,
        'Cancelled',
        'Patient Self-Service',
        reason || 'Patient cancelled online via booking reference'
      );

      notificationService.sendCancellationNotice({
        bookingReference: updated.bookingReference,
        doctorName: updated.doctorName,
        appointmentDate: updated.appointmentDate,
        startTime: updated.startTime,
        patientName: updated.patientName,
        cancellationReason: reason,
      });

      res.json({
        success: true,
        message: 'Your appointment has been successfully cancelled.',
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.issues[0]?.message || 'Invalid input' });
        return;
      }
      res.status(500).json({ error: err.message || 'Failed to cancel appointment.' });
    }
  }
);

// Contact form endpoint (with spam honeypot and rate limiting)
const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  phone: z.string().trim().min(7, 'Phone number is required').max(20),
  email: z.string().email().optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Subject is required').max(150),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000),
  honeypot: z.string().max(0, 'Spam detected').optional(), // hidden field must be empty
});

apiRouter.post(
  '/contact',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many messages sent. Please wait.' }),
  async (req, res) => {
    try {
      const parsed = contactSchema.parse(req.body);

      // Check honeypot
      if (parsed.honeypot && parsed.honeypot.length > 0) {
        res.status(400).json({ error: 'Spam detected.' });
        return;
      }

      const message = await db.addContactMessage({
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || undefined,
        subject: parsed.subject,
        message: parsed.message,
      });

      res.status(201).json({
        success: true,
        message: 'Thank you. Your message has been received by Aashirwad Hospital staff.',
        id: message.id,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.issues[0]?.message || 'Validation failed' });
        return;
      }
      res.status(500).json({ error: 'Failed to submit contact message.' });
    }
  }
);

// ----------------------------------------------------
// Admin Authentication & Session Endpoints
// ----------------------------------------------------

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

apiRouter.post(
  '/admin/login',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many failed login attempts. Please wait 15 minutes.' }),
  async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = db.getAdminByUsername(username);

      if (!user) {
        res.status(401).json({ error: 'Invalid username or password.' });
        return;
      }

      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid username or password.' });
        return;
      }

      await db.updateAdminLastLogin(user.id);
      const sessionId = createSession(user.id);

      // Set secure cookie
      res.cookie('ash_admin_session', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: 'Authentication successful',
        sessionId,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: err.issues[0]?.message });
        return;
      }
      res.status(500).json({ error: 'Login error.' });
    }
  }
);

apiRouter.post('/admin/logout', (req: AuthenticatedRequest, res) => {
  const token = req.cookies?.ash_admin_session || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (token) {
    destroySession(token);
  }
  res.clearCookie('ash_admin_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.get('/admin/me', requireAdmin, (req: AuthenticatedRequest, res) => {
  const user = req.adminUser!;
  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

// ----------------------------------------------------
// Admin Protected Endpoints
// ----------------------------------------------------

// Metrics overview
apiRouter.get('/admin/metrics', requireAdmin, (_req, res) => {
  const { currentDate } = getNowInKolkata();
  const allAppointments = db.getAppointments();

  const todayAppointments = allAppointments.filter((a) => a.appointmentDate === currentDate);
  const upcomingAppointments = allAppointments.filter(
    (a) => a.appointmentDate >= currentDate && a.status !== 'Cancelled' && a.status !== 'Completed'
  );

  const pendingCount = allAppointments.filter((a) => a.status === 'Pending').length;
  const confirmedCount = allAppointments.filter((a) => a.status === 'Confirmed').length;
  const completedCount = allAppointments.filter((a) => a.status === 'Completed').length;
  const cancelledCount = allAppointments.filter((a) => a.status === 'Cancelled').length;
  const noShowCount = allAppointments.filter((a) => a.status === 'No-show').length;

  const doctors = db.getDoctors(false);
  const doctorBreakdown = doctors.map((doc) => {
    const docAppts = allAppointments.filter((a) => a.doctorId === doc.id);
    return {
      doctorId: doc.id,
      doctorName: doc.name,
      total: docAppts.length,
      today: docAppts.filter((a) => a.appointmentDate === currentDate && a.status !== 'Cancelled').length,
      confirmed: docAppts.filter((a) => a.status === 'Confirmed').length,
      completed: docAppts.filter((a) => a.status === 'Completed').length,
    };
  });

  res.json({
    currentDate,
    totalCount: allAppointments.length,
    todayCount: todayAppointments.length,
    upcomingCount: upcomingAppointments.length,
    pendingCount,
    confirmedCount,
    completedCount,
    cancelledCount,
    noShowCount,
    doctorBreakdown,
  });
});

// Admin Appointments List (with pagination and filters)
apiRouter.get('/admin/appointments', requireAdmin, (req, res) => {
  const doctorId = req.query.doctorId as string | undefined;
  const date = req.query.date as string | undefined;
  const status = req.query.status as AppointmentStatus | undefined;
  const search = req.query.search as string | undefined;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 15));

  const list = db.getAppointments({ doctorId, date, status, search });
  const total = list.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = list.slice(start, start + limit);

  res.json({
    appointments: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

// Update Appointment Status
apiRouter.patch('/admin/appointments/:id/status', requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const validStatuses: AppointmentStatus[] = ['Pending', 'Confirmed', 'Rescheduled', 'Cancelled', 'Completed', 'No-show'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  try {
    const updated = await db.updateAppointmentStatus(id, status, req.adminUser!.username, note);
    const history = db.getStatusHistory(id);
    res.json({ appointment: updated, history });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Update Appointment Internal Notes
apiRouter.patch('/admin/appointments/:id/notes', requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const updated = await db.updateAppointmentInternalNotes(id, notes || '', req.adminUser!.username);
    res.json({ appointment: updated });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Export Appointments to CSV
apiRouter.get('/admin/appointments/export', requireAdmin, (req: AuthenticatedRequest, res) => {
  const appointments = db.getAppointments();

  const headers = [
    'Reference',
    'Date',
    'Time',
    'Doctor',
    'Service',
    'Patient Name',
    'Patient Phone',
    'Patient Email',
    'Status',
    'Created At',
    'Internal Notes',
  ];

  const rows = appointments.map((a) => [
    `"${a.bookingReference}"`,
    `"${a.appointmentDate}"`,
    `"${a.startTime} - ${a.endTime}"`,
    `"${a.doctorName.replace(/"/g, '""')}"`,
    `"${(a.serviceName || '').replace(/"/g, '""')}"`,
    `"${a.patientName.replace(/"/g, '""')}"`,
    `"${a.patientPhone}"`,
    `"${a.patientEmail || ''}"`,
    `"${a.status}"`,
    `"${a.createdAt}"`,
    `"${(a.internalNotes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=aashirwad-appointments-${Date.now()}.csv`);
  res.send(csv);
});

// Admin Doctors Management
apiRouter.get('/admin/doctors', requireAdmin, (_req, res) => {
  const doctors = db.getDoctors(false);
  res.json({ doctors });
});

apiRouter.post('/admin/doctors', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const doctor = await db.saveDoctor(req.body, req.adminUser!.username);
    res.json({ doctor });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Doctor Schedule Management
apiRouter.get('/admin/doctors/:id/schedule', requireAdmin, (req, res) => {
  const weekly = db.getWeeklySchedule(req.params.id);
  const exceptions = db.getScheduleExceptions(req.params.id);
  res.json({ weekly, exceptions });
});

apiRouter.put('/admin/doctors/:id/schedule', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { days } = req.body;
    const updated = await db.saveWeeklySchedule(req.params.id, days, req.adminUser!.username);
    res.json({ schedule: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/doctors/:id/exceptions', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { date, isDayOff, customShifts, reason } = req.body;
    if (!date) {
      res.status(400).json({ error: 'Date is required.' });
      return;
    }
    const exception = await db.addScheduleException(
      {
        doctorId: req.params.id,
        date,
        isDayOff: !!isDayOff,
        customShifts,
        reason,
      },
      req.adminUser!.username
    );
    res.status(201).json({ exception });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/admin/exceptions/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const success = await db.deleteScheduleException(req.params.id, req.adminUser!.username);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Services Management
apiRouter.get('/admin/services', requireAdmin, (_req, res) => {
  const services = db.getServices(false);
  res.json({ services });
});

apiRouter.post('/admin/services', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const service = await db.saveService(req.body, req.adminUser!.username);
    res.json({ service });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/admin/services/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const success = await db.deleteService(req.params.id, req.adminUser!.username);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Site Settings Management
apiRouter.get('/admin/settings', requireAdmin, (_req, res) => {
  const settings = db.getSettings();
  res.json({ settings });
});

apiRouter.put('/admin/settings', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await db.updateSettings(req.body, req.adminUser!.username);
    res.json({ settings: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Audit Logs
apiRouter.get('/admin/audit-logs', requireAdmin, (req, res) => {
  const limit = Math.min(200, parseInt(req.query.limit as string) || 100);
  const logs = db.getAuditLogs(limit);
  res.json({ logs });
});

// Admin Contact Messages
apiRouter.get('/admin/messages', requireAdmin, (_req, res) => {
  const messages = db.getContactMessages();
  res.json({ messages });
});

apiRouter.patch('/admin/messages/:id/read', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    await db.markContactMessageRead(req.params.id, req.adminUser!.username);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
