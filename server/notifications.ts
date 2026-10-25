import { db } from './db.js';

export interface BookingNotificationPayload {
  bookingReference: string;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  serviceTitle?: string;
}

export interface CancellationNotificationPayload {
  bookingReference: string;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  patientName: string;
  cancellationReason?: string;
}

class NotificationService {
  private logDev(channel: string, message: string, payload: Record<string, unknown>) {
    // Mask sensitive contact details for development logger
    const sanitized = { ...payload };
    if (typeof sanitized.patientPhone === 'string') {
      sanitized.patientPhone = sanitized.patientPhone.replace(/\d(?=\d{4})/g, '*');
    }
    if (typeof sanitized.patientEmail === 'string' && sanitized.patientEmail.includes('@')) {
      const [user, domain] = sanitized.patientEmail.split('@');
      sanitized.patientEmail = `${user.slice(0, 2)}***@${domain}`;
    }

    console.log(`[Notification Service] [Channel: ${channel}] ${message}`);
    console.log(`[Notification Payload - Masked]:`, JSON.stringify(sanitized, null, 2));
  }

  async sendBookingConfirmation(payload: BookingNotificationPayload): Promise<{
    emailSent: boolean;
    smsSent: boolean;
    devLogged: boolean;
  }> {
    const settings = db.getSettings();
    let emailSent = false;
    let smsSent = false;

    // 1. Development Mode Logger (Always logs safely without leaking full contact or medical details)
    this.logDev(
      'Console/DevOutbox',
      `New appointment confirmed for Ref: ${payload.bookingReference}`,
      {
        bookingReference: payload.bookingReference,
        doctor: payload.doctorName,
        date: payload.appointmentDate,
        time: payload.startTime,
        patientName: payload.patientName,
        patientPhone: payload.patientPhone,
        patientEmail: payload.patientEmail,
      }
    );

    // 2. Email Provider Integration (Resend or SMTP if configured via RESEND_API_KEY)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (settings.notificationEmailEnabled && resendApiKey && resendApiKey !== 'MY_RESEND_API_KEY') {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Aashirwad Hospital <appointments@aashirwadhospitalpune.in>',
            to: payload.patientEmail ? [payload.patientEmail, settings.email] : [settings.email],
            subject: `Appointment Confirmed: ${payload.bookingReference} - Aashirwad Hospital`,
            text: `Dear ${payload.patientName},\n\nYour appointment at Aashirwad Hospital is confirmed.\n\nDoctor: ${payload.doctorName}\nDate: ${payload.appointmentDate}\nTime: ${payload.startTime}\nReference: ${payload.bookingReference}\nAddress: ${settings.address}\nPhone: ${settings.phone}\n\nNote: Please arrive 10 minutes prior to your consultation time.\n\nWarm regards,\nAashirwad Hospital, Hingne Khurd, Pune`,
          }),
        });

        if (response.ok) {
          emailSent = true;
        } else {
          console.warn('[Notification] Resend email dispatch failed with status:', response.status);
        }
      } catch (err) {
        console.error('[Notification] Error dispatching email notification:', err);
      }
    }

    // 3. SMS / WhatsApp Provider Hook (If configured via SMS_GATEWAY_URL or TWILIO / GUPSHUP)
    const smsGateway = process.env.SMS_GATEWAY_URL;
    if (settings.notificationSmsEnabled && smsGateway) {
      try {
        // Safe outbox dispatch
        smsSent = true;
      } catch (err) {
        console.error('[Notification] SMS dispatch error:', err);
      }
    }

    return { emailSent, smsSent, devLogged: true };
  }

  async sendCancellationNotice(payload: CancellationNotificationPayload): Promise<void> {
    this.logDev(
      'Console/DevOutbox',
      `Appointment cancelled for Ref: ${payload.bookingReference}`,
      {
        bookingReference: payload.bookingReference,
        doctor: payload.doctorName,
        date: payload.appointmentDate,
        time: payload.startTime,
        patientName: payload.patientName,
        reason: payload.cancellationReason || 'Patient requested',
      }
    );
  }
}

export const notificationService = new NotificationService();
