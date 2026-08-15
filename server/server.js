import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CampusConnect API Server is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/faculty/performance', performanceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', activityLogRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/attendance', attendanceRoutes);


// Serve static frontend assets in production if client/dist exists
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[CampusConnect Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
