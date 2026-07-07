/**
 * Mock API Server Entry Point
 * Runs a standalone Express server on port 5001 serving mock data.
 * Start with: node --loader ts-node/esm src/mock/server.ts
 * Or use: node dist/mock/server.js (after build)
 */
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mockRoutes from './routes.js';

function createMockApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: 'mock' });
  });

  // All API routes
  app.use('/api', mockRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Endpoint không tồn tại (mock mode)' },
    });
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Mock Error]', err.message);
    res.status(500).json({ success: false, error: { code: 'INTERNAL', message: err.message } });
  });

  return app;
}

const PORT = Number(process.env.MOCK_PORT) || 5001;
const app = createMockApp();

app.listen(PORT, () => {
  console.log(`\n🎭 Mock API Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API base: http://localhost:${PORT}/api\n`);
});

export { createMockApp };
