import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  AdminUser,
  Doctor,
  WeeklySchedule,
  ScheduleException,
  Service,
  Appointment,
  AppointmentStatusHistory,
  AuditLog,
  SiteSettings,
  ContactMessage,
  AppointmentStatus,
} from './types.js';

interface DatabaseSchema {
  adminUsers: AdminUser[];
  doctors: Doctor[];
  weeklySchedules: WeeklySchedule[];
  scheduleExceptions: ScheduleException[];
  services: Service[];
  appointments: Appointment[];
  appointmentStatusHistories: AppointmentStatusHistory[];
  auditLogs: AuditLog[];
  siteSettings: SiteSettings;
  contactMessages: ContactMessage[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'hospital_db.json');

// Mutex lock for thread-safe atomic file operations
class AsyncLock {
  private queue: Array<() => void> = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const run = () => {
        this.locked = true;
        resolve(() => {
          this.locked = false;
          const next = this.queue.shift();
          if (next) next();
        });
      };

      if (!this.locked) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }
}

const fileLock = new AsyncLock();

function hashPasswordHelper(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function getDefaultData(): DatabaseSchema {
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminHash = hashPasswordHelper('AashirwadAdmin2026!', adminSalt);

  const doctor1Id = 'doc-nandkumar-bhutada';
  const doctor2Id = 'doc-poonam-bhutada';

  const defaultScheduleDays = (morningStart: string, morningEnd: string, eveningStart: string, eveningEnd: string) => [
    { dayOfWeek: 0, isWorkingDay: false, shifts: [] }, // Sunday
    { dayOfWeek: 1, isWorkingDay: true, shifts: [{ startTime: morningStart, endTime: morningEnd }, { startTime: eveningStart, endTime: eveningEnd }] },
    { dayOfWeek: 2, isWorkingDay: true, shifts: [{ startTime: morningStart, endTime: morningEnd }, { startTime: eveningStart, endTime: eveningEnd }] },
    { dayOfWeek: 3, isWorkingDay: true, shifts: [{ startTime: morningStart, endTime: morningEnd }, { startTime: eveningStart, endTime: eveningEnd }] },
    { dayOfWeek: 4, isWorkingDay: true, shifts: [{ startTime: morningStart, endTime: morningEnd }, { startTime: eveningStart, endTime: eveningEnd }] },
    { dayOfWeek: 5, isWorkingDay: true, shifts: [{ startTime: morningStart, endTime: morningEnd }, { startTime: eveningStart, endTime: eveningEnd }] },
    { dayOfWeek: 6, isWorkingDay: true, shifts: [{ startTime: morningStart, endTime: morningEnd }, { startTime: eveningStart, endTime: eveningEnd }] },
  ];

  return {
    adminUsers: [
      {
        id: 'admin-1',
        username: 'admin',
        passwordHash: adminHash,
        salt: adminSalt,
        name: 'Dr. Administrator',
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      },
    ],
    doctors: [
      {
        id: doctor1Id,
        slug: 'dr-nandkumar-bhutada',
        name: 'Dr. Nandkumar Bhutada',
        specialty: 'Family Physician and Diabetologist',
        qualifications: 'M.D. (Diet) (Ayu.)',
        experienceYears: 22,
        bio: 'Dr. Nandkumar Bhutada brings over 22 years of clinical excellence as a Family Physician and Diabetologist, specializing in metabolic disorders, patient dietary guidance, and preventive family healthcare at Hingne Khurd, Pune.',
        photoUrl: '',
        isActive: true,
        consultationDurationMinutes: 15,
        bufferMinutes: 5,
        maxDailyBookings: 35,
        consultationFeeNote: 'Verified at reception upon arrival',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: doctor2Id,
        slug: 'dr-poonam-bhutada',
        name: 'Dr. Poonam Bhutada',
        specialty: 'Family Physician and Consulting Gynaecologist',
        qualifications: 'B.A.M.S., D.Y.A. (Ayu.)',
        experienceYears: 20,
        bio: 'Dr. Poonam Bhutada has served the Hingne Khurd community for 20 years, providing dedicated family medical consultations, maternal wellness guidance, and compassionate gynaecological care.',
        photoUrl: '',
        isActive: true,
        consultationDurationMinutes: 20,
        bufferMinutes: 5,
        maxDailyBookings: 30,
        consultationFeeNote: 'Verified at reception upon arrival',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    weeklySchedules: [
      {
        id: 'sched-' + doctor1Id,
        doctorId: doctor1Id,
        days: defaultScheduleDays('10:00', '13:00', '17:30', '20:30'),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sched-' + doctor2Id,
        doctorId: doctor2Id,
        days: defaultScheduleDays('10:30', '13:30', '18:00', '20:30'),
        updatedAt: new Date().toISOString(),
      },
    ],
    scheduleExceptions: [],
    services: [
      {
        id: 'srv-1',
        slug: 'general-family-medicine',
        title: 'General Family Medicine & Primary Care',
        category: 'Family Healthcare',
        description: 'Comprehensive primary diagnosis, treatment of acute infections, routine medical checkups, and preventive care for all age groups.',
        isPublished: true,
        requiresHospitalConfirmation: false,
        durationMinutes: 15,
        assignedDoctorIds: [doctor1Id, doctor2Id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'srv-2',
        slug: 'diabetes-metabolic-care',
        title: 'Diabetology & Metabolic Health',
        category: 'Chronic Care',
        description: 'Personalized dietary planning, blood sugar management, lifestyle guidance, and regular diabetic monitoring by Dr. Nandkumar Bhutada.',
        isPublished: true,
        requiresHospitalConfirmation: false,
        durationMinutes: 15,
        assignedDoctorIds: [doctor1Id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'srv-3',
        slug: 'gynaecology-womens-wellness',
        title: 'Women’s Health & Gynaecological Consultation',
        category: 'Gynaecology',
        description: 'Consultations on reproductive health, menstrual irregularities, pre- and post-natal advice, and adolescent female wellness with Dr. Poonam Bhutada.',
        isPublished: true,
        requiresHospitalConfirmation: false,
        durationMinutes: 20,
        assignedDoctorIds: [doctor2Id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'srv-4',
        slug: 'ayurvedic-diet-lifestyle',
        title: 'Ayurvedic Diet & Lifestyle Counseling',
        category: 'Nutritional Care (Draft)',
        description: 'Holistic dietary regimens customized according to constitution and health conditions. (Draft category requires hospital review).',
        isPublished: false,
        requiresHospitalConfirmation: true,
        durationMinutes: 20,
        assignedDoctorIds: [doctor1Id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    appointments: [],
    appointmentStatusHistories: [],
    auditLogs: [
      {
        id: 'log-init',
        action: 'SYSTEM_INITIALIZED',
        entityType: 'System',
        entityId: 'aashirwad-core',
        details: 'Initial system seeded with verified hospital profiles and admin account.',
        performedBy: 'System Bootstrap',
        timestamp: new Date().toISOString(),
      },
    ],
    siteSettings: {
      hospitalName: 'Aashirwad Hospital',
      address: '213/26, Ram Mandir Temple Lane, Damodar Nagar Road, near Rokdoba Temple, Hingne Khurd, Pune, Maharashtra 411051, India',
      landmark: 'Near Rokdoba Temple, Ram Mandir Temple Lane, Damodar Nagar',
      phone: '+91 9822333770',
      alternatePhone: '',
      emergencyPhone: '',
      email: 'contact@aashirwadhospitalpune.in',
      slogan: 'Your Health, Our Priority.',
      mapQuery: 'Aashirwad Hospital Hingne Khurd Pune Maharashtra',
      consultationHoursNote: 'Monday to Saturday: Morning 10:00 AM - 1:30 PM, Evening 5:30 PM - 8:30 PM. Sunday Closed.',
      cancellationNoticeHours: 2,
      notificationEmailEnabled: false,
      notificationSmsEnabled: false,
      resendApiKeyConfigured: false,
      unverifiedDisclaimer: 'Information marked unverified requires confirmation by hospital staff prior to public notice.',
    },
    contactMessages: [],
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.readOrCreate();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private readOrCreate(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getDefaultData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (e) {
      console.error('Error reading db file, falling back to default:', e);
      const initial = getDefaultData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
  }

  private async persist(): Promise<void> {
    const release = await fileLock.acquire();
    try {
      this.ensureDirectoryExists();
      const tempPath = DB_FILE + '.tmp';
      await fs.promises.writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, DB_FILE);
    } finally {
      release();
    }
  }

  // --- Read Operations ---
  getSettings(): SiteSettings {
    return { ...this.data.siteSettings };
  }

  async updateSettings(settings: Partial<SiteSettings>, adminUsername: string): Promise<SiteSettings> {
    this.data.siteSettings = { ...this.data.siteSettings, ...settings };
    this.logAudit({
      action: 'UPDATE_SETTINGS',
      entityType: 'SiteSettings',
      entityId: 'settings',
      details: `Hospital settings updated by ${adminUsername}`,
      performedBy: adminUsername,
    });
    await this.persist();
    return { ...this.data.siteSettings };
  }

  getAdminById(id: string): AdminUser | undefined {
    return this.data.adminUsers.find((u) => u.id === id);
  }

  getAdminByUsername(username: string): AdminUser | undefined {
    return this.data.adminUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  async updateAdminLastLogin(userId: string): Promise<void> {
    const user = this.data.adminUsers.find((u) => u.id === userId);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      await this.persist();
    }
  }

  getDoctors(onlyActive = true): Doctor[] {
    if (onlyActive) {
      return this.data.doctors.filter((d) => d.isActive);
    }
    return [...this.data.doctors];
  }

  getDoctorById(id: string): Doctor | undefined {
    return this.data.doctors.find((d) => d.id === id);
  }

  getDoctorBySlug(slug: string): Doctor | undefined {
    return this.data.doctors.find((d) => d.slug === slug);
  }

  async saveDoctor(doctorData: Partial<Doctor> & { name: string }, adminUsername: string): Promise<Doctor> {
    let doctor: Doctor;
    const now = new Date().toISOString();
    if (doctorData.id) {
      const idx = this.data.doctors.findIndex((d) => d.id === doctorData.id);
      if (idx === -1) throw new Error('Doctor not found');
      doctor = {
        ...this.data.doctors[idx],
        ...doctorData,
        updatedAt: now,
      };
      this.data.doctors[idx] = doctor;
      this.logAudit({
        action: 'UPDATE_DOCTOR',
        entityType: 'Doctor',
        entityId: doctor.id,
        details: `Updated doctor profile: ${doctor.name}`,
        performedBy: adminUsername,
      });
    } else {
      const id = 'doc-' + crypto.randomBytes(4).toString('hex');
      const slug = doctorData.slug || doctorData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      doctor = {
        id,
        slug,
        name: doctorData.name,
        specialty: doctorData.specialty || 'General Practitioner',
        qualifications: doctorData.qualifications || 'B.A.M.S.',
        experienceYears: Number(doctorData.experienceYears) || 0,
        bio: doctorData.bio || '',
        photoUrl: doctorData.photoUrl || '',
        isActive: doctorData.isActive ?? true,
        consultationDurationMinutes: Number(doctorData.consultationDurationMinutes) || 15,
        bufferMinutes: Number(doctorData.bufferMinutes) || 5,
        maxDailyBookings: Number(doctorData.maxDailyBookings) || 30,
        consultationFeeNote: doctorData.consultationFeeNote || 'Verified at reception',
        isVerified: doctorData.isVerified ?? true,
        createdAt: now,
        updatedAt: now,
      };
      this.data.doctors.push(doctor);
      // create default schedule
      this.data.weeklySchedules.push({
        id: 'sched-' + doctor.id,
        doctorId: doctor.id,
        days: [
          { dayOfWeek: 0, isWorkingDay: false, shifts: [] },
          { dayOfWeek: 1, isWorkingDay: true, shifts: [{ startTime: '10:00', endTime: '13:00' }, { startTime: '17:30', endTime: '20:30' }] },
          { dayOfWeek: 2, isWorkingDay: true, shifts: [{ startTime: '10:00', endTime: '13:00' }, { startTime: '17:30', endTime: '20:30' }] },
          { dayOfWeek: 3, isWorkingDay: true, shifts: [{ startTime: '10:00', endTime: '13:00' }, { startTime: '17:30', endTime: '20:30' }] },
          { dayOfWeek: 4, isWorkingDay: true, shifts: [{ startTime: '10:00', endTime: '13:00' }, { startTime: '17:30', endTime: '20:30' }] },
          { dayOfWeek: 5, isWorkingDay: true, shifts: [{ startTime: '10:00', endTime: '13:00' }, { startTime: '17:30', endTime: '20:30' }] },
          { dayOfWeek: 6, isWorkingDay: true, shifts: [{ startTime: '10:00', endTime: '13:00' }, { startTime: '17:30', endTime: '20:30' }] },
        ],
        updatedAt: now,
      });
      this.logAudit({
        action: 'CREATE_DOCTOR',
        entityType: 'Doctor',
        entityId: doctor.id,
        details: `Created doctor profile: ${doctor.name}`,
        performedBy: adminUsername,
      });
    }
    await this.persist();
    return doctor;
  }

  getWeeklySchedule(doctorId: string): WeeklySchedule | undefined {
    return this.data.weeklySchedules.find((s) => s.doctorId === doctorId);
  }

  async saveWeeklySchedule(doctorId: string, days: WeeklySchedule['days'], adminUsername: string): Promise<WeeklySchedule> {
    let sched = this.data.weeklySchedules.find((s) => s.doctorId === doctorId);
    const now = new Date().toISOString();
    if (sched) {
      sched.days = days;
      sched.updatedAt = now;
    } else {
      sched = {
        id: 'sched-' + doctorId,
        doctorId,
        days,
        updatedAt: now,
      };
      this.data.weeklySchedules.push(sched);
    }
    this.logAudit({
      action: 'UPDATE_SCHEDULE',
      entityType: 'WeeklySchedule',
      entityId: doctorId,
      details: `Updated consultation schedule for doctor ${doctorId}`,
      performedBy: adminUsername,
    });
    await this.persist();
    return sched;
  }

  getScheduleExceptions(doctorId: string): ScheduleException[] {
    return this.data.scheduleExceptions.filter((e) => e.doctorId === doctorId);
  }

  async addScheduleException(exception: Omit<ScheduleException, 'id' | 'createdAt'>, adminUsername: string): Promise<ScheduleException> {
    const newEx: ScheduleException = {
      id: 'ex-' + crypto.randomBytes(4).toString('hex'),
      createdAt: new Date().toISOString(),
      ...exception,
    };
    this.data.scheduleExceptions.push(newEx);
    this.logAudit({
      action: 'ADD_SCHEDULE_EXCEPTION',
      entityType: 'ScheduleException',
      entityId: newEx.id,
      details: `Added schedule exception for doctor ${newEx.doctorId} on ${newEx.date}: ${newEx.reason || 'Leave/Custom'}`,
      performedBy: adminUsername,
    });
    await this.persist();
    return newEx;
  }

  async deleteScheduleException(id: string, adminUsername: string): Promise<boolean> {
    const idx = this.data.scheduleExceptions.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    const removed = this.data.scheduleExceptions.splice(idx, 1)[0];
    this.logAudit({
      action: 'DELETE_SCHEDULE_EXCEPTION',
      entityType: 'ScheduleException',
      entityId: id,
      details: `Removed schedule exception for ${removed.doctorId} on ${removed.date}`,
      performedBy: adminUsername,
    });
    await this.persist();
    return true;
  }

  getServices(publishedOnly = true): Service[] {
    if (publishedOnly) {
      return this.data.services.filter((s) => s.isPublished);
    }
    return [...this.data.services];
  }

  getServiceById(id: string): Service | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  async saveService(serviceData: Partial<Service> & { title: string }, adminUsername: string): Promise<Service> {
    let service: Service;
    const now = new Date().toISOString();
    if (serviceData.id) {
      const idx = this.data.services.findIndex((s) => s.id === serviceData.id);
      if (idx === -1) throw new Error('Service not found');
      service = {
        ...this.data.services[idx],
        ...serviceData,
        updatedAt: now,
      };
      this.data.services[idx] = service;
      this.logAudit({
        action: 'UPDATE_SERVICE',
        entityType: 'Service',
        entityId: service.id,
        details: `Updated service: ${service.title} (Published: ${service.isPublished})`,
        performedBy: adminUsername,
      });
    } else {
      const id = 'srv-' + crypto.randomBytes(4).toString('hex');
      const slug = serviceData.slug || serviceData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      service = {
        id,
        slug,
        title: serviceData.title,
        category: serviceData.category || 'General',
        description: serviceData.description || '',
        isPublished: serviceData.isPublished ?? false,
        requiresHospitalConfirmation: serviceData.requiresHospitalConfirmation ?? false,
        durationMinutes: Number(serviceData.durationMinutes) || 15,
        assignedDoctorIds: serviceData.assignedDoctorIds || [],
        createdAt: now,
        updatedAt: now,
      };
      this.data.services.push(service);
      this.logAudit({
        action: 'CREATE_SERVICE',
        entityType: 'Service',
        entityId: service.id,
        details: `Created new service: ${service.title}`,
        performedBy: adminUsername,
      });
    }
    await this.persist();
    return service;
  }

  async deleteService(id: string, adminUsername: string): Promise<boolean> {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    const removed = this.data.services.splice(idx, 1)[0];
    this.logAudit({
      action: 'DELETE_SERVICE',
      entityType: 'Service',
      entityId: id,
      details: `Deleted service ${removed.title}`,
      performedBy: adminUsername,
    });
    await this.persist();
    return true;
  }

  // --- Atomic Appointment Booking with Concurrency Lock ---
  async bookAppointmentAtomic(params: {
    doctorId: string;
    doctorName: string;
    serviceId?: string;
    serviceName?: string;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    appointmentDate: string; // YYYY-MM-DD
    startTime: string;       // HH:MM
    endTime: string;         // HH:MM
    managementTokenHash: string;
  }): Promise<Appointment> {
    const release = await fileLock.acquire();
    try {
      // 1. Verify doctor exists and isActive
      const doctor = this.data.doctors.find((d) => d.id === params.doctorId);
      if (!doctor || !doctor.isActive) {
        throw new Error('The selected doctor is currently not accepting appointments.');
      }

      // 2. Check for slot conflict (prevent double booking)
      const conflict = this.data.appointments.find((a) => {
        return (
          a.doctorId === params.doctorId &&
          a.appointmentDate === params.appointmentDate &&
          a.startTime === params.startTime &&
          a.status !== 'Cancelled'
        );
      });

      if (conflict) {
        throw new Error('This time slot was just booked by another patient. Please select another slot.');
      }

      // 3. Check daily booking limit
      const dayCount = this.data.appointments.filter(
        (a) => a.doctorId === params.doctorId && a.appointmentDate === params.appointmentDate && a.status !== 'Cancelled'
      ).length;
      if (dayCount >= doctor.maxDailyBookings) {
        throw new Error('The doctor has reached the maximum appointment limit for this date.');
      }

      // 4. Generate unique reference e.g. ASH-2026-48912
      const year = new Date().getFullYear();
      let ref = '';
      let isUnique = false;
      while (!isUnique) {
        const rand = Math.floor(10000 + Math.random() * 90000);
        ref = `ASH-${year}-${rand}`;
        if (!this.data.appointments.some((a) => a.bookingReference === ref)) {
          isUnique = true;
        }
      }

      const now = new Date().toISOString();
      const newAppointment: Appointment = {
        id: 'apt-' + crypto.randomBytes(6).toString('hex'),
        bookingReference: ref,
        managementTokenHash: params.managementTokenHash,
        doctorId: params.doctorId,
        doctorName: params.doctorName,
        serviceId: params.serviceId,
        serviceName: params.serviceName,
        patientName: params.patientName,
        patientPhone: params.patientPhone,
        patientEmail: params.patientEmail,
        appointmentDate: params.appointmentDate,
        startTime: params.startTime,
        endTime: params.endTime,
        status: 'Confirmed', // Automatically confirmed or Pending based on policy
        createdAt: now,
        updatedAt: now,
      };

      this.data.appointments.push(newAppointment);

      // Record initial status in history
      this.data.appointmentStatusHistories.push({
        id: 'hist-' + crypto.randomBytes(4).toString('hex'),
        appointmentId: newAppointment.id,
        previousStatus: 'Pending',
        newStatus: 'Confirmed',
        changedBy: 'Patient Web Booking',
        note: `Self-booked by patient via public portal. Ref: ${ref}`,
        timestamp: now,
      });

      // Audit log (masked phone)
      const maskedPhone = params.patientPhone.replace(/\d(?=\d{4})/g, '*');
      this.logAudit({
        action: 'BOOK_APPOINTMENT',
        entityType: 'Appointment',
        entityId: newAppointment.id,
        details: `Appointment booked: Ref ${ref} with ${params.doctorName} on ${params.appointmentDate} at ${params.startTime} for patient ${params.patientName} (${maskedPhone})`,
        performedBy: 'Patient Portal',
      });

      // Persist to disk while under lock
      const tempPath = DB_FILE + '.tmp';
      await fs.promises.writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, DB_FILE);

      return newAppointment;
    } finally {
      release();
    }
  }

  getAppointmentByReference(ref: string): Appointment | undefined {
    return this.data.appointments.find((a) => a.bookingReference.toUpperCase() === ref.trim().toUpperCase());
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.data.appointments.find((a) => a.id === id);
  }

  getAppointments(filters?: {
    doctorId?: string;
    date?: string;
    status?: AppointmentStatus;
    search?: string;
  }): Appointment[] {
    let list = [...this.data.appointments];
    if (filters?.doctorId) {
      list = list.filter((a) => a.doctorId === filters.doctorId);
    }
    if (filters?.date) {
      list = list.filter((a) => a.appointmentDate === filters.date);
    }
    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientPhone.includes(q) ||
          a.bookingReference.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q)
      );
    }
    // Sort descending by date & time
    list.sort((a, b) => {
      const dateA = `${a.appointmentDate}T${a.startTime}`;
      const dateB = `${b.appointmentDate}T${b.startTime}`;
      return dateB.localeCompare(dateA);
    });
    return list;
  }

  async updateAppointmentStatus(
    id: string,
    newStatus: AppointmentStatus,
    changedBy: string,
    note?: string
  ): Promise<Appointment> {
    const release = await fileLock.acquire();
    try {
      const apt = this.data.appointments.find((a) => a.id === id);
      if (!apt) throw new Error('Appointment not found');

      const prev = apt.status;
      apt.status = newStatus;
      apt.updatedAt = new Date().toISOString();
      if (newStatus === 'Cancelled') {
        apt.cancelledAt = apt.updatedAt;
        if (note) apt.cancellationReason = note;
      }

      this.data.appointmentStatusHistories.push({
        id: 'hist-' + crypto.randomBytes(4).toString('hex'),
        appointmentId: apt.id,
        previousStatus: prev,
        newStatus,
        changedBy,
        note,
        timestamp: apt.updatedAt,
      });

      this.logAudit({
        action: 'UPDATE_APPOINTMENT_STATUS',
        entityType: 'Appointment',
        entityId: apt.id,
        details: `Status of ${apt.bookingReference} changed from ${prev} to ${newStatus} by ${changedBy}`,
        performedBy: changedBy,
      });

      const tempPath = DB_FILE + '.tmp';
      await fs.promises.writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, DB_FILE);

      return apt;
    } finally {
      release();
    }
  }

  async updateAppointmentInternalNotes(id: string, notes: string, adminUsername: string): Promise<Appointment> {
    const apt = this.data.appointments.find((a) => a.id === id);
    if (!apt) throw new Error('Appointment not found');
    apt.internalNotes = notes;
    apt.updatedAt = new Date().toISOString();
    this.logAudit({
      action: 'UPDATE_APPOINTMENT_NOTES',
      entityType: 'Appointment',
      entityId: id,
      details: `Internal notes updated for ${apt.bookingReference}`,
      performedBy: adminUsername,
    });
    await this.persist();
    return apt;
  }

  getStatusHistory(appointmentId: string): AppointmentStatusHistory[] {
    return this.data.appointmentStatusHistories
      .filter((h) => h.appointmentId === appointmentId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  getAuditLogs(limit = 100): AuditLog[] {
    return [...this.data.auditLogs]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  private logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    this.data.auditLogs.push({
      id: 'log-' + crypto.randomBytes(4).toString('hex'),
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }

  // --- Contact Messages ---
  getContactMessages(): ContactMessage[] {
    return [...this.data.contactMessages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async addContactMessage(message: Omit<ContactMessage, 'id' | 'isRead' | 'createdAt'>): Promise<ContactMessage> {
    const newMsg: ContactMessage = {
      id: 'msg-' + crypto.randomBytes(4).toString('hex'),
      isRead: false,
      createdAt: new Date().toISOString(),
      ...message,
    };
    this.data.contactMessages.push(newMsg);
    await this.persist();
    return newMsg;
  }

  async markContactMessageRead(id: string, adminUsername: string): Promise<void> {
    const msg = this.data.contactMessages.find((m) => m.id === id);
    if (msg) {
      msg.isRead = true;
      this.logAudit({
        action: 'MARK_MESSAGE_READ',
        entityType: 'ContactMessage',
        entityId: id,
        details: `Message marked as read by ${adminUsername}`,
        performedBy: adminUsername,
      });
      await this.persist();
    }
  }
}

export const db = new DatabaseManager();
