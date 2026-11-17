# Campus OS – AI-Powered College Management System

A production-grade college ERP system designed for role-based academic administration, student admissions, fee processing, attendance tracking, and AI insights.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI primitives, Lucide Icons, Shadcn UI
- **State & Data**: React Router v6, TanStack Query, Recharts
- **Authentication & Backend**: Firebase Auth & Firestore, with unified browser fallback storage for demo simulation
- **Deployment**: Vercel / Netlify (SPA rewrite configured)

---

## 🛠️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### 2. Installation
```bash
# Navigate to the project directory
cd campusos

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase project credentials:
```bash
cp .env.example .env
```

### 4. Running Locally
```bash
# Start development server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build
```

---

## 🔑 Default Demo Credentials

Campus OS supports a two-step institutional authentication flow:

### Step 1: College Login
- **College Email**: `mit@college.edu`
- **Password**: `password` (or `mit@123`)

### Step 2: Role Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@gmail.com` | `admin123` |
| **Faculty** | `ranjith.kc@gmail.com` | `faculty123` |
| **Student** | `aarav1@gmail.com` | `student123` |

*Note: Alternatively, you can click **"Enter Demo Mode"** on the login screen to jump directly into the dashboard.*

---

## 📦 Features

1. **Role-Based Portals**: Isolated dashboards for Administrators, Faculty, and Students.
2. **Online Admissions**: Public entrance exam-based application form with automated branch allocation and admin approval workflow.
3. **Fee Management**: Student fee tracking, status badges (Full, Half, Pending), simulated UPI/QR code payment, and downloadable receipts.
4. **Attendance Tracking**: Date-based daily attendance ledger with instant percentage calculations and low-attendance warnings (<75%).
5. **AI Insights**: Student dropout risk scoring and fee collection trends.
6. **Workflow Automation**: Rule-based alerts for fee defaulters, low attendance, and admission notices.

---

## 🚢 Deployment

The repository includes [`vercel.json`](./vercel.json) and [`public/_redirects`](./public/_redirects) for seamless single-page application routing on Vercel and Netlify.

When deploying from GitHub to Vercel:
- **Framework Preset**: Vite
- **Root Directory**: `campusos` (if deploying from a multi-directory repo) or `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
