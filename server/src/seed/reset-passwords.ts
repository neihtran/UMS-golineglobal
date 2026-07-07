/**
 * Reset password for ALL users in the database to a simple test password.
 * Run: npm run reset-passwords
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { logger } from '../utils/logger.js';

config();

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ums_db';
const NEW_PASSWORD = 'Password@123';

async function resetPasswords() {
  console.log('\n🔑 UMS Password Reset Script\n');
  console.log(`   Target password: "${NEW_PASSWORD}"`);
  console.log(`   Database: ${URI}\n`);

  try {
    await mongoose.connect(URI);
    console.log('✅ Connected to MongoDB\n');

    const hash = await bcrypt.hash(NEW_PASSWORD, 12);
    const result = await User.updateMany({}, { password: hash });

    console.log(`✅ Updated ${result.modifiedCount} user(s) out of ${result.matchedCount} total`);
    console.log('\n   All accounts now use the same password.\n');

    // Show all current users
    const users = await User.find({}).select('username email role displayName');
    console.log('\n📋 Current users in database:');
    for (const u of users) {
      console.log(`   [${u.role}] ${u.username} — ${u.email} (${u.displayName})`);
    }
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected\n');
  }
}

resetPasswords();
