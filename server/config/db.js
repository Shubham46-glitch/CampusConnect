import mongoose from 'mongoose';
import dns from 'dns';

// Fix Windows DNS SRV lookup failure (querySrv ECONNREFUSED) for MongoDB Atlas
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  // Gracefully ignore if custom DNS servers cannot be set
}

const connectDB = async () => {
  let uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect';

  // Clean up angle brackets if present in environment variable
  if (uri.includes('<') || uri.includes('>')) {
    console.warn('\n⚠️ [MongoDB Warning]: MONGODB_URI contains "<" or ">" angle brackets in password.');
    console.warn('⚠️ Automatically stripping angle brackets in server/.env...\n');
    uri = uri.replace(/<|>/g, '');
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ [MongoDB Warning]: Connection lost. Mongoose will attempt auto-reconnect.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`⚠️ [MongoDB Connection Event Error]: ${err.message}`);
  });

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);

    // Attempt local fallback if remote connection failed
    if (!uri.includes('127.0.0.1') && !uri.includes('localhost')) {
      console.log('🔄 Attempting fallback connection to local MongoDB (mongodb://127.0.0.1:27017/campusconnect)...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/campusconnect', {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB Connected via Local Fallback] Host: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(`[Local MongoDB Fallback Error]: ${localErr.message}`);
      }
    }

    console.error('\n📌 [MongoDB Atlas Troubleshooting Guide]:');
    console.error(' 1. IP Whitelist: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0).');
    console.error(' 2. Password: Ensure angle brackets < > are removed around your password in server/.env.');
    console.error(' 3. DNS / Network: If your ISP or firewall blocks SRV queries (querySrv ECONNREFUSED), use local MongoDB or standard connection string.\n');
  }
};

export default connectDB;
