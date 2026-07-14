import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

(async () => {
  await mongoose.connect('mongodb://localhost:27017/ums_db');
  const db = mongoose.connection.db;

  const user = await db.collection('users').findOne({ email: 'admin@truong.edu.vn' });
  if (!user) {
    console.log('User not found in ums_db');
    const all = await db.collection('users').find({}).toArray();
    console.log('All users:', all.map(u => u.email));
  } else {
    console.log('User found:');
    console.log('  email:', user.email);
    console.log('  username:', user.username);
    console.log('  role:', user.role);
    console.log('  status:', user.status);
    console.log('  failedAttempts:', user.failedLoginAttempts);
    console.log('  password hash:', user.password?.substring(0, 30) + '...');

    // Test password
    const isValid = await bcrypt.compare('Admin@123', user.password);
    console.log('  Password "Admin@123" valid:', isValid);
  }

  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
