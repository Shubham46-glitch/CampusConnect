# 🎓 CampusConnect — Smart Campus Management Platform

**CampusConnect** is a modern, full-stack, enterprise-grade **Smart College & University Management SaaS Platform** designed to seamlessly connect **Students**, **Faculty**, and **Administrators** into a unified digital ecosystem.

Built with a high-performance **MERN Stack** (MongoDB Atlas, Express.js, React.js, Node.js), CampusConnect provides real-time dashboard analytics, automated notifications, coursework submission & grading workflows, campus event management, grievance resolution tracking, and role-based access control (RBAC).

---

## 🌟 Key Features Overview

### 1. 🔑 Authentication & Security
- **JWT Authentication**: Stateless, token-based authentication using JSON Web Tokens.
- **Password Security**: Salted password hashing with `bcryptjs`.
- **Role-Based Access Control (RBAC)**: Strict role separation between `student`, `faculty`, and `admin` on both backend REST endpoints and React router view guards.
- **User Profile Management**: User profile page (`/profile`) allowing users to edit personal details (`Name`, `Department`, `Roll Number` / `Employee ID`). Role and Email are strictly read-only to prevent privilege escalation.

### 2. 📊 Role-Aware Dashboards
- **Student Dashboard**: Linear & Vercel-inspired SaaS dashboard featuring:
  - Hero Welcome Banner with dynamic time-based greetings (`GOOD EVENING 👋`), student department, and roll number.
  - 4 Differentiated Stat Cards (Upcoming Events, Registered Events, Active Assignments, Pending Assignments).
  - Quick Action Shortcuts (`Events`, `Assignments`, `Announcements`, `Submit Grievance`).
  - Horizontal Event Date-Block Previews.
  - Coursework Progress & Status Cards.
  - Real-Time Campus Activity Timeline Feed.
  - Complaint Resolution Stack Widget.
- **Faculty Dashboard**: Real-time metrics for events created, active assignments posted, pending submission grading queue, and published announcements.
- **Admin Dashboard**: System-wide college metrics, student & faculty counts, grievance resolution rate, and total events.

### 3. 🔔 Real-Time Notification Engine
- In-app notification center storing user-specific notifications in MongoDB.
- Automated activity triggers for:
  - New assignment posted / Deadline approaching
  - Assignment graded with feedback
  - Event registration confirmation / Event update / Event cancellation
  - Complaint status updated (`Pending` → `In Progress` → `Resolved`)
  - New campus announcement published
- Unread badge counter, mark-as-read, and mark-all-as-read functionality.

### 4. 📅 Campus Events Module
- Faculty & Admin can publish campus events with date, time, venue, description, and capacity limit.
- Students can browse upcoming events and register with 1-click.
- Instant registration confirmations & capacity tracking.

### 5. 📚 Coursework & Assignments Module
- Faculty creates assignments with subject tags, due dates, description, and total marks.
- Students submit coursework (text response / file submission links).
- Faculty reviews student submissions, assigns marks/grades, and provides individual feedback.

### 6. 📢 Campus Noticeboard / Announcements
- High, Medium, and General priority announcement publishing.
- Department-filtered or campus-wide visibility.

