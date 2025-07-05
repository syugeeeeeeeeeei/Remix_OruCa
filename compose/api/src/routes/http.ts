// src/routes/http.ts
import type { AppContext } from '@/api/types.js';
import { handleLogWrite } from '@/handlers/httpHandler.js';
import { Hono } from 'hono';

const httpRoutes = new Hono<AppContext>();

httpRoutes.post('/log/write', handleLogWrite);
httpRoutes.get('/echo', (c) => c.json("http(api) is connected\n"));

export { httpRoutes };
