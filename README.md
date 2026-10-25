# Aashirwad Hospital — Website & Demonstration System

A polished, client-ready healthcare website and appointment management demonstration for **Aashirwad Hospital, Hingne Khurd, Pune, Maharashtra, India**.

> **Hospital Slogan:** *"Your Health, Our Priority."*

---

## 1. Verified Hospital Details

- **Hospital Name:** Aashirwad Hospital
- **Address:** 213/26, Ram Mandir Temple Lane, Damodar Nagar Road, near Rokdoba Temple, Hingne Khurd, Pune, Maharashtra 411051, India
- **Contact Telephone:** +91 9822333770 (with click-to-call link)
- **Doctor 1:** Dr. Nandkumar Bhutada
  - **Specialty:** Family Physician and Diabetologist
  - **Experience:** 22 years
  - **Qualification:** M.D. (Diet) (Ayu.)
- **Doctor 2:** Dr. Poonam Bhutada
  - **Specialty:** Family Physician and Consulting Gynaecologist
  - **Experience:** 20 years
  - **Qualification:** B.A.M.S., D.Y.A. (Ayu.)
- **Consultation Hours:** Monday to Saturday: Morning 10:00 AM – 1:30 PM & Evening 5:30 PM – 8:30 PM. (Sunday Closed).

*All medical degrees, physician identities, and hospital locations preserve verified information accurately without fabrication.*

---

## 2. Immediate Demonstration Features (Zero Paid Credentials Needed)

This version is designed to run in the current environment with **zero external API keys, database setups, or paid accounts**:

1. **Client Presentation Portal:**
   - **Hero Section:** Clinical navy/sky blue palette, hospital slogan, direct action buttons (`Book Consultation (Demo)` and `Call +91 9822333770`).
   - **Doctor Profiles:** Cards for Dr. Nandkumar Bhutada and Dr. Poonam Bhutada with authorized silhouette avatars, verified degrees, clinical focus areas, and weekly schedule modal.
   - **Services Section:** In accordance with medical ethics guidelines, public services are kept in an honest *"Our services will be listed here soon"* state until the hospital confirms which services are offered.
   - **Multi-Step Appointment Booking Demo:** Interactive 4-step wizard with illustrative sample slots, client-side input validation, sample summary, and a printable demo booking slip (`DEMO-ASH-XXXXX`). Submissions are visibly labeled as demonstrations.
   - **Appointment Status Lookup Demo:** Instant test lookup with sample codes (e.g. `DEMO-ASH-84920`).
   - **Location & Directions:** Full address, landmark note (near Rokdoba Temple, Ram Mandir Lane), Google Maps directions link, and interactive inquiry form.

2. **Staff Dashboard Preview (`/admin` or via "Staff Dashboard Preview"):**
   - Clickable directly from the header without requiring fake passwords.
   - **Operations Overview:** Real-time metrics for today's OPD, upcoming, confirmed, pending, completed, and cancelled consultations.
   - **Appointments Desk:** Searchable, filterable table with interactive status controls (`Confirmed`, `Completed`, `Cancelled`, `Pending`) and internal private staff notes editor.
   - **Doctors & Schedule Controls:** Weekly consultation shifts and holiday exceptions management.
   - **Services Catalog Preview:** Review draft medical offerings before hospital publication.
   - **Contact Messages Desk:** Review patient inquiries.

---

## 3. Technology Architecture & Future Firebase Integration

The codebase uses a clean, decoupled service architecture:
- **`src/services/mockData.ts`**: Contains all verified hospital info and fictional presentation fixtures.
- **`src/services/hospitalService.ts`**: Clean abstraction layer. All UI components call methods on `hospitalService`.
- **Future Firebase Connection:** When ready, replace the in-memory calls in `hospitalService.ts` with Cloud Firestore (`collection()`, `getDocs()`, `addDoc()`, `updateDoc()`) and Firebase Authentication (`signInWithPopup(auth, provider)`). No UI redesign is needed.

---

## 4. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (runs on port 3000)
npm run dev

# 3. Build for production preview
npm run build
npm run preview
```

---

## 5. Production Launch Checklist

Before making the application live for real patient bookings:

- [ ] **Hospital Confirmation:** Verify exact clinical service offerings and consultation fees.
- [ ] **Firebase Setup:** Enable Firebase Authentication (Google Sign-In or Staff Email) and Cloud Firestore for persistent appointment records.
- [ ] **Doctor Verification:** Replace placeholder silhouettes with authorized hospital staff portrait photos.
- [ ] **Notification Gateway (Optional):** Add `RESEND_API_KEY` or an SMS provider if email/SMS appointment confirmations are desired.
- [ ] **Custom Domain & SSL:** Configure custom domain (e.g. `aashirwadhospitalpune.in`) pointing to hosting with HTTPS enabled.
