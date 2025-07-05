import { SERVER_CONFIG } from '@/config.js';
import { broadcastData } from '@/handlers/webSocketHandler.js';
import { adminRoutes } from '@/routes/admin.js';
import { authRoutes } from '@/routes/auth.js';
import { httpRoutes } from '@/routes/http.js';
import { webSocketRoutes } from '@/routes/websocket.js';
import { serve } from '@hono/node-server';
import type { AppContext } from '@ShardTypes/UserDefTypes/api/types.js';
import { Hono } from 'hono';

const app = new Hono<AppContext>();

// WebSocketブロードキャスト関数をコンテキストにセットするミドルウェア
app.use('*', async (c, next) => {
	c.set('broadcast', broadcastData);
	await next();
});

// ルーティングの適用
app.route('/api/auth', authRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api', httpRoutes);
app.route('/socket', webSocketRoutes);

// サーバー起動
serve({
	fetch: app.fetch,
	port: SERVER_CONFIG.port,
});

console.log(`APIサーバーは http://localhost:${SERVER_CONFIG.port} で実行中`);