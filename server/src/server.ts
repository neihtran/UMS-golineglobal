import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env, PORT } from './config/env.js';
import { startHqnhatScheduler, stopAllHqnhatJobs } from './jobs/index.js';

async function startServer() {
  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 UMS Backend Server Started Successfully!                ║
║                                                               ║
║   Environment: ${env.NODE_ENV.padEnd(44)}║
║   Port:        ${PORT.toString().padEnd(44)}║
║   API URL:     http://localhost:${PORT}/api                       ║
║   Health:      http://localhost:${PORT}/api/health                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });

  connectDatabase()
    .then(() => {
      console.log('✅ MongoDB connected');
      startHqnhatScheduler();
    })
    .catch((error) => {
      console.error('⚠️ MongoDB connection failed:', error.message);
      console.error('⚠️ Server will continue running. Health endpoints available.');
    });

  const shutdown = async (signal: string) => {
    console.log(`\n📤 Received ${signal}. Shutting down gracefully...`);

    stopAllHqnhatJobs();

    server.close(async () => {
      console.log('🔒 HTTP server closed');
      await disconnectDatabase().catch(() => {});
      console.log('👋 Goodbye!');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('⚠️ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
  });
}

startServer();