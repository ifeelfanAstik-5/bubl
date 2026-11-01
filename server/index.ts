import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { bubbleRoutes } from './routes/bubbles';
import { orbitRoutes } from './routes/orbits';
import { messageRoutes } from './routes/messages';
import { devRoutes } from './routes/dev';
import { checkDatabaseConnection } from './db';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();
const PORT = Number(process.env.PORT) || 3001;

// Middlewares
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Health & System Status Endpoint
app.get('/api/health', async (c) => {
  const dbOk = await checkDatabaseConnection();
  return c.json({
    status: 'ok',
    app: 'Bubl Mindful Pen Pal Backend',
    runtime: typeof (globalThis as any).Bun !== 'undefined' ? 'Bun' : 'Node.js',
    database: dbOk ? 'connected' : 'offline_or_local_fallback',
    timestamp: new Date().toISOString()
  });
});

// Root welcome
app.get('/', (c) => {
  return c.text('🫧 Bubl — Mindful Pen Pal & Thought Exchange API is running.');
});

// Mount modular sub-routers
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api', userRoutes); // aliases /api/me to /api/users/me
app.route('/api/bubbles', bubbleRoutes);
app.route('/api/orbits', orbitRoutes);
app.route('/api/dev', devRoutes);
// messages route handles /api/orbits/:friendId/messages
app.route('/api/orbits', messageRoutes);

// Error handling
app.onError((err, c) => {
  console.error('[Bubl Server Error]:', err);
  return c.json({ success: false, error: err.message || 'Internal server error' }, 500);
});

// Server boot: If running inside Bun, export default fetch handler
if (typeof (globalThis as any).Bun !== 'undefined') {
  console.log(`🫧 Bubl server running natively on Bun at http://localhost:${PORT}`);
  (globalThis as any).Bun.serve({
    fetch: app.fetch,
    port: PORT
  });
} else {
  // Running on Node.js / tsx
  serve(
    {
      fetch: app.fetch,
      port: PORT
    },
    (info) => {
      console.log(`🫧 Bubl server running via @hono/node-server at http://localhost:${info.port}`);
    }
  );
}

export default app;
