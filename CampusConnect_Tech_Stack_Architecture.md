# CampusConnect — Tech Stack & Architecture Guide

**SMART COLLEGE MANAGEMENT & COLLABORATION PLATFORM**  
*Technical Architecture, Software Specifications & Technology Inventory Document*

---

## 1. Document Style & Conventions

This document serves as the official **Tech Stack & Architecture Guide** for **CampusConnect**. It is structured for academic evaluation, viva examination, technical presentations, GitHub documentation, and future software maintenance.

- **Verified Codebase Specifications**: All technologies, dependencies, file paths, models, and endpoints documented herein have been verified directly from `client/package.json`, `server/package.json`, and the source code repository.
- **Architectural Pattern**: Full-stack MERN (MongoDB, Express.js, React, Node.js) Client-Server Architecture.
- **Accuracy Guarantee**: No unverified external technologies (e.g., Supabase, PostgreSQL, TypeScript, or TanStack) are included.

---

## 2. Project Overview

**CampusConnect** is a full-stack, role-based Smart College Management & Collaboration Platform designed to connect **Students**, **Faculty**, and **Administrators** through a centralized, responsive web interface.

### Managed Core Capabilities:
- **Event Management**: Campus workshop publishing, single-click student RSVP/registration, and roster tracking.
- **Assignments & Coursework**: Assignment publishing, deadline tracking, student file/text submissions, and faculty evaluation/grading.
- **Announcements**: Departmental notice broadcasting with priority badges and audience targeting.
- **Grievance / Complaint Management**: Student grievance logging, admin resolution assignment, and status updates.
- **Notifications**: Real-time unread alert counters and event-triggered notification logs.
- **User Management**: Administrative user search, role updates (Student, Faculty, Admin), and status toggling.
- **Global Search**: Search across users, events, assignments, announcements, and complaints.
- **Admin Analytics**: Interactive visual charts and platform aggregation metrics.
- **Role-Based Portals**: Tailored dashboards for Student, Faculty, and Admin access levels.
- **Profile Management**: Profile info updates, roll/employee ID tracking, and security controls.

### Client-Server Architecture Overview:
CampusConnect operates on a decoupled **Client-Server Architecture**:
1. **Frontend (Client)**: Single Page Application (SPA) built with React 18 and Vite, running in the user's browser.
2. **Backend (Server)**: Asynchronous RESTful API server built with Node.js and Express.js, handling business logic, authentication, and database operations.
3. **Database**: Cloud NoSQL document store powered by MongoDB Atlas via Mongoose ORM.

---

## 3. Frontend & Core Application Architecture

The frontend is located in the `client/` folder and compiled using Vite.

### Frontend Technology Inventory:

| Technology | Version | Purpose / Role | Implementation / Usage |
| :--- | :--- | :--- | :--- |
| **React** | `v18.2.0` | Core declarative UI rendering engine | `client/src/components/` & `client/src/pages/` |
| **JavaScript / JSX** | ES6+ | Primary application scripting language | Entire frontend codebase (`*.jsx`, `*.js`) |
| **React Router DOM** | `v6.22.3` | Client-side SPA routing & role-based route guards | `client/src/routes/AppRoutes.jsx` |
| **Axios** | `v1.6.8` | HTTP client with automatic Bearer JWT header interceptors | `client/src/services/api.js` |
| **React Context API** | Native | Global state management for authentication & user session | `client/src/context/AuthContext.jsx` |
| **Tailwind CSS** | `v3.4.3` | Utility-first styling framework & responsive design tokens | `client/src/index.css` & `tailwind.config.js` |
| **Lucide React** | `v0.368.0` | Modern vector iconography set | `client/src/components/` & `client/src/pages/` |
| **Recharts** | `v3.10.1` | Analytical graphs (bar charts, pie charts) for admin analytics | `client/src/pages/AnalyticsPage.jsx` |
| **Framer Motion** | `v13.1.0` | Micro-interaction physics & smooth animation transitions | UI components & modal overlays |
| **Canvas Confetti** | `v1.9.4` | Particle celebration explosions on task success | `client/src/utils/confetti.js` |
| **jsPDF & AutoTable** | `v4.2.1` / `v5.0.8` | Client-side PDF academic receipt & report generation | `client/src/utils/pdfExport.js` |
| **HTML5 & CSS3** | Standard | Semantic page structure and global styling base | `client/index.html` & `client/src/index.css` |

