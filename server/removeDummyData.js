import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Assignment from './models/Assignment.js';
import Submission from './models/Submission.js';
import Complaint from './models/Complaint.js';
import Announcement from './models/Announcement.js';
import Notification from './models/Notification.js';

dotenv.config();

const cleanAllDummyData = async () => {
  console.log('🧹 Clearing all test/dummy data from database...\n');
  try {
    await connectDB();

    const uRes = await User.deleteMany({});
    const eRes = await Event.deleteMany({});
    const aRes = await Assignment.deleteMany({});
    const sRes = await Submission.deleteMany({});
    const cRes = await Complaint.deleteMany({});
    const nRes = await Announcement.deleteMany({});
    const notifRes = await Notification.deleteMany({});

    console.log('✅ Database is now 100% clean!');
    console.log(`- Deleted ${uRes.deletedCount} Users`);
    console.log(`- Deleted ${eRes.deletedCount} Events`);
    console.log(`- Deleted ${aRes.deletedCount} Assignments`);
    console.log(`- Deleted ${sRes.deletedCount} Submissions`);
    console.log(`- Deleted ${cRes.deletedCount} Complaints`);
    console.log(`- Deleted ${nRes.deletedCount} Announcements`);
    console.log(`- Deleted ${notifRes.deletedCount} Notifications`);
  } catch (err) {
    console.error('❌ Error clearing dummy data:', err.message || err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

cleanAllDummyData();
