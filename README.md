# Diabetes Care Ecosystem - Full-Stack EMR System

A comprehensive Electronic Medical Record (EMR) system for a Diabetes Specialist Clinic with **4 role-based portals**: Admin, Doctor, Lab Technician, and Patient.

## Architecture

**Backend:** Node.js + Express + MongoDB (Mongoose)  
**Frontend:** HTML5 + CSS3 + vanilla JavaScript (Chart.js)  
**Auth:** JWT tokens + bcrypt password hashing  
**Features:** Video consultation (WebRTC), lab result uploads (Multer), real-time glucose tracking

## Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 2. Install & Configure
```bash
cd webfordiabeticdoctor/backend
npm install
```

Create `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/diabetes_care
JWT_SECRET=your_super_secret_key_change_this
```

### 3. Seed Database
```bash
npm run seed
```

**Default Accounts:**
| Role | Phone | Password |
|------|-------|----------|
| Admin | 00000000000 | admin123 |
| Doctor | 11111111111 | doctor123 |
| Lab Tech | 33333333333 | lab123 |
| Patient | 22222222222 | patient123 |

### 4. Start Server
```bash
npm start       # production
npm run dev     # development with nodemon
```

### 5. Open Frontend
Open `index.html` in browser or use Live Server. The frontend auto-connects to `http://localhost:5000/api`.

## Project Structure

```
webfordiabeticdoctor/
├── index.html              # Landing page
├── login.html              # Login/Register
├── patient-portal.html     # Patient dashboard
├── doctor-dashboard.html   # Doctor portal
├── lab-dashboard.html      # Lab technician portal
├── admin-dashboard.html    # Admin portal
├── video-call.html         # Video consultation room
├── appointment.html        # Book appointment
├── shop.html               # Health shop
├── css/                    # Stylesheets
├── js/
│   ├── api.js              # API client + auth
│   └── main.js             # UI utilities
├── backend/
│   ├── server.js           # Express entry
│   ├── .env                # Config
│   ├── package.json        # Dependencies
│   ├── config/seed.js      # Database seeding
│   ├── models/             # 10 Mongoose schemas
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── Report.js
│   │   ├── GlucoseLog.js
│   │   ├── LabTest.js
│   │   ├── Prescription.js
│   │   ├── MedicalRecord.js
│   │   └── VideoSession.js
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   └── roleCheck.js    # RBAC
│   └── routes/             # 8 REST route files
│       ├── auth.js
│       ├── appointments.js
│       ├── reports.js
│       ├── patients.js
│       ├── doctors.js
│       ├── lab-tests.js
│       ├── video-sessions.js
│       └── admin.js
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Patient registration (auto-creates Patient record + UHID) |
| POST | /api/auth/login | Login for all roles |
| GET | /api/auth/me | Current user profile |

### Appointments
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/appointments | Patient |
| GET | /api/appointments/my | Patient |
| GET | /api/appointments/all | Admin/Doctor |
| PATCH | /api/appointments/:id/status | Admin/Doctor |
| DELETE | /api/appointments/:id | Patient (pending only) |

### Patients
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/patients/dashboard | Patient |
| GET | /api/patients/history | Patient |
| POST | /api/patients/glucose | Patient |
| GET | /api/patients/glucose | Patient |

### Doctors
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/doctors/me | Doctor |
| GET | /api/doctors/patients | Doctor |
| GET | /api/doctors/patients/:id | Doctor |
| GET | /api/doctors/patients/:id/history | Doctor |
| POST | /api/doctors/prescriptions | Doctor |
| POST | /api/doctors/medical-records | Doctor |
| POST | /api/doctors/lab-requests | Doctor |
| GET | /api/doctors/my-appointments | Doctor |
| GET | /api/doctors/video-sessions | Doctor |

### Lab Tests
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/lab-tests/pending | Lab/Admin |
| GET | /api/lab-tests | Lab/Admin/Doctor |
| GET | /api/lab-tests/:id | Lab/Admin/Doctor |
| PATCH | /api/lab-tests/:id/results | Lab |
| PATCH | /api/lab-tests/:id/upload | Lab (file upload) |
| PATCH | /api/lab-tests/:id/status | Lab |

### Video Sessions
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/video-sessions | Admin |
| GET | /api/video-sessions | Admin |
| GET | /api/video-sessions/my | Patient/Doctor |
| PATCH | /api/video-sessions/:id/join | Participant |
| PATCH | /api/video-sessions/:id/status | Admin |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/admin/stats | Admin/Doctor |
| GET | /api/admin/patients | Admin/Doctor |
| GET | /api/admin/patients/:id | Admin/Doctor |
| POST | /api/admin/create-doctor | Admin |
| POST | /api/admin/create-lab-tech | Admin |
| GET | /api/admin/doctors | Admin |
| GET | /api/admin/appointments | Admin |
| GET | /api/admin/lab-tests | Admin |
| GET | /api/admin/prescriptions | Admin |

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication with expiry
- Role-based access control (RBAC) middleware
- Rate limiting (100 req/15min)
- Helmet security headers
- CORS configuration
- File type/size validation for uploads
- Patients can only access their own data
- CNIC uniqueness enforced

## Clinical Workflow

1. **Patient** registers online (auto-generates UHID)
2. **Admin** assigns patient to a doctor
3. **Patient** books appointment (clinic, online, or home)
4. **Doctor** views patient at appointment, creates prescription, requests lab tests
5. **Lab** collects sample, performs tests, enters real results
6. **Patient** views lab results, glucose trends, prescriptions in portal
7. **Admin** monitors all activity via dashboard

## License

MIT