---

## 4. React Project Architecture (`client/src/`)

The client codebase is organized cleanly into modular directories under `client/src/`:

```
client/src/
├── components/       # Reusable UI elements, feature cards, modals & AI widgets
├── pages/            # Page-level route views (Landing, Dashboards, Details, Forms)
├── context/          # React AuthContext provider for global user & token state
├── services/         # Axios API modules for backend HTTP endpoints
├── layouts/          # Page layout shells (MainLayout & DashboardLayout)
├── routes/           # AppRoutes route definitions & protected route wrappers
├── hooks/            # Custom React hooks (useAuth.js)
├── utils/            # Helper utilities (confetti.js, pdfExport.js, formatters.js)
├── App.jsx           # Root application component wrapping AuthProvider & Router
├── main.jsx          # Entry point mounting React into document.getElementById('root')
└── index.css         # Global Tailwind CSS directives & font rules
```

### Folder Responsibilities:
- **`components/`**: Modular UI elements (buttons, inputs, tables, cards, navigation bars, `CampusAIWidget`, `Hero3DCanvas`).
- **`pages/`**: Complete screen views rendered at specific routes (e.g., `StudentDashboard.jsx`, `FacultyDashboard.jsx`, `AdminDashboard.jsx`, `LandingPage.jsx`, `AnalyticsPage.jsx`).
- **`context/`**: Holds `AuthContext.jsx` to store current user details, JWT token, login, logout, and registration actions.
- **`services/`**: Encapsulates API requests (`authService.js`, `assignmentService.js`, `eventService.js`, `complaintService.js`, `notificationService.js`, `userService.js`).
- **`layouts/`**: `MainLayout.jsx` (PublicNavbar + Footer) and `DashboardLayout.jsx` (Sidebar + Top Navbar).
- **`routes/`**: `AppRoutes.jsx` mapping paths to pages and `ProtectedRoute.jsx` checking role authorization.
- **`hooks/`**: `useAuth.js` providing access to `AuthContext`.
- **`utils/`**: Utility functions for date formatting, status styling, PDF export, and confetti.

---

## 5. Backend, Database & Security Architecture

The backend is located in the `server/` directory and built on Node.js and Express.js using ES Modules (`import`/`export`).

### Backend Technology Inventory:

| Technology | Version | Purpose / Role | Implementation / Location |
| :--- | :--- | :--- | :--- |
| **Node.js** | Runtime | Asynchronous server-side JavaScript execution environment | Server environment runtime |
| **Express.js** | `v4.19.2` | Web application framework for REST API routing & middleware | `server/server.js` & `server/routes/` |
| **MongoDB Atlas** | Managed Cloud | Cloud NoSQL document database storing JSON-like collections | Remote MongoDB Cluster |
| **Mongoose** | `v8.3.1` | Object Data Modeling (ODM) library for schema validation | `server/config/db.js` & `server/models/` |
| **JWT (`jsonwebtoken`)** | `v9.0.2` | Stateless authentication tokens signed with user ID & role | `server/middleware/authMiddleware.js` |
| **bcryptjs** | `v2.4.3` | Password hashing hook using salted rounds before DB write | `server/models/User.js` |
| **CORS (`cors`)** | `v2.8.5` | Cross-Origin Resource Sharing security middleware | `server/server.js` |
| **dotenv** | `v16.4.5` | Environment variable management (`PORT`, `MONGODB_URI`, `JWT_SECRET`) | `server/.env` |

---

## 6. Server Architecture (`server/`)

The backend codebase follows a clean layered MVC (Model-View-Controller) structure:

```
server/
├── config/           # Database connection setup (db.js)
├── models/           # Mongoose schemas & data models (User, Assignment, Submission, etc.)
├── controllers/      # Business logic & NoSQL queries for REST operations
├── routes/           # Express router endpoints mapped to controllers
├── middleware/       # JWT verification, RBAC role checks & error handling
├── utils/            # Helper utilities (generateToken.js)
└── server.js         # Backend entry point initializing Express, middleware & routes
```

### Folder Responsibilities:
- **`config/`**: `db.js` connects Mongoose to MongoDB Atlas with DNS fallback handling.
- **`models/`**: Defines database schemas, field types, validation, and relationships.
- **`controllers/`**: Contains async functions processing requests, querying MongoDB, and returning JSON responses.
- **`routes/`**: Maps API endpoints (e.g., `/api/assignments`, `/api/events`) to controller functions.
- **`middleware/`**: `authMiddleware.js` (JWT token verification), `roleMiddleware.js` (RBAC access checks), `errorMiddleware.js` (centralized error handler).
- **`server.js`**: Initializes Express app, registers global CORS & JSON parsers, mounts API routes, connects database, and starts server listening on port 5000.

---

## 7. Database Architecture (MongoDB / Mongoose)

CampusConnect uses **MongoDB** as its NoSQL database engine, managed via **Mongoose ORM**.

### Verified Mongoose Models & Schemas:

```
     ┌──────────────┐
     │     User     │ (student, faculty, admin)
     └──────┬───────┘
            │
  ┌─────────┼───────────────────────────┐
  │ (createdBy)                         │ (createdBy)
  ▼                                     ▼
┌──────────────┐                 ┌──────────────┐
│    Event     │                 │  Assignment  │
└──────────────┘                 └──────┬───────┘
                                        │ (assignment)
                                        ▼
                                 ┌──────────────┐
                                 │  Submission  │
                                 └──────────────┘
```

1. **`User` Model** (`server/models/User.js`):
   - **Purpose**: Stores account credentials, role details, and department.
   - **Fields**: `name`, `email` (unique), `password` (hashed), `role` (`student`, `faculty`, `admin`), `department`, `profileInfo` (`rollNumber`, `employeeId`), `createdAt`.

2. **`Assignment` Model** (`server/models/Assignment.js`):
   - **Purpose**: Stores coursework assignments published by faculty.
   - **Fields**: `title`, `description`, `subject`, `dueDate`, `totalPoints`, `targetDepartment`, `createdBy` (Ref: `User`), `createdAt`.

3. **`Submission` Model** (`server/models/Submission.js`):
   - **Purpose**: Stores coursework submissions submitted by students and faculty grades.
   - **Fields**: `assignment` (Ref: `Assignment`), `student` (Ref: `User`), `submissionText`, `fileUrl`, `status` (`submitted`, `graded`), `grade`, `feedback`, `submittedAt`.

4. **`Event` Model** (`server/models/Event.js`):
   - **Purpose**: Stores campus workshops, academic seminars, and registrations.
   - **Fields**: `title`, `description`, `category`, `date`, `time`, `venue`, `organizer` (Ref: `User`), `registeredStudents` (Array of Ref: `User`), `capacity`, `createdAt`.

5. **`Complaint` Model** (`server/models/Complaint.js`):
   - **Purpose**: Stores student campus grievances and administrative status logs.
   - **Fields**: `title`, `description`, `category`, `submittedBy` (Ref: `User`), `status` (`pending`, `in-progress`, `resolved`, `rejected`), `assignedTo` (Ref: `User`), `resolutionNotes`, `createdAt`.

6. **`Announcement` Model** (`server/models/Announcement.js`):
   - **Purpose**: Stores official departmental notices and priority broadcasts.
   - **Fields**: `title`, `content`, `category`, `priority` (`low`, `medium`, `high`, `urgent`), `postedBy` (Ref: `User`), `targetAudience`, `createdAt`.

