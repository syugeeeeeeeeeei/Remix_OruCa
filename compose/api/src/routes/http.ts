// src/routes/http.ts
import { handleLogWrite } from '@/handlers/httpHandler.js';
import type { AppContext } from '@/types.js';
import { Hono } from 'hono';

const httpRoutes = new Hono<AppContext>();

httpRoutes.post('/log/write', handleLogWrite);
httpRoutes.get('/echo', (c) => c.json("http(api) is connected\n"));

export { httpRoutes };
