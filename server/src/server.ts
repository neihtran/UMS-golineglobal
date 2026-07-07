import mongoose from 'mongoose';
import { config } from 'dotenv';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

config();

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ums_db';

async function start() {
  try {
    // ─── Connect to MongoDB ──────────────────────────────────────────────────────
    logger.info('Connecting to MongoDB...', { uri: MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@') });

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ MongoDB connected successfully');

    // ─── Seed check (auto-seed if empty) ────────────────────────────────────────
    const User = (await import('./models/User.js')).User;
    const count = await User.countDocuments();
    if (count === 0) {
      logger.info('Database empty — running seed...');
      const { seedAll } = await import('./seed/seedAll.js');
      await seedAll();
      logger.info('✅ Seed complete');
    }

    // ─── Start server ───────────────────────────────────────────────────────────
    const app = createApp();
    app.listen(PORT, () => {
      logger.info(`🚀 UMS Server running on http://localhost:${PORT}`);
      logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`   API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// ─── Graceful shutdown ──────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received — shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

start();