7. **`Notification` Model** (`server/models/Notification.js`):
   - **Purpose**: Stores system alerts and unread counters for users.
   - **Fields**: `recipient` (Ref: `User`), `title`, `message`, `type`, `isRead`, `relatedId`, `relatedType`, `createdAt`.

---

## 8. Authentication & Authorization (RBAC)

Authentication is implemented using **JSON Web Tokens (JWT)** and **bcryptjs password hashing**.

### Authentication Flow:
1. **Registration** (`/api/auth/register`): User signs up as Student or Faculty. Password is encrypted using `bcryptjs.hash()` before saving to MongoDB.
2. **Login** (`/api/auth/login`): User inputs email & password. `bcryptjs.compare()` verifies password. Server issues a signed JWT token containing user `id` and `role`.
3. **Session Persistence**: Token is saved in `localStorage`. `AuthContext` injects the user object across the React app.
4. **API Requests**: Axios interceptor in `api.js` attaches header: `Authorization: Bearer <token>`.
5. **Route Protection**: `ProtectedRoute.jsx` verifies user token presence and role authorization before rendering protected pages.

### Role-Based Access Control (RBAC) Matrix:

| Feature / Action | Student | Faculty | Admin |
| :--- | :---: | :---: | :---: |
| View Landing Page & Public Navigation | ✅ | ✅ | ✅ |
| View Assignments | ✅ | ✅ | ✅ |
| Create / Edit / Delete Assignments | ❌ | ✅ | ✅ |
| Submit Coursework | ✅ | ❌ | ❌ |
| Grade Submissions & Give Feedback | ❌ | ✅ | ✅ |
| View Campus Events | ✅ | ✅ | ✅ |
| Create / Edit Events | ❌ | ✅ | ✅ |
| Single-Click Event Registration | ✅ | ❌ | ❌ |
| View Announcements | ✅ | ✅ | ✅ |
| Publish Announcements | ❌ | ✅ | ✅ |
| Log Complaint / Grievance | ✅ | ❌ | ❌ |
| Resolve Complaints & Add Notes | ❌ | ❌ | ✅ |
| System User Management (Role/Status) | ❌ | ❌ | ✅ |
| View Admin Analytics & Visual Charts | ❌ | ❌ | ✅ |

---

## 9. REST API Architecture

All endpoints are hosted under `/api/` and return standardized JSON HTTP responses.

| Endpoint Group | Primary Method | Purpose | Auth Required | Role Restrictions |
| :--- | :--- | :--- | :---: | :---: |
| `/api/auth/login` | `POST` | User authentication & JWT issuance | ❌ | Public |
| `/api/auth/register` | `POST` | New user account registration | ❌ | Public |
| `/api/auth/profile` | `GET` / `PUT` | Fetch & update authenticated user profile | ✅ | All Roles |
| `/api/assignments` | `GET` / `POST` | List and create coursework assignments | ✅ | Read: All, Write: Faculty/Admin |
| `/api/submissions` | `GET` / `POST` | Submit coursework and view submissions | ✅ | Submit: Student, Grade: Faculty/Admin |
| `/api/events` | `GET` / `POST` | List events, publish events & RSVP | ✅ | Read: All, Create: Faculty/Admin, RSVP: Student |
| `/api/announcements` | `GET` / `POST` | Broadcast and read campus notices | ✅ | Read: All, Publish: Faculty/Admin |
| `/api/complaints` | `GET` / `POST` | Log grievances and update status | ✅ | Create: Student, Resolve: Admin |
| `/api/notifications` | `GET` / `PUT` | Fetch alerts & mark as read | ✅ | All Roles |
| `/api/dashboard` | `GET` | Fetch role-tailored dashboard overview | ✅ | All Roles |
| `/api/analytics` | `GET` | Aggregate platform metrics & statistics | ✅ | Admin |
| `/api/users` | `GET` / `PUT` | System user roster management | ✅ | Admin |
| `/api/search` | `GET` | Global multi-collection search query | ✅ | All Roles |

