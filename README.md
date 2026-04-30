# ⚡ RideSync — College Ride Sharing Platform

A full-stack MERN web application for college students to share rides safely and affordably. Features an advanced sequential **Path-Based Routing System**, a multi-tiered **Approval & Booking** workflow, and stringent **Phone Number Privacy Policies**.

---

## ✨ Core Features & Operations

1. **Dual-Role Model:** Users rigorously sign up as **Drivers** or **Passengers**. Drivers post rides, map their vehicle stats, and approve requests. Passengers browse real-time routes to request rides.
2. **Sequential Array Routing:** The system doesn't just do "Origin to Target". Ride paths are established as arrays (e.g. `[Vijayawada, Mangalagiri, Nedamaru, SRM]`). Passengers can dynamically book subpaths, and the MongoDB aggregation pipeline logically processes array bounds directly. Dropdowns dynamically update via dependent logic to only show logically possible destinations.
3. **Approval-Based Economy:** Passengers do not instantly join rides; they enter a **Pending** queue. They can securely request *multiple* simultaneous rides. When one driver clicks **Accept**, the system dynamically auto-cancels the passenger's remaining queues. 
4. **The Privacy Protocol:** Mobile contacts are strictly protected. The server hides `mobile` objects behind data scrubbers. Mobile numbers only surface to a driver and passenger *during an officially accepted active ride*, completely evaporating once the ride enters 'History'.

---

## 🗂️ Project Structure

```
fsd_project/
├── backend/                        # Node.js + Express API
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Register (provider/seeker), Login, Profile CRUD
│   │   ├── rideController.js       # Ride CRUD (providers only)
│   │   └── bookingController.js    # Join ride, bookings, history
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT protect
│   │   └── roleMiddleware.js       # providerOnly / seekerOnly guards
│   ├── models/
│   │   ├── User.js                 # User schema (role: provider | seeker)
│   │   ├── Ride.js                 # Ride schema
│   │   └── Booking.js              # Booking schema (seeker ↔ ride)
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth/*
│   │   ├── rideRoutes.js           # /api/rides/*
│   │   └── bookingRoutes.js        # /api/bookings/*
│   ├── .env                        # Environment variables
│   ├── server.js                   # Express app entry point
│   └── package.json
│
└── frontend/                       # React + Vite + Tailwind CSS
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx     # Global auth state (user, login, logout)
    │   ├── services/
    │   │   ├── api.js              # Axios instance + token interceptor
    │   │   ├── authService.js      # register, login, profile API calls
    │   │   ├── rideService.js      # ride CRUD API calls
    │   │   └── bookingService.js   # booking API calls
    │   ├── routes/
    │   │   └── AppRoutes.jsx       # All route definitions with guards
    │   ├── components/
    │   │   ├── Layout.jsx          # Sidebar + mobile topbar wrapper
    │   │   ├── Sidebar.jsx         # Role-aware navigation sidebar
    │   │   ├── ProtectedRoute.jsx  # Redirect to /login if not authenticated
    │   │   ├── RoleRoute.jsx       # Redirect to /dashboard if wrong role
    │   │   └── Notification.jsx    # Toast notification component
    │   ├── pages/
    │   │   ├── Landing.jsx         # Role selection (Provider / Seeker)
    │   │   ├── Login.jsx           # Login for both roles
    │   │   ├── RegisterProvider.jsx # Driver signup form
    │   │   ├── RegisterSeeker.jsx  # Passenger signup form
    │   │   ├── Dashboard.jsx       # Role-split dashboard
    │   │   ├── CreateRide.jsx      # [Provider] Create a new ride
    │   │   ├── MyRides.jsx         # [Provider] Manage created rides
    │   │   ├── AvailableRides.jsx  # [Seeker] Browse & join rides
    │   │   ├── JoinedRides.jsx     # [Seeker] View joined bookings
    │   │   ├── RideHistory.jsx     # History (role-aware)
    │   │   └── Profile.jsx         # View/edit profile (role-aware)
    │   ├── App.jsx                 # Root component
    │   ├── main.jsx                # React entry point
    │   └── index.css               # Tailwind + custom design system
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/ridesync
PORT=5000
JWT_SECRET=your_strong_secret_here
```

Start:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

---

## 🔑 API Endpoints

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register/provider` | Public | Register as driver |
| POST | `/api/auth/register/seeker` | Public | Register as passenger |
| POST | `/api/auth/login` | Public | Login (email or mobile) |
| GET | `/api/auth/profile` | Protected | Get own profile |
| PUT | `/api/auth/profile` | Protected | Update name/email/mobile |
| DELETE | `/api/auth/profile` | Protected | Delete account (cascade) |
| GET | `/api/rides` | Protected | All active rides (+ filters) |
| POST | `/api/rides` | Provider only | Create a ride |
| GET | `/api/rides/my` | Provider only | My created rides |
| PUT | `/api/rides/:id` | Provider only | Update ride status |
| DELETE | `/api/rides/:id` | Provider only | Delete ride |
| POST | `/api/bookings/:rideId` | Seeker only | Join a ride |
| GET | `/api/bookings/my` | Protected | My bookings |
| GET | `/api/bookings/ride/:rideId` | Provider only | Ride participants |
| GET | `/api/bookings/history` | Protected | Full ride history |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS |
| Routing | React Router DOM v7 |
| HTTP | Axios |
| State | Context API |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |

---

## ✉️ College Email Validation

Accepted domains: `.edu.in` · `.ac.in` · `.edu`

Example: `name@srmap.edu.in`
