import { handleLogin } from '@/handlers/authHandler.js';
import { Hono } from 'hono';

const authRoutes = new Hono();

authRoutes.post('/login', handleLogin);

export { authRoutes };