---

## 10. CampusConnect Functional Modules

1. **Student Portal**:
   - Dedicated dashboard displaying enrolled assignments, upcoming registered events, recent notices, and grievance status.
2. **Faculty Portal**:
   - Control center allowing professors to publish coursework, grade student submissions, view performance, and post announcements.
3. **Admin Control Center**:
   - System administration hub for managing user accounts, monitoring platform analytics, and resolving campus complaints.
4. **Assignment & Submission Engine**:
   - Coursework lifecycle management with due date indicators, file/text submission forms, points tracking, and evaluation modal.
5. **Event Management Module**:
   - Event creation, location/venue scheduling, single-click RSVP registration, and attendee list management.
6. **Grievance / Complaint Module**:
   - Structured grievance logging for students with priority categories, admin resolution notes, and status tracking (`pending`, `in-progress`, `resolved`).
7. **Announcements Module**:
   - Official campus notice board supporting priority badges (`urgent`, `high`, `medium`) and audience targeting.
8. **Notification Module**:
   - Header bell icon with real-time unread counter badge and dropdown drawer listing recent alerts.
9. **User Management Module**:
   - Admin roster view with search filtering, role modification, and account activation/deactivation toggle.
10. **Search Module**:
    - Navbar global search bar executing queries across users, assignments, events, announcements, and complaints.
11. **Analytics Module**:
    - Visual charts powered by `Recharts` rendering submission breakdown, complaint resolution rates, and user growth.
12. **Campus AI & Voice Speech Assistant**:
    - Floating AI assistant widget with browser-native Web Speech API voice dictation for instant campus guidance.

---

## 11. Frontend UI Component System

CampusConnect uses a reusable React component hierarchy to maintain design consistency and reduce code duplication:

- **`Navbar.jsx`**: Top header for authenticated users with search bar, notification bell dropdown, and user profile menu.
- **`PublicNavbar.jsx`**: Unauthenticated landing page header featuring brand logo, anchor nav, and compact role-selection login dropdown.
- **`Sidebar.jsx`**: Left vertical navigation menu customized to Student, Faculty, or Admin role links.
- **`Button.jsx`**: Reusable button supporting `primary`, `secondary`, `outline`, `danger`, and `success` variants.
- **`Input.jsx`**: Standard form text/password input wrapper with label formatting and validation styles.
- **`Modal.jsx`**: Backdrop overlay dialog container used for grading submissions and popup forms.
- **`Table.jsx`**: Accessible data table wrapper for user management and submission lists.
- **`Badge.jsx`**: Status indicator pill (`pending`, `graded`, `resolved`, `urgent`).
- **`DashboardCard.jsx` / `StatCard.jsx`**: Statistic summary card displaying metric counts and trend indicators.
- **`LoadingSpinner.jsx` / `SkeletonLoader.jsx`**: Animated loading placeholders during async API requests.
- **`CampusAIWidget.jsx`**: Voice & speech-enabled AI assistant widget.
- **`Hero3DCanvas.jsx`**: Interactive 3D particle constellation background for the landing page hero section.

---

## 12. Notification System Architecture

- **Trigger Events**: Notifications are automatically generated in the database when:
  - A new assignment is published $\rightarrow$ notifies targeted students.
  - A submission is graded $\rightarrow$ notifies the student.
  - A complaint status is updated $\rightarrow$ notifies the student who filed it.
  - A new user registers $\rightarrow$ notifies platform administrators.
- **Frontend UI**:
  - `Navbar.jsx` displays a bell icon with an unread badge counter fetched from `notificationService.getUnreadCount()`.
  - Clicking the bell opens `NotificationDropdown.jsx`, displaying the list of notifications with "Mark as Read" actions.

---

## 13. Search System Architecture

