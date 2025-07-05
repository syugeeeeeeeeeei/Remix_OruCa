import { serve } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import { Hono } from 'hono';

import { SERVER_CONFIG } from '@/config.js';
import { broadcastData, onClose, onError, onMessage, onOpen } from '@/handlers/webSocketHandler.js';
import { adminRoutes } from '@/routes/admin.js';
import { authRoutes } from '@/routes/auth.js';
import { httpRoutes } from '@/routes/http.js';
import type { AppContext } from '@ShardTypes/UserDefTypes/types.js';

// 1. Honoアプリケーションを初期化
const app = new Hono<AppContext>();

// 2. WebSocketヘルパーをHonoアプリに接続
const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });

// --- グローバルミドルウェア ---
app.use('*', async (c, next) => {
	c.set('broadcast', broadcastData);
	await next();
});

// --- HTTPルート ---
app.route('/api/auth', authRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api', httpRoutes);

// --- WebSocketルート ---
app.get(
	'/socket',
	upgradeWebSocket((c) => {
		return {
			onOpen: (evt, ws) => onOpen(evt, ws),
			onMessage: (evt, ws) => onMessage(evt, ws),
			onClose: (evt, ws) => onClose(evt, ws),
			onError: (evt, ws) => onError(evt, ws),
		};
	})
);

// 3. HTTPサーバーを起動し、インスタンスを取得
const server = serve({
	fetch: app.fetch,
	port: SERVER_CONFIG.port,
}, (info) => {
	console.log(`APIサーバーは http://localhost:${info.port} で実行中`);
});

// 4. 起動したサーバーにWebSocket機能を注入
injectWebSocket(server);