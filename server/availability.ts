import { db } from './db.js';
import type { AvailableSlot, TimeShift } from './types.js';

export function getNowInKolkata(): { currentDate: string; currentTime: string } {
  const now = new Date();
  const dtf = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(now);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const currentDate = `${partMap.year}-${partMap.month}-${partMap.day}`;
  const currentTime = `${partMap.hour}:${partMap.minute}`;

  return { currentDate, currentTime };
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calculateAvailableSlots(params: {
  doctorId: string;
  date: string; // YYYY-MM-DD
}): { slots: AvailableSlot[]; message?: string } {
  const { doctorId, date } = params;

  // Basic date format validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { slots: [], message: 'Invalid date format. Expected YYYY-MM-DD.' };
  }

  const { currentDate, currentTime } = getNowInKolkata();

  // Reject past dates
  if (date < currentDate) {
    return { slots: [], message: 'Cannot book appointments for past dates.' };
  }

  const doctor = db.getDoctorById(doctorId);
  if (!doctor || !doctor.isActive) {
    return { slots: [], message: 'This doctor is currently not available for bookings.' };
  }

  // Parse day of week in Kolkata timezone
  const [y, m, d] = date.split('-').map(Number);
  // UTC noon to avoid timezone boundary shifts
  const targetDateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dayOfWeek = targetDateObj.getUTCDay(); // 0 is Sunday, 1 is Monday ...

  // Check schedule exception (leave, holiday, custom hours)
  const exceptions = db.getScheduleExceptions(doctorId);
  const dateException = exceptions.find((ex) => ex.date === date);

  let shifts: TimeShift[] = [];

  if (dateException) {
    if (dateException.isDayOff) {
      return {
        slots: [],
        message: dateException.reason || 'Doctor is on leave or unavailable on this date.',
      };
    }
    if (dateException.customShifts && dateException.customShifts.length > 0) {
      shifts = dateException.customShifts;
    }
  }

  // If no custom shifts from exception, consult weekly schedule
  if (shifts.length === 0) {
    const weekly = db.getWeeklySchedule(doctorId);
    if (!weekly) {
      return { slots: [], message: 'Consultation hours not configured for this doctor.' };
    }

    const dayConfig = weekly.days.find((d) => d.dayOfWeek === dayOfWeek);
    if (!dayConfig || !dayConfig.isWorkingDay || dayConfig.shifts.length === 0) {
      return { slots: [], message: 'The doctor does not have consultation hours on this day.' };
    }

    shifts = dayConfig.shifts;
  }

  // Retrieve existing appointments for this date & doctor
  const existingAppointments = db
    .getAppointments({ doctorId, date })
    .filter((a) => a.status !== 'Cancelled');

  // Check max daily bookings
  if (existingAppointments.length >= doctor.maxDailyBookings) {
    return { slots: [], message: 'All consultation slots are fully booked for this date.' };
  }

  const duration = doctor.consultationDurationMinutes || 15;
  const buffer = doctor.bufferMinutes || 0;
  const slotInterval = duration + buffer;

  const slots: AvailableSlot[] = [];
  const bookedTimes = new Set(existingAppointments.map((a) => a.startTime));

  for (const shift of shifts) {
    const shiftStart = timeToMinutes(shift.startTime);
    const shiftEnd = timeToMinutes(shift.endTime);

    for (let current = shiftStart; current + duration <= shiftEnd; current += slotInterval) {
      const slotStartTime = minutesToTime(current);
      const slotEndTime = minutesToTime(current + duration);

      // Check if slot has already passed today
      if (date === currentDate && slotStartTime <= currentTime) {
        slots.push({
          time: slotStartTime,
          endTime: slotEndTime,
          available: false,
          reason: 'Time passed',
        });
        continue;
      }

      // Check if already booked
      if (bookedTimes.has(slotStartTime)) {
        slots.push({
          time: slotStartTime,
          endTime: slotEndTime,
          available: false,
          reason: 'Already booked',
        });
        continue;
      }

      slots.push({
        time: slotStartTime,
        endTime: slotEndTime,
        available: true,
      });
    }
  }

  return { slots };
}
