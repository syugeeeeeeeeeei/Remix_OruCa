// src/utils.ts
import type { TWsMessage } from '@/api/types.js';
import type { WSContext } from 'hono/ws';
import type { WebSocket } from 'ws';

export const sendWsMessage = (ws: WSContext<WebSocket>, data: TWsMessage): void => {
	try {
		if (ws.readyState === 1) { // WebSocket.OPEN
			ws.send(JSON.stringify(data));
		} else {
			console.error('WebSocketが開かれていません');
		}
	} catch (error) {
		console.error('メッセージ送信エラー:', error);
	}
};