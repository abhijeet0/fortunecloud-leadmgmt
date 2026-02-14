FORTUNE CLOUD – FRANCHISE APP
Software Requirement Specification (SRS) – Developer Document
Version: 1.0

Note:
Some basic changes or additional requirements may come up during the actual development process. These changes will be discussed and finalised as the app progresses.

1. System Overview
   The Fortune Cloud Franchise App will be available on the Google Play Store. Franchise partners across India can download the app, sign up, and submit student leads. Admin will manage these leads through a web dashboard. Once a student enrolls, the franchise partner earns a commission based on a percentage of the admission amount.

2. User Roles
3. Franchise Partner (Mobile App)
4. Admin (Web Dashboard)
5. Finance/Admin (Commission Management)

6. Franchise Mobile App Requirements

3.1 Signup & Login

- Signup using Phone Number + OTP.
- Collect basic info: Franchise/Owner Name, Email ID, City.
- Login using OTP or password.

  3.2 Lead Submission Form
  Fields:

- Student Name (Mandatory)
- Qualification (Mandatory)
- Stream (Mandatory)
- Year of Passing (Optional)
- City (Mandatory)
- Phone Number (Mandatory)
- Email ID (Optional)

Validation:

- Mandatory fields required
- Phone and email format check

  3.3 Franchise Dashboard

- Total leads submitted
- Leads by status
- Commission summary

  3.4 Lead Tracking

- View all submitted leads
- Filter by status
- Search by name/phone
- View status history, remarks, commission info

  3.5 Commission

- View commission percentage, admission amount, commission amount
- Status: Pending, Approved, Paid

4. Admin Web Dashboard Requirements

4.1 Admin Login

- Email & Password login
- Role-based access

  4.2 Lead Management

- View all leads
- Filters: franchise, city, status, date
- Search by student name/phone
- View full details and history

  4.3 Update Lead Status
  Statuses:

- Lead acknowledged
- HOT
- WARM
- Unspoken
- COLD
- Visited
- Enrolled
  Remarks required for selected statuses.

  4.4 Enrollment & Commission Creation

- Admin enters Admission Amount
- Commission auto-calculates
- Commission record created with status Pending
- Finance/Admin updates to Approved/Paid

  4.5 Reports

- Leads by status
- Leads by franchise
- Enrolled list
- Commission summary

5. Lead Status Flow
   Submitted → Lead acknowledged → HOT → WARM → Unspoken → COLD → Visited → Enrolled

6. Backend Data Models
   Franchise, Lead, Lead Status History, Commission

7. APIs Required
   Franchise:

- signup, verify-otp, login
- create lead, list leads, view single lead
- commission summary

Admin:

- login
- list all leads
- update lead status
- enrollment update
- commission update

8. Non-Functional Requirements

- API response <2 sec
- HTTPS
- JWT auth
- Firebase push notifications
- Daily DB backup

9. Acceptance Criteria

- Franchise can sign up, submit leads
- Admin updates statuses with remarks
- Status reflects instantly
- Commission auto-calculates
- Reports functioning

10. Developer Deliverables

- Android App (APK + AAB)
- Admin Web Dashboard
- Backend + APIs
- Notifications
- Deployment support
- API documentation
