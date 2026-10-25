/**
 * Aashirwad Hospital - MongoDB / Mongoose Data Schema Definitions
 * For production environments connecting to MongoDB Atlas or local MongoDB instances.
 */

export interface MongoDoctorSchema {
  name: string;
  slug: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  bio: string;
  photoUrl?: string;
  isActive: boolean;
  consultationDurationMinutes: number;
  bufferMinutes: number;
  maxDailyBookings: number;
  consultationFeeNote?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoAppointmentSchema {
  bookingReference: string; // unique indexed
  managementTokenHash: string; // SHA-256
  doctorId: string;
  doctorName: string;
  serviceId?: string;
  serviceName?: string;
  patientName: string;
  patientPhone: string; // indexed
  patientEmail?: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'Pending' | 'Confirmed' | 'Rescheduled' | 'Cancelled' | 'Completed' | 'No-show';
  internalNotes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const MongoIndexes = {
  // Compound unique index for strict double-booking prevention in MongoDB:
  // db.appointments.createIndex({ doctorId: 1, appointmentDate: 1, startTime: 1 }, { unique: true, partialFilterExpression: { status: { $ne: "Cancelled" } } })
  appointmentUniqueConstraint: {
    doctorId: 1,
    appointmentDate: 1,
    startTime: 1,
  },
};
