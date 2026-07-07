/**
 * Seed all modules — runs all seed scripts sequentially.
 * Run: npm run seed
 *
 * seedDepartments() and seedHrm() do NOT connect/disconnect themselves.
 * This function manages a single shared connection.
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { seedDepartments } from './seedDepartment.js';
import { seedHrm } from './seedHrm.js';
import { seedSis } from './seedSis.js';
import { seedDms } from './seedDms.js';
import { seedWms } from './seedWms.js';
import { seedOcr } from './seedOcr.js';
import { seedLms } from './seedLms.js';
import { seedExam } from './seedExam.js';
import { seedPortal } from './seedPortal.js';
import { seedFin } from './seedFin.js';
import { seedKtx } from './seedKtx.js';
import { seedRit } from './seedRit.js';
import { seedInt } from './seedInt.js';
import { seedBi } from './seedBi.js';
import { seedQa } from './seedQa.js';
import { seedDce } from './seedDce.js';
import { seedLib } from './seedLib.js';
import { seedPms } from './seedPms.js';
import { logger } from '../utils/logger.js';

config();

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ums_db';

async function runSeed() {
  console.log('\n🚀 UMS Database Seeder — All Modules\n');
  console.log('⚠️  Make sure MongoDB is running before seeding.\n');

  try {
    await mongoose.connect(URI);
    console.log('📦 Connected to MongoDB\n');

    const seeds = [
      { fn: seedDepartments, label: 'Departments', step: 1 },
      { fn: seedHrm, label: 'HRM', step: 2 },
      { fn: seedSis, label: 'SIS', step: 3 },
      { fn: seedDms, label: 'DMS', step: 4 },
      { fn: seedWms, label: 'WMS', step: 5 },
      { fn: seedOcr, label: 'OCR', step: 6 },
      { fn: seedLms, label: 'LMS', step: 7 },
      { fn: seedExam, label: 'EXAM', step: 8 },
      { fn: seedPortal, label: 'PORTAL', step: 9 },
      { fn: seedFin, label: 'FIN', step: 10 },
      { fn: seedKtx, label: 'KTX', step: 11 },
      { fn: seedRit, label: 'RIT', step: 12 },
      { fn: seedInt, label: 'INT', step: 13 },
      { fn: seedBi, label: 'BI', step: 14 },
      { fn: seedQa, label: 'QA', step: 15 },
      { fn: seedDce, label: 'DCE', step: 16 },
      { fn: seedLib, label: 'LIB', step: 17 },
      { fn: seedPms, label: 'PMS', step: 18 },
    ];

    const total = seeds.length;
    for (const seed of seeds) {
      console.log(`📦 [${seed.step}/${total}] Seeding ${seed.label}...`);
      await seed.fn();
    }

    console.log('\n✅ All seeds complete!\n');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB\n');
  }
}

// Named export for server.ts auto-seed
export async function seedAll() {
  await runSeed();
}

// Run directly when executed as a script (not imported)
const isMain = process.argv[1]?.endsWith('seedAll.ts') ||
  process.argv[1]?.endsWith('seedAll.js');
if (isMain) {
  runSeed();
}