- **Global Navbar Search**:
  - The search input in `Navbar.jsx` calls `searchService.performGlobalSearch(query)`.
  - Sends a GET request to `/api/search?q=query`.
- **Backend Search Query**:
  - `searchController.js` executes MongoDB `$regex` queries across multiple collections simultaneously:
    - `User`: search by `name` or `email`.
    - `Assignment`: search by `title` or `subject`.
    - `Event`: search by `title` or `category`.
    - `Announcement`: search by `title` or `content`.
    - `Complaint`: search by `title` or `category`.
  - Returns grouped JSON results displayed dynamically in the UI.

---

## 14. Analytics & Dashboard

- **Admin Analytics Page** (`client/src/pages/AnalyticsPage.jsx`):
  - Fetches platform metrics from `analyticsService.getAdminAnalytics()` (`GET /api/analytics`).
- **Visual Charting Engine**:
  - Powered by **`Recharts v3.10.1`**.
  - Renders Bar Charts for monthly submission counts, Pie Charts for complaint status distribution, and Stat Cards for user role counts.
- **Backend Aggregations**:
  - `analyticsController.js` utilizes Mongoose `$group` and `$count` aggregation pipelines to compute counts directly inside MongoDB Atlas.

---

## 15. Security Practices & Implementation

| Security Layer | Status | Implementation Details |
| :--- | :--- | :--- |
| **JWT Authentication** | **Implemented** | Tokens signed with user ID & role; verified on every protected API call. |
| **Password Encryption** | **Implemented** | Passwords hashed using `bcryptjs` (salt rounds: 10) before MongoDB persistence. |
| **Route Protection** | **Implemented** | Client-side `ProtectedRoute.jsx` + server-side `authMiddleware.js` (`protect`). |
| **Role-Based Access Control** | **Implemented** | `roleMiddleware.js` (`authorizeRoles('faculty', 'admin')`) enforcing strict RBAC. |
| **CORS Security** | **Implemented** | Express `cors()` middleware restricting unapproved cross-origin requests. |
| **Environment Variable Isolation** | **Implemented** | Database URIs, secrets & ports stored in `server/.env` (git-ignored). |
| **Input Validation** | **Implemented** | Server-side validation of email regex, required fields, and password lengths. |

---

## 16. Error Handling & Loading States

- **Loading States**: Handled via React state (`loading`) and rendered using `LoadingSpinner.jsx` or `SkeletonLoader.jsx`.
- **404 Not Found Page**: Client route `*` renders `NotFoundPage.jsx` when an invalid path is visited.
- **403 Forbidden Page**: `ForbiddenPage.jsx` is rendered when a user attempts to access a page outside their role authorization.
- **Server Error Middleware**: `errorMiddleware.js` catches Express errors and returns structured JSON error responses `{ message: "..." }`.

---

## 17. Responsive Design

- **Framework**: Tailwind CSS v3.4.3 utility classes.
- **Breakpoints**: Standard responsive breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
- **Mobile Navigation**: `PublicNavbar.jsx` and `Navbar.jsx` feature responsive hamburger menus and sliding drawer menus for mobile screens.

---

## 18. Client-Server Request Flow

```
User (Browser)
   │
   ▼
1. User interacts with React UI Component / Page
   │
   ▼
2. Component calls Service Function (e.g., assignmentService.createAssignment)
   │
   ▼
3. Axios instance (api.js) attaches Header: Authorization: Bearer <JWT Token>
   │
   ▼
4. HTTP REST Request sent to http://localhost:5000/api/...
   │
   ▼
5. Express server.js routes request through global Middleware
   │
   ▼
6. authMiddleware verifies JWT token & attaches req.user
   │
   ▼
7. roleMiddleware verifies req.user.role authorization
   │
   ▼
8. Controller Function executes business logic & Mongoose Query
   │
   ▼
9. Mongoose connects to MongoDB Atlas document store
   │
   ▼
10. MongoDB performs CRUD operation & returns BSON document
   │
   ▼
11. Express Controller returns 200/201 JSON response
   │
   ▼
12. Axios receives response -> React updates State -> UI re-renders
```

