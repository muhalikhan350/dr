# Dr. Diabetes Care Center - Full-Stack Application

## Architecture
- **Frontend**: Static HTML/CSS/JS (served by Express)
- **Backend**: Node.js + Express + MongoDB
- **Auth**: JWT-based with role-based access control
- **File Uploads**: Multer for lab reports (PDF/images)

## Project Structure
```
webfordiabeticdoctor/
├── index.html              # Landing page (public)
├── login.html              # Login/Register (public)
├── appointment.html        # Book appointment (public, auth for submit)
├── patient-portal.html     # Patient dashboard (protected)
├── admin-dashboard.html    # Admin/Doctor dashboard (protected)
├── shop.html               # Health shop (public)
├── css/                    # All stylesheets
├── js/
│   ├── main.js            # UI interactions, charts
│   └── api.js             # Backend API client + auth helpers
├── backend/
│   ├── server.js          # Express server entry
│   ├── .env               # Environment config
│   ├── package.json       # Dependencies
│   ├── config/
│   │   └── seed.js        # Seed admin/doctor accounts
│   ├── models/
│   │   ├── User.js        # Patient/Doctor/Admin schema
│   │   ├── Appointment.js # Appointment schema
│   │   ├── Report.js      # Lab report schema
│   │   └── GlucoseLog.js  # Glucose reading schema
│   ├── middleware/
│   │   ├── auth.js        # JWT verification
│   │   └── roleCheck.js   # Role-based access
│   └── routes/
│       ├── auth.js        # Register, Login, Me
│       ├── appointments.js # Book, list, manage
│       ├── reports.js      # Upload, view, download
│       ├── patients.js     # Dashboard, glucose logs
│       └── admin.js        # Stats, patient list, create doctor
└── backend/uploads/        # Uploaded lab reports
```

## Setup Instructions

### 1. Install MongoDB
- Download and install MongoDB Community Server
- Start MongoDB service (mongod)

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Seed Database (Create admin/doctor accounts)
```bash
npm run seed
```
Default accounts:
- Admin: phone=00000000000, password=admin123
- Doctor: phone=11111111111, password=doctor123

### 4. Start Server
```bash
npm start
# or for development:
npm run dev
```
Server runs on http://localhost:5000

### 5. Open Frontend
Open `index.html` in browser (or use Live Server).
The frontend will auto-connect to `http://localhost:5000/api`.

## API Endpoints

### Auth
- `POST /api/auth/register` - Patient registration
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Get current user

### Appointments
- `POST /api/appointments` - Book appointment (patient)
- `GET /api/appointments/my` - My appointments (patient)
- `GET /api/appointments/all` - All appointments (admin/doctor)
- `PATCH /api/appointments/:id/status` - Update status (admin/doctor)
- `DELETE /api/appointments/:id` - Cancel (patient, pending only)

### Reports
- `POST /api/reports/upload` - Upload report (admin/doctor)
- `GET /api/reports/my` - My reports (patient)
- `GET /api/reports/all` - All reports (admin/doctor)
- `GET /api/reports/:id` - Single report
- `DELETE /api/reports/:id` - Delete report (admin/doctor)

### Patient Dashboard
- `GET /api/patients/dashboard` - Dashboard data
- `POST /api/patients/glucose` - Log glucose reading
- `GET /api/patients/glucose` - Glucose history

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/patients` - Patient list
- `GET /api/admin/patients/:id` - Patient details
- `POST /api/admin/create-doctor` - Create doctor account

## What Was Changed (Frontend -> Full-Stack)

### Removed
- Fake login with hardcoded credentials
- Static patient data arrays
- Fake appointment success messages
- Static glucose chart data
- Fake registration with random patient ID

### Added
- Real JWT authentication
- Role-based access (patient/admin/doctor)
- MongoDB database with schemas
- REST API for all operations
- File upload for lab reports
- Real-time dashboard data from API
- Auth-aware navigation
- Route protection middleware

## Security Features
- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Role-based route protection
- Rate limiting (100 requests per 15 min)
- Helmet security headers
- CORS configuration
- File type validation for uploads
- Patients can only access their own data

