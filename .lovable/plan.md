

# SmartERP+ – AI-Powered College Management System

## Overview
A production-grade SaaS ERP for Tier-2/Tier-3 Indian colleges with role-based dashboards, admission workflows, fee management, attendance tracking, and AI insights. Built with React + Tailwind + Supabase.

---

## 1. Foundation & Layout
- **Sidebar + Topbar layout** with collapsible navigation (Zoho-style)
- Topbar: profile avatar, notification bell, global search, breadcrumbs
- Responsive design for mobile and desktop
- Toast notifications, loading skeletons, modal system, error boundaries

## 2. Landing Page (Public)
- Hero section with "SmartERP+" branding and CTA
- Features grid (Admissions, Fees, Attendance, Reports, AI Insights)
- Branches offered (CS, Mechanical, ECE, Civil)
- About section and footer
- "Get Started" → Signup

## 3. Authentication (Supabase Auth)
- **Signup**: College registration form (college name, admin email, password)
- **Login**: Email/password with role-based redirect
- **Forgot Password**: Reset flow with email link
- **Roles**: Admin, Faculty, Student (stored in `user_roles` table with RLS)
- After login → redirect to role-specific dashboard

## 4. Database Schema (Supabase/Postgres)
- **colleges**: id, name, created_at
- **profiles**: id, user_id, college_id, full_name, role reference
- **user_roles**: id, user_id, role (enum: admin/faculty/student)
- **branches**: id, college_id, name (CS, Mechanical, ECE, Civil)
- **students**: id, user_id, college_id, branch_id, usn, name, year, phone, email, admission_date
- **fees**: id, student_id, amount, paid_amount, status (full/half/pending), payment_date, receipt_number
- **attendance**: id, student_id, date, status (present/absent), marked_by
- **payments**: id, student_id, amount, razorpay_payment_id, status, created_at

Pre-seed with 200 students across 4 branches with realistic Indian names and USNs.

## 5. Admin Dashboard
- **Summary cards**: Total students, fees collected, pending fees, attendance rate
- **Charts**: Branch-wise distribution (pie), monthly fee collection (bar), attendance trends (line)
- **Alerts panel**: Low attendance (<75%) students, fee defaulters
- **Activity log**: Recent actions (admissions, payments, attendance)

## 6. Admission Module
- Public admission form: select branch → fill details → proceed to payment
- Admin view: list of applications, approve/reject
- On payment success → auto-create student record in database

## 7. Payment System (Razorpay)
- Edge function to create Razorpay orders and verify payments
- "Pay Fees" button → Razorpay checkout popup
- On success: update fee status, generate receipt, store transaction
- Receipt view with download option
- *Simulated mode available if no Razorpay keys*

## 8. Student Module
- Searchable/filterable table of all 200 students
- Filters: branch, year, fee status, attendance range
- Click row → detailed student profile (info, fees, attendance history, payment history)

## 9. Fees Module
- Overview: total collected vs pending
- Student-wise fee table with status badges (Full ✅, Half 🟡, Pending 🔴)
- "Pay Now" button per student → triggers payment flow
- Auto-updates after successful payment

## 10. Attendance Module
- Faculty view: select branch/section → mark attendance for date
- Bulk mark (present all, then toggle absent)
- Auto-calculate attendance percentage per student
- Alert badge if student <75%

## 11. Reports Module
- Generate student reports, fee reports, attendance reports
- Filter by branch, date range, status
- Table views with summary statistics
- PDF export using browser print

## 12. AI Insights Panel (Mock AI)
- Fee defaulter analysis with risk scoring
- Low attendance students list with trends
- Summary cards with recommendations
- "Students likely to drop out" prediction (mock algorithm based on attendance + fees)

## 13. Automation (Simulated n8n)
- Visual workflow display showing automation rules
- Alert triggers: attendance <75% → notification, fees pending >30 days → alert
- Notifications appear in the topbar bell icon
- Automation log showing triggered events

## 14. Role-Based Views
- **Admin**: Full access to all modules
- **Faculty**: Attendance marking, student list (read-only), reports
- **Student**: Own profile, fee status, attendance, pay fees

## 15. Seed Data
- 200 students with realistic Indian names, USNs, across 4 branches
- Randomized fee statuses and attendance records
- Sample payment history