---

## 19. Complete Project Structure

```
CampusConnect/
├── client/                           # React Frontend Application
│   ├── index.html                    # Single Page Application HTML entry
│   ├── package.json                  # Frontend dependencies & Vite scripts
│   ├── vite.config.js                # Vite bundler & dev server config
│   ├── tailwind.config.js            # Tailwind CSS design tokens & plugins
│   └── src/
│       ├── App.jsx                   # Root React component wrapper
│       ├── main.jsx                  # React DOM mounting entry point
│       ├── index.css                 # Global CSS directives & font rules
│       ├── components/               # Reusable UI & feature components
│       │   ├── Badge.jsx
│       │   ├── Button.jsx
│       │   ├── ComplaintOverviewCard.jsx
│       │   ├── DashboardCard.jsx
│       │   ├── Input.jsx
│       │   ├── LoadingSpinner.jsx
│       │   ├── Modal.jsx
│       │   ├── Navbar.jsx
│       │   ├── NotificationDropdown.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── PublicNavbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── Table.jsx
│       │   ├── ai/
│       │   │   └── CampusAIWidget.jsx
│       │   ├── announcements/
│       │   ├── assignments/
│       │   ├── complaints/
│       │   ├── dashboard/
│       │   ├── events/
│       │   └── landing/
│       │       └── Hero3DCanvas.jsx
│       ├── pages/                    # Page-level route views
│       │   ├── AdminDashboard.jsx
│       │   ├── AnalyticsPage.jsx
│       │   ├── FacultyDashboard.jsx
│       │   ├── ForbiddenPage.jsx
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── NotFoundPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── StudentDashboard.jsx
│       │   ├── admin/
│       │   ├── announcements/
│       │   ├── assignments/
│       │   ├── complaints/
│       │   ├── events/
│       │   └── faculty/
│       ├── context/                  # Global AuthContext provider
│       │   └── AuthContext.jsx
│       ├── routes/                   # AppRoutes route mappings
│       │   └── AppRoutes.jsx
│       ├── layouts/                  # MainLayout & DashboardLayout
│       │   ├── MainLayout.jsx
│       │   └── DashboardLayout.jsx
│       ├── services/                 # Axios HTTP service modules
│       │   ├── api.js
│       │   ├── authService.js
│       │   ├── assignmentService.js
│       │   ├── eventService.js
│       │   ├── complaintService.js
│       │   ├── notificationService.js
│       │   ├── userService.js
│       │   └── ...
│       ├── hooks/                    # Custom React hooks (useAuth.js)
│       │   └── useAuth.js
│       └── utils/                    # Helper utilities
│           ├── confetti.js
│           ├── pdfExport.js
│           └── formatters.js
│
├── server/                           # Express.js & Node.js Backend Application
│   ├── package.json                  # Backend dependencies & scripts
│   ├── server.js                     # Server entry point & Express config
│   ├── config/                       # Mongoose MongoDB Atlas connection
│   │   └── db.js
│   ├── models/                       # Mongoose database schemas
│   │   ├── User.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   ├── Event.js
│   │   ├── Announcement.js
│   │   ├── Complaint.js
│   │   └── Notification.js
│   ├── controllers/                  # Controller business logic & NoSQL queries
│   │   ├── authController.js
│   │   ├── assignmentController.js
│   │   ├── eventController.js
│   │   ├── complaintController.js
│   │   ├── notificationController.js
│   │   ├── analyticsController.js
│   │   └── userController.js
│   ├── routes/                       # Express API endpoints
│   │   ├── authRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/                   # JWT & RBAC security middleware
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   └── utils/                        # Helper utilities (generateToken.js)
│       └── generateToken.js
│
├── .gitignore                        # Git exclusion file
├── CAMPUSCONNECT_TECH_STACK_GUIDE.html # Printable 2-page tech stack guide
└── README.md                         # Project documentation
```