### 7. 🛡️ Student Grievance & Complaints Module
- Students submit complaints regarding campus infrastructure, academics, or facilities.
- Admin and Faculty track, update status (`Pending`, `In Progress`, `Resolved`), and respond to grievances.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/) + Custom Glassmorphism & Mesh CSS |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **Backend Runtime** | [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) + [Mongoose ORM](https://mongoosejs.com/) |
| **Auth & Security** | JWT (JSONWebToken) + BcryptJS + CORS |

---

## 📁 Project Architecture & Folder Structure

```
Full Stack/
├── client/                      # React Frontend App
│   ├── src/
│   │   ├── components/          # Reusable UI Components
│   │   │   ├── dashboard/       # StatCard, QuickActionsBar, EventCard, AssignmentCard, etc.
│   │   │   ├── Navbar.jsx       # Top Bar with Search & Profile Dropdown
│   │   │   ├── Sidebar.jsx      # Role-Aware Collapsible Navigation
│   │   │   ├── NotificationDropdown.jsx # Real-Time Notification Popover
│   │   │   └── ComplaintOverviewCard.jsx
│   │   ├── context/             # AuthContext (JWT State & LocalStorage Sync)
│   │   ├── hooks/               # Custom Hooks (useAuth)
│   │   ├── pages/               # Page Views (Student, Faculty, Admin Dashboards, Profile, etc.)
│   │   ├── routes/              # Protected & Shared Route Guards (AppRoutes.jsx)
│   │   ├── services/            # Axios API Services (auth, dashboard, events, etc.)
│   │   ├── index.css            # Tailwind Base & Custom Mesh/Glass Utility Classes
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js           # Vite Server & API Proxy (port 5173 -> port 5000)
│
├── server/                      # Node.js & Express REST Backend
│   ├── config/                  # Database Connection (connectDB.js)
│   ├── controllers/             # REST Route Controllers
│   │   ├── authController.js    # Login, Register, Profile GET/PUT
│   │   ├── dashboardController.js# Real-Time Analytics Queries
│   │   ├── eventController.js   # Event CRUD & Registrations
│   │   ├── assignmentController.js # Coursework CRUD
│   │   ├── submissionController.js # Submissions & Grading
│   │   ├── complaintController.js  # Grievances CRUD
│   │   ├── announcementController.js# Noticeboard CRUD
│   │   └── notificationController.js# User Notifications CRUD
│   ├── middleware/              # Auth & RBAC Middleware (protect, restrictTo)
│   ├── models/                  # Mongoose Schemas (User, Event, Assignment, Submission, etc.)
│   ├── routes/                  # Express Router Modules
│   ├── server.js                # App Entry Point
│   └── package.json
└── README.md
```

---

## ⚡ How It Works (End-to-End Flow)

1. **User Authentication**:
   - Users register or log in at `/login`.
   - Backend verifies credentials, generates a signed JWT, and returns user profile metadata.
   - Frontend stores the JWT in `localStorage` and initializes `AuthContext`.

2. **Role-Based Routing**:
   - `ProtectedRoute` inspects user role (`student`, `faculty`, `admin`).
   - Students are directed to `/student/dashboard`.
   - Faculty are directed to `/faculty/dashboard`.
   - Admins are directed to `/admin/dashboard`.

3. **Data Aggregation**:
   - Dashboard controllers execute real-time Mongoose aggregate queries against MongoDB Atlas collections.
   - Student dashboard receives personal metrics, enrolled events, pending coursework list, and grievance status.

4. **Event Registration Flow**:
   - Student clicks **Register** on an event → POST request to `/api/events/:id/register`.
   - Backend updates event array, increments count, and fires a notification trigger to the student's notification feed.

5. **Coursework & Grading Flow**:
   - Faculty posts assignment → Students receive notification.
   - Student submits work via `/assignments/:id` → Submission record created in MongoDB.
   - Faculty opens submission, inputs marks and feedback → Submission updated & student receives `Assignment Graded` notification.

---

## 🚀 Quick Setup & Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas Connection URL

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd "Full Stack"

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Run Development Servers

**Backend Express Server**:
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Frontend React App**:
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔒 Security & Data Protection Features

1. **JWT Verification**: Every protected API route enforces valid Bearer token authentication via `protect` middleware.
2. **Strict Privilege Escalation Locks**:
   - User profile edit (`PUT /api/auth/profile`) rejects any modifications to `role` or `email`.
   - Password hashes are excluded from all profile queries (`select('-password')`).
3. **Database Integrity**: All MongoDB IDs are validated to prevent NoSQL injection and invalid cast errors.

---

## 📌 Useful Local Access Links

- 🌐 **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- 📊 **Student Dashboard**: [http://localhost:5173/student/dashboard](http://localhost:5173/student/dashboard)
- 👤 **My Profile**: [http://localhost:5173/profile](http://localhost:5173/profile)
- 📅 **Events**: [http://localhost:5173/events](http://localhost:5173/events)
- 📚 **Assignments**: [http://localhost:5173/assignments](http://localhost:5173/assignments)
- 📢 **Noticeboard**: [http://localhost:5173/announcements](http://localhost:5173/announcements)
- 🛠️ **Backend API Base**: `http://localhost:5000/api`

---

## 📜 License & Copyright

CampusConnect is proprietary software developed for university campus management. All rights reserved.
