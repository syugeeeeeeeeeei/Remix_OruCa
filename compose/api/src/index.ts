import { serve } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import { Hono } from 'hono';

import { SERVER_CONFIG } from '@/config.js';
import { broadcastData, onClose, onError, onMessage, onOpen } from '@/handlers/webSocketHandler.js';
import { adminRoutes } from '@/routes/admin.js';
import { authRoutes } from '@/routes/auth.js';
import { httpRoutes } from '@/routes/http.js';
import type { AppContext } from '@ShardTypes/UserDefTypes/api/types.js';
import type { WSContext } from 'hono/ws';
import type { WebSocket } from 'ws';

// カスタムコンテキストの型定義をここにもインポート（または定義）
type CustomWSContext = WSContext<WebSocket> & { clientId: number };

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
			// ★★★ onOpenは元の型で受け取り、他のハンドラでは型アサーションを行う ★★★
			onOpen: (evt, ws) => onOpen(evt, ws ),
			onMessage: (evt, ws) => onMessage(evt, ws as CustomWSContext),
			onClose: (evt, ws) => onClose(evt, ws as CustomWSContext),
			onError: (evt, ws) => onError(evt, ws as CustomWSContext),
		};
	})
);

// 3. HTTPサーバーを起動し、インスタンスを取得
const server = serve({
	fetch: app.fetch,
	port: SERVER_CONFIG.port,
}, (info) => {
	// サーバー起動時のログはシンプルにする
	console.log(`🚀 API server listening on http://localhost:${info.port}`);
});

// 4. 起動したサーバーにWebSocket機能を注入
injectWebSocket(server);