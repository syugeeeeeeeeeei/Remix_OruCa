// src/utils.ts
import type { TWsMessage } from '@ShardTypes/UserDefTypes/api/types.js';
import type { WSContext } from 'hono/ws';
import type { WebSocket } from 'ws';

export const hasProps = <T extends object>(obj: any, props: (keyof T)[]): obj is T => {
	if (!obj) return false;
	return props.every((prop) => prop in obj);
};

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