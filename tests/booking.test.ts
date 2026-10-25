import { db } from '../server/db.js';
import { calculateAvailableSlots, getNowInKolkata } from '../server/availability.js';
import { hashPassword, verifyPassword, hashToken, generateManagementToken, createSession, getSessionUser } from '../server/auth.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n=======================================================');
  console.log('🧪 Aashirwad Hospital - Automated Test Suite');
  console.log('=======================================================\n');

  const { currentDate } = getNowInKolkata();
  const doctors = db.getDoctors(true);
  const doctor = doctors[0];

  // Helper for tomorrow's date in YYYY-MM-DD
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = tomorrowObj.toISOString().split('T')[0];

  // Helper for a future Monday (ensuring it's a weekday consultation day)
  const futureWeekdayObj = new Date();
  futureWeekdayObj.setDate(futureWeekdayObj.getDate() + 7);
  while (futureWeekdayObj.getDay() === 0) { // skip Sunday
    futureWeekdayObj.setDate(futureWeekdayObj.getDate() + 1);
  }
  const futureWeekday = futureWeekdayObj.toISOString().split('T')[0];

  // Past date
  const pastDate = '2020-01-01';

  // 1. Past dates rejection
  console.log('[Test 1] Date validation: past dates rejection');
  const pastResult = calculateAvailableSlots({ doctorId: doctor.id, date: pastDate });
  assert(pastResult.slots.length === 0, 'Rejects past date ' + pastDate);
  assert(!!pastResult.message?.includes('past'), 'Provides clear message when date is in the past');

  // 2. Booking an available slot
  console.log('\n[Test 2] Availability calculation for future weekday');
  const weekdayResult = calculateAvailableSlots({ doctorId: doctor.id, date: futureWeekday });
  assert(weekdayResult.slots.length > 0, `Generated ${weekdayResult.slots.length} consultation slots for ${futureWeekday}`);
  const firstAvailableSlot = weekdayResult.slots.find((s) => s.available);
  assert(!!firstAvailableSlot, 'Found at least one available consultation slot');

  // 3. Atomically booking a valid slot
  console.log('\n[Test 3] Atomic booking and unique reference generation');
  const rawToken = generateManagementToken();
  const tokenHash = hashToken(rawToken);

  let bookedApt: any;
  try {
    bookedApt = await db.bookAppointmentAtomic({
      doctorId: doctor.id,
      doctorName: doctor.name,
      patientName: 'Test Patient Kumar',
      patientPhone: '9822333770',
      patientEmail: 'patient.test@example.com',
      appointmentDate: futureWeekday,
      startTime: firstAvailableSlot!.time,
      endTime: firstAvailableSlot!.endTime,
      managementTokenHash: tokenHash,
    });
    assert(!!bookedApt.bookingReference, `Created booking reference: ${bookedApt.bookingReference}`);
    assert(bookedApt.bookingReference.startsWith('ASH-'), 'Booking reference follows ASH-YYYY-XXXXX format');
    assert(bookedApt.status === 'Confirmed', 'Booking is set to Confirmed');
  } catch (err: any) {
    assert(false, `Booking failed: ${err.message}`);
  }

  // 4. Preventing double-booking (slot conflict)
  console.log('\n[Test 4] Concurrency & Double-Booking Prevention');
  try {
    await db.bookAppointmentAtomic({
      doctorId: doctor.id,
      doctorName: doctor.name,
      patientName: 'Second Conflict Patient',
      patientPhone: '9876543210',
      appointmentDate: futureWeekday,
      startTime: firstAvailableSlot!.time,
      endTime: firstAvailableSlot!.endTime,
      managementTokenHash: hashToken(generateManagementToken()),
    });
    assert(false, 'Should have thrown error on double booking same slot');
  } catch (err: any) {
    assert(true, 'Successfully prevented double booking: ' + err.message);
  }

  // 5. Inactive doctor booking prevention
  console.log('\n[Test 5] Inactive Doctor Rejection');
  const tempDoc = await db.saveDoctor({
    name: 'Dr. Inactive Test',
    isActive: false,
    specialty: 'Testing',
  }, 'test-runner');

  try {
    await db.bookAppointmentAtomic({
      doctorId: tempDoc.id,
      doctorName: tempDoc.name,
      patientName: 'Patient Inactive Test',
      patientPhone: '9822333770',
      appointmentDate: futureWeekday,
      startTime: '10:00',
      endTime: '10:15',
      managementTokenHash: hashToken('tok'),
    });
    assert(false, 'Should reject booking with inactive doctor');
  } catch (err: any) {
    assert(true, 'Rejected booking with inactive doctor: ' + err.message);
  }

  // 6. Schedule exceptions and holiday handling
  console.log('\n[Test 6] Schedule Exception (Day Off / Holiday)');
  const holidayDate = '2026-11-15';
  await db.addScheduleException({
    doctorId: doctor.id,
    date: holidayDate,
    isDayOff: true,
    reason: 'Diwali Hospital Holiday',
  }, 'test-runner');

  const holidaySlots = calculateAvailableSlots({ doctorId: doctor.id, date: holidayDate });
  assert(holidaySlots.slots.length === 0, 'No slots generated on holiday/leave date');
  assert(holidaySlots.message?.includes('Diwali') === true, 'Returned specific holiday reason message');

  // 7. Security: Password hashing and verification
  console.log('\n[Test 7] Security & Cryptographic Password Hashing');
  const plain = 'StrongHospitalPassword2026!';
  const { hash, salt } = hashPassword(plain);
  assert(verifyPassword(plain, hash, salt), 'Password verifies with matching hash and salt');
  assert(!verifyPassword('WrongPassword', hash, salt), 'Rejects incorrect password');

  // 8. Security: Management token hashing & authorization
  console.log('\n[Test 8] Patient Lookup and Management Token Authorization');
  const refRecord = db.getAppointmentByReference(bookedApt.bookingReference);
  assert(!!refRecord, 'Found appointment record by booking reference');
  assert(refRecord!.managementTokenHash === tokenHash, 'Matches hashed management token');
  assert(refRecord!.managementTokenHash !== rawToken, 'Raw token is NOT stored plain in database');

  // 9. Unauthorized admin session verification
  console.log('\n[Test 9] Administrative Session Security');
  const fakeSessionUser = getSessionUser('non-existent-session-id');
  assert(fakeSessionUser === null, 'Rejects forged or missing session token');

  const realAdmin = db.getAdminByUsername('admin');
  assert(!!realAdmin, 'Verified seeded initial admin exists');
  const validSession = createSession(realAdmin!.id);
  const authorizedUser = getSessionUser(validSession);
  assert(authorizedUser?.username === 'admin', 'Valid session resolves to admin user');

  // 10. Status lifecycle transition & audit log
  console.log('\n[Test 10] Appointment Status Transitions and Audit Logging');
  await db.updateAppointmentStatus(bookedApt.id, 'Completed', 'Dr. Nandkumar Bhutada', 'Consultation finished');
  const updatedApt = db.getAppointmentById(bookedApt.id);
  assert(updatedApt?.status === 'Completed', 'Status correctly transitioned to Completed');

  const history = db.getStatusHistory(bookedApt.id);
  assert(history.length >= 2, `Recorded ${history.length} status transition history events`);
  assert(history[0].newStatus === 'Completed', 'Latest status history entry reflects Completed');

  const auditLogs = db.getAuditLogs(10);
  assert(auditLogs.length > 0, 'Audit log records actions persistently');

  console.log('\n=======================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('=======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((e) => {
  console.error('Fatal Test Runner Error:', e);
  process.exit(1);
});
