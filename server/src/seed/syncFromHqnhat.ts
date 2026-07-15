/**
 * Migration Script: Initial sync from api.hqnhat.id.vn
 *
 * Mục đích: chạy 1 lần để khởi tạo dữ liệu ban đầu trong UMS DB
 * từ external API. Khác với real-time sync ở chỗ:
 *   - Chạy tuần tự tất cả entities (không qua cron)
 *   - In progress chi tiết ra console
 *   - Có thể chạy với --dry-run để preview
 *   - Báo cáo cuối cùng: tổng created/updated/errors
 *
 * Cách chạy:
 *   1. Set MONGODB_URI + HQNHAT_API_URL trong .env
 *   2. Chạy: npm run migrate:hqnhat
 *      hoặc: node --import=tsx src/seed/syncFromHqnhat.ts [--dry-run] [--entity=Faculty,Major,...]
 */

import mongoose from 'mongoose';
import {
  Department,
  Major,
  Subject,
  Curriculum,
  StudentClass,
  Student,
  ExternalMapping,
  SyncConfig,
} from '../models/index.js';
import {
  syncFaculties,
  syncMajors,
  syncCourses,
  syncCurriculums,
  syncStudentClasses,
  syncStudents,
} from '../services/integration/jobs/index.js';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function log(level: 'info' | 'success' | 'warn' | 'error', msg: string) {
  const ts = new Date().toISOString();
  const color = level === 'success' ? GREEN : level === 'warn' ? YELLOW : level === 'error' ? RED : CYAN;
  console.log(`${color}[${level.toUpperCase()}]${RESET} ${ts} ${msg}`);
}

interface CliOptions {
  dryRun: boolean;
  entities: string[];
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const entityArg = args.find((a) => a.startsWith('--entity='));
  const entities = entityArg
    ? entityArg.split('=')[1].split(',').map((e) => e.trim())
    : ['Faculty', 'Major', 'Course', 'Curriculum', 'StudentClass', 'Student'];
  return { dryRun, entities };
}

async function enableEntity(entity: string): Promise<void> {
  await SyncConfig.findOneAndUpdate(
    { source: 'hqnhat', entity },
    {
      source: 'hqnhat',
      entity,
      mode: 'MIRROR',
      enabled: true,
      conflictStrategy: 'source_wins',
    },
    { upsert: true }
  );
}

async function main() {
  const opts = parseArgs();

  log('info', '═══ Migration: Initial Sync from api.hqnhat.id.vn ═══');
  log('info', `Mode: ${opts.dryRun ? 'DRY-RUN (no DB writes)' : 'LIVE'}`);
  log('info', `Entities: ${opts.entities.join(', ')}`);

  log('info', '🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI!);
  log('success', '✅ Connected');

  // Print pre-state
  const before = {
    Department: await Department.countDocuments({ type: 'faculty' }),
    Major: await Major.countDocuments({}),
    Subject: await Subject.countDocuments({}),
    Curriculum: await Curriculum.countDocuments({}),
    StudentClass: await StudentClass.countDocuments({}),
    Student: await Student.countDocuments({}),
    ExternalMapping: await ExternalMapping.countDocuments({ source: 'hqnhat' }),
  };

  console.log('\n📊 BEFORE migration:');
  Object.entries(before).forEach(([k, v]) => console.log(`  - ${k}: ${v}`));

  // Enable all entities
  for (const entity of opts.entities) {
    await enableEntity(entity);
  }

  const jobMap: Record<string, () => Promise<any>> = {
    Faculty: () => syncFaculties({ triggeredBy: 'migration', dryRun: opts.dryRun }),
    Major: () => syncMajors({ triggeredBy: 'migration', dryRun: opts.dryRun }),
    Course: () => syncCourses({ triggeredBy: 'migration', dryRun: opts.dryRun }),
    Curriculum: () => syncCurriculums({ triggeredBy: 'migration', dryRun: opts.dryRun }),
    StudentClass: () => syncStudentClasses({ triggeredBy: 'migration', dryRun: opts.dryRun }),
    Student: () => syncStudents({ triggeredBy: 'migration', dryRun: opts.dryRun }),
  };

  const results: any[] = [];
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  for (const entity of opts.entities) {
    const job = jobMap[entity];
    if (!job) {
      log('warn', `Unknown entity: ${entity}`);
      continue;
    }

    log('info', `\n${YELLOW}── Migrating ${entity} ──${RESET}`);
    const t0 = Date.now();
    try {
      const result = await job();
      const dt = Date.now() - t0;
      results.push(result);
      totalCreated += result.created ?? 0;
      totalUpdated += result.updated ?? 0;
      totalErrors += result.errors ?? 0;

      log(
        result.status === 'success' ? 'success' : 'error',
        `${entity}: ${result.status} | created=${result.created ?? 0} updated=${result.updated ?? 0} deleted=${result.deleted ?? 0} errors=${result.errors ?? 0} | ${dt}ms`
      );
      if (result.message) log('info', `  ${result.message}`);
      if (result.error) log('error', `  Error: ${result.error}`);
    } catch (err) {
      log('error', `${entity} crashed: ${err}`);
      totalErrors++;
    }
  }

  // Print post-state
  const after = {
    Department: await Department.countDocuments({ type: 'faculty' }),
    Major: await Major.countDocuments({}),
    Subject: await Subject.countDocuments({}),
    Curriculum: await Curriculum.countDocuments({}),
    StudentClass: await StudentClass.countDocuments({}),
    Student: await Student.countDocuments({}),
    ExternalMapping: await ExternalMapping.countDocuments({ source: 'hqnhat' }),
  };

  console.log('\n📊 AFTER migration:');
  Object.entries(after).forEach(([k, v]) => {
    const diff = v - (before[k as keyof typeof before] || 0);
    const arrow = diff > 0 ? `+${diff}` : diff.toString();
    console.log(`  - ${k}: ${v} (${arrow})`);
  });

  console.log(`\n${YELLOW}── Summary ──${RESET}`);
  console.log(`  Total created: ${totalCreated}`);
  console.log(`  Total updated: ${totalUpdated}`);
  console.log(`  Total errors:  ${totalErrors}`);
  console.log(`  Status:        ${totalErrors === 0 ? GREEN + '✅ SUCCESS' : RED + '❌ PARTIAL'}${RESET}`);

  log('info', '🔌 Closing MongoDB connection');
  await mongoose.connection.close();
  log('success', '✅ Migration complete');

  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`${RED}[FATAL]${RESET}`, err);
  process.exit(1);
});
