# CampusConnect — Advanced Tech Stack & Architecture Guide

**ENTERPRISE CAMPUS MANAGEMENT PLATFORM**  
*Generated: August 13, 2026*

---

### CAMPUSCONNECT SYSTEM SPECIFICATIONS & TECHNOLOGY INVENTORY
- **Repository**: `github.com/CampusConnect/campusconnect-platform`
- **Live Deployment**: `campusconnect-app.vercel.app`
- **Author**: `CampusConnect Development Team`

---

## 1. Frontend & Core Application Framework

| Technology / Package | Version | Role & Purpose | File Locations / Directives |
| :--- | :--- | :--- | :--- |
| **React** | `v18.2.0` | Core declarative component rendering & state management engine | `client/src/components` & `pages/` |
| **React Router DOM** | `v6.22.3` | Client-side SPA role-based routing & path navigation engine | `client/src/routes/AppRoutes.jsx` |
| **Vite Engine** | `v5.2.0` | Fast HMR dev server, asset bundler & production compiler | `client/vite.config.js` |
| **Axios HTTP Client** | `v1.6.8` | Promise-based REST API client with Bearer JWT interceptors | `client/src/services/api.js` |

---

## 2. Backend Services, Database & Security (MongoDB Powered)

| Technology / Service | Category | Functionality & Integration Details | Code Location |
| :--- | :--- | :--- | :--- |
| **MongoDB Atlas & Mongoose** | Database | Cloud NoSQL document database with schema validation & indexing | `server/config/db.js` & `models/` |
| **Express.js API Engine** | REST Engine | Node.js asynchronous web application framework & routing engine | `server/server.js` & `routes/` |
| **JWT Authentication** | Security / Auth | Stateless JSON Web Tokens with HTTP Bearer authorization headers | `server/middleware/authMiddleware.js` |
| **Bcryptjs Hashing** | Security | Salted multi-round password encryption hook before saving users | `server/models/User.js` |

---

## 3. Styling, Design Tokens & Component System

| Library | Version | Usage | Implementation Path |
| :--- | :--- | :--- | :--- |
| **Tailwind CSS** | `v3.4.3` | Utility-first responsive styling framework & design tokens | `client/src/index.css` |
| **Framer Motion** | `v11.x` | Smooth layout morphs, modal physics & micro-interaction physics | `client/src/components/` |
| **Lucide React Icons** | `v0.368.0` | Modern vector iconography set used across Student, Faculty & Admin UI | `client/src/components/` |

---

## 4. 3D WebGL Graphics, Animation & Particle FX

| Library / Engine | Version | Role & Capabilities | File Location |
| :--- | :--- | :--- | :--- |
| **3D Node Mesh Canvas** | HTML5 Canvas | Interactive 3D particle mesh background with cursor gravitational physics | `client/src/components/landing/Hero3DCanvas.jsx` |
| **Canvas Confetti** | `v1.9.4` | Particle celebration explosions on assignment submission & event RSVP | `client/src/utils/confetti.js` |

---

## 5. Campus AI Engine & Voice Speech Processing

| Feature / API | Provider / Standard | Capabilities & Integration | File Location |
| :--- | :--- | :--- | :--- |
| **Campus AI Assistant** | Gemini / AI Assistant | Instant campus Q&A, coursework advice & grievance logging helper | `client/src/components/ai/CampusAIWidget.jsx` |
| **Voice Speech Processing** | Web Speech API | Browser-native voice-to-text dictation & voice speech commands | `client/src/components/ai/CampusAIWidget.jsx` |

---

## 6. PDF & Data Export Engine

| Package | Version | Output Documents | File Location |
| :--- | :--- | :--- | :--- |
| **jsPDF & AutoTable** | `v2.5.1` / `v3.8.2` | Branded PDF academic receipts, event passes & AI report summary files | `client/src/utils/pdfExport.js` |

---

## 7. Hosting, CI/CD & Infrastructure

| Platform / Tool | Type | Details & Configuration | URL / Path |
| :--- | :--- | :--- | :--- |
| **Vercel Cloud** | Hosting | Production Single Page App (SPA) deployment & Global Edge CDN | `campusconnect-app.vercel.app` |
| **GitHub Version Control** | VCS & CI/CD | Source code repository & automated production triggers | `github.com/CampusConnect/campusconnect` |

---
*CampusConnect™ Enterprise Platform · Tech Operations Hub*
