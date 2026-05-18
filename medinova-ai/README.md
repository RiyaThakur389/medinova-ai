# 🏥 MediNova AI — Hospital Management System

> A full-stack, AI-powered Hospital Management System built with the MERN stack, featuring role-based dashboards, real-time appointment booking, digital prescriptions, and Groq AI integration.

![MediNova AI](https://img.shields.io/badge/Stack-MERN-blue?style=flat-square)
![AI](https://img.shields.io/badge/AI-Groq%20%2F%20Llama%203.3-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

### 🔐 Authentication
- JWT-based auth with bcrypt password hashing
- Three roles: **Admin**, **Doctor**, **Patient**
- Protected routes per role

### 👨‍💼 Admin Panel
- Dashboard with live analytics (charts via Recharts)
- Add / Edit / Delete Doctors
- Manage Patients (activate / deactivate)
- Appointment oversight with status management
- Reports & top-performing doctors

### 👨‍⚕️ Doctor Panel
- Appointment queue with Approve / Reject actions
- Patient list with medical details
- Digital prescription writer with AI assist
- PDF prescription generation

### 🧑‍🤝‍🧑 Patient Panel
- 3-step appointment booking flow with live slot availability
- Appointment history with cancel option
- Prescription viewer & PDF download
- Profile management (vitals, allergies, emergency contact)
- AI Symptom Checker
- 24/7 AI Health Chatbot

### 🤖 AI Features (Groq API)
| Feature | Route | Access |
|---|---|---|
| Symptom Checker | `POST /api/ai/symptom-check` | Patient |
| Health Chatbot | `POST /api/ai/chat` | All |
| Prescription Assistant | `POST /api/ai/prescription-assist` | Doctor |
| Report Summarizer | `POST /api/ai/report-summary` | All |

---

## 🗂️ Project Structure

```
medinova-ai/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   ├── prescriptionController.js
│   │   ├── aiController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   ├── Appointment.js
│   │   └── Prescription.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── adminRoutes.js
│   │   └── userRoutes.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── common/
    │   │       ├── Sidebar.jsx
    │   │       ├── DashboardLayout.jsx
    │   │       └── UI.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── auth/         Login, Register
    │   │   ├── admin/        Dashboard, Doctors, Patients, Appointments, Reports
    │   │   ├── doctor/       Dashboard, Appointments, Patients, Prescriptions, WritePrescription
    │   │   ├── patient/      Dashboard, BookAppointment, Appointments, Prescriptions, Profile
    │   │   ├── AIAssistant.jsx
    │   │   ├── SymptomChecker.jsx
    │   │   └── Landing.jsx
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas URI
- Groq API key → https://console.groq.com

---

### 1. Clone & Install

```bash
git clone <repo-url>
cd medinova-ai

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

**Backend** — copy `.env.example` to `.env`:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/medinova_ai
JWT_SECRET=your_super_secret_key_here
GROQ_API_KEY=gsk_your_groq_key_here
FRONTEND_URL=http://localhost:5173
```

**Frontend** — copy `.env.example` to `.env`:

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 1 Admin, 5 Doctors, 10 Patients
- 15 sample appointments
- Sample prescriptions

---

### 4. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@hospital.com | password123 |
| **Doctor** | arjun.sharma@hospital.com | password123 |
| **Patient** | amit.kumar@gmail.com | password123 |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/change-password` | Change password |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List all doctors |
| GET | `/api/doctors/:id` | Get doctor |
| POST | `/api/doctors` | Create doctor (Admin) |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor (Admin) |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get appointments (filtered by role) |
| POST | `/api/appointments` | Book appointment (Patient) |
| GET | `/api/appointments/slots/:doctorId` | Get available slots |
| PUT | `/api/appointments/:id/status` | Update status (Doctor/Admin) |
| PUT | `/api/appointments/:id/cancel` | Cancel (Patient) |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prescriptions` | Get prescriptions |
| POST | `/api/prescriptions` | Create prescription (Doctor) |
| GET | `/api/prescriptions/:id/pdf` | Download PDF |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/symptom-check` | Symptom analysis |
| POST | `/api/ai/chat` | Health chatbot |
| POST | `/api/ai/prescription-assist` | AI prescription suggestions (Doctor) |
| POST | `/api/ai/report-summary` | Summarize medical report |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats + charts |
| GET | `/api/admin/patients` | All patients |
| PUT | `/api/admin/users/:id/toggle-status` | Activate/deactivate user |
| GET | `/api/admin/reports` | Reports data |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + custom glassmorphism |
| Charts | Recharts |
| Routing | React Router v6 |
| HTTP | Axios |
| Notifications | React Hot Toast |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| AI | Groq SDK (Llama 3.3 70B) |
| PDF | PDFKit |
| File Upload | Multer + Cloudinary |

---

## 🌱 Getting a Groq API Key

1. Go to https://console.groq.com
2. Sign up / log in
3. Click **API Keys** → **Create API Key**
4. Copy and paste into `GROQ_API_KEY` in your `.env`

Groq provides a **free tier** with generous rate limits for Llama 3.3 70B.

---

## 🚢 Production Deployment

### Backend (Railway / Render / Heroku)
```bash
cd backend
npm start
```

Set environment variables in your hosting dashboard.

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# dist/ folder is the output
```

Set `VITE_API_URL=https://your-backend-url.com/api`

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use for personal or commercial projects.

---

<div align="center">
Built with ❤️ using MERN Stack + Groq AI<br>
<strong>MediNova AI — Healthcare Reimagined</strong>
</div>
