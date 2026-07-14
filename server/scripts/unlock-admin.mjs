import mongoose from 'mongoose';

(async () => {
  await mongoose.connect('mongodb://localhost:27017/ums_db');
  const db = mongoose.connection.db;

  // Find DB name dynamically
  const dbName = mongoose.connection.name;
  console.log('Connected to DB:', dbName);

  const result = await db.collection('users').updateMany(
    { email: { $regex: 'admin', $options: 'i' } },
    {
      $set: { status: 'active', failedLoginAttempts: 0 },
      $unset: { lockReason: '' },
    }
  );
  console.log('Updated:', result.modifiedCount, 'user(s)');

  const user = await db.collection('users').findOne({ email: 'admin@truong.edu.vn' });
  if (user) {
    console.log('admin@truong.edu.vn status:', user.status, '| failedAttempts:', user.failedLoginAttempts, '| role:', user.role);
  } else {
    console.log('User not found. Listing all:');
    const all = await db.collection('users').find({}).limit(5).toArray();
    all.forEach(u => console.log(' -', u.email, '|', u.role, '|', u.status));
  }

  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
