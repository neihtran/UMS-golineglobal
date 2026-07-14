import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env, PORT } from './config/env.js';

async function startServer() {
  try {
    // ─── Connect to Database ─────────────────────────────────────────────────
    console.log('🔄 Connecting to MongoDB...');
    await connectDatabase();

    // ─── Create Express App ──────────────────────────────────────────────────
    const app = createApp();

    // ─── Start Server ─────────────────────────────────────────────────────────
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

    // ─── Graceful Shutdown ───────────────────────────────────────────────────
    
    const shutdown = async (signal: string) => {
      console.log(`\n📤 Received ${signal}. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('🔒 HTTP server closed');
        await disconnectDatabase();
        console.log('👋 Goodbye!');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ─── Unhandled Rejection ─────────────────────────────────────────────────
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // ─── Uncaught Exception ──────────────────────────────────────────────────
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
