import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {}

import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Assignment from './models/Assignment.js';
import Submission from './models/Submission.js';
import Complaint from './models/Complaint.js';
import Announcement from './models/Announcement.js';
import Notification from './models/Notification.js';
import ActivityLog from './models/ActivityLog.js';

const clearDatabase = async () => {
  console.log('🧹 Clearing ALL collections and records from MongoDB Atlas database...\n');

  try {
    await connectDB();

    const userCount = await User.deleteMany({});
    const eventCount = await Event.deleteMany({});
    const assignmentCount = await Assignment.deleteMany({});
    const submissionCount = await Submission.deleteMany({});
    const complaintCount = await Complaint.deleteMany({});
    const announcementCount = await Announcement.deleteMany({});
    const notificationCount = await Notification.deleteMany({});
    const activityLogCount = await ActivityLog.deleteMany({});

    console.log('✅ Successfully removed all existing database records:');
    console.log(`- Users removed: ${userCount.deletedCount}`);
    console.log(`- Events removed: ${eventCount.deletedCount}`);
    console.log(`- Assignments removed: ${assignmentCount.deletedCount}`);
    console.log(`- Submissions removed: ${submissionCount.deletedCount}`);
    console.log(`- Complaints removed: ${complaintCount.deletedCount}`);
    console.log(`- Announcements removed: ${announcementCount.deletedCount}`);
    console.log(`- Notifications removed: ${notificationCount.deletedCount}`);
    console.log(`- Activity Logs removed: ${activityLogCount.deletedCount}`);

    console.log('\n✨ Database is now completely clean!');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message || error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

clearDatabase();