---

## 20. Development & Deployment

### Development Setup:
- **Frontend Development Server**: `npm run dev` inside `client/` (Vite dev server running on port `5173`/`5174`).
- **Backend Server**: `npm run dev` or `npm start` inside `server/` (Nodemon / Node.js running on port `5000`).
- **Database Connection**: MongoDB Atlas cloud cluster connected via `MONGODB_URI` environment variable, with local fallback (`mongodb://127.0.0.1:27017/campusconnect`).
- **Source Control**: Git repository tracked on GitHub (`github.com/Shubham46-glitch/CampusConnect.git`).

---

## 21. Technology Summary Table

| Architectural Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React | `v18.2.0` | Component-based UI rendering engine |
| **Bundler & Build Tool** | Vite | `v5.2.0` | HMR dev server & production bundler |
| **Routing** | React Router DOM | `v6.22.3` | Client-side SPA navigation & route guards |
| **HTTP Client** | Axios | `v1.6.8` | REST API communication with Bearer JWT |
| **Styling** | Tailwind CSS | `v3.4.3` | Utility-first styling framework |
| **Iconography** | Lucide React | `v0.368.0` | Vector icon set |
| **Analytics Visualization** | Recharts | `v3.10.1` | Visual graphs for admin dashboard |
| **Backend Runtime** | Node.js | Standard | Server-side JavaScript runtime |
| **Backend Framework** | Express.js | `v4.19.2` | REST API routing & middleware framework |
| **Database Engine** | MongoDB Atlas | Cloud | NoSQL document database |
| **Database ORM/ODM** | Mongoose | `v8.3.1` | Document modeling & schema validation |
| **Authentication** | JSON Web Tokens (JWT) | `v9.0.2` | Stateless HTTP Bearer authentication |
| **Password Security** | bcryptjs | `v2.4.3` | Salted password hashing hook |
| **Version Control** | Git & GitHub | Standard | Source code repository tracking |

---

## 22. How to Explain CampusConnect in Viva (1–2 Minute Guide)

If asked to present or explain **CampusConnect** during a college viva or evaluation, use this simple 10-point spoken script:

1. **What CampusConnect is**: *"CampusConnect is a full-stack, role-based Smart College Management & Collaboration Platform built using the MERN stack."*
2. **Why We Built It**: *"It solves the problem of fragmented college systems by unifying assignments, campus events, announcements, grievance complaints, and administrative oversight into one central digital hub."*
3. **Frontend Technology**: *"The frontend is built with **React 18** and **Vite** for fast rendering, styled using **Tailwind CSS**, and uses **React Router v6** for single-page navigation."*
4. **Backend Technology**: *"The backend is an asynchronous REST API built with **Node.js** and **Express.js**, following a clean MVC architecture."*
5. **Database Choice**: *"We chose **MongoDB Atlas** with **Mongoose ORM** because its NoSQL document structure allows flexible JSON schema modeling for users, coursework, complaints, and events."*
6. **Authentication**: *"Authentication is handled using **JSON Web Tokens (JWT)** and **bcryptjs** password hashing for stateless, secure session authorization."*
7. **Role-Based Access Control (RBAC)**: *"The platform strictly enforces three roles: **Students** can submit assignments and register for events; **Faculty** can publish coursework and grade submissions; **Administrators** can manage users, track analytics, and resolve complaints."*
8. **Core Modules**: *"Key modules include Assignments & Grading, Event RSVP Management, Grievance Tracking, Targeted Announcements, Unread Notifications, Global Search, and Admin Visual Analytics."*
9. **Client-Server Communication**: *"The React client sends HTTP requests via **Axios** with Bearer JWT tokens to Express REST endpoints, which process business logic and execute Mongoose queries against MongoDB Atlas."*
10. **Why MongoDB**: *"MongoDB's NoSQL document model is ideal for MERN stack development, allowing seamless JSON data mapping between React state, Express endpoints, and database collections."*
