import type { TWsMessage } from '@/api/types.js';
import { prisma } from '@/db.js';
import { sendWsMessage } from '@/utils.js';
import type { WSContext } from 'hono/ws'; // ★追加
import type { WebSocket } from 'ws';

// 接続中のクライアントをグローバルで管理
const clients = new Set<WSContext<WebSocket>>();

// ログ取得
const fetchLogs = async () => {
	const logs = await prisma.log.findMany({
		select: {
			student_ID: true,
			isInRoom: true,
			updated_at: true,
			user: {
				select: {
					student_Name: true,
				},
			},
		},
		orderBy: {
			updated_at: 'desc',
		},
	});

	return logs.map(log => ({
		student_ID: log.student_ID,
		student_Name: log.user?.student_Name,
		isInRoom: log.isInRoom,
		updated_at: log.updated_at.toISOString(),
	}));
};

// 全クライアントへのデータブロードキャスト
export const broadcastData = async () => {
	try {
		const logs = await fetchLogs();
		const message: TWsMessage = {
			type: "log/fetch",
			payload: { result: true, content: logs, message: "在室データ(ブロードキャスト)" }
		};
		clients.forEach(client => {
			if (client.readyState === 1) { // WebSocket.OPEN
				sendWsMessage(client, message);
			}
		});
	} catch (err) {
		console.error("データのブロードキャストエラー:", err);
	}
};

// --- Hono用WebSocketイベントハンドラ ---

export const onOpen = async (evt: Event, ws: WSContext<WebSocket>) => { // ★型を変更
	clients.add(ws);
	console.log('クライアントが接続しました');
	try {
		const initialLogs = await fetchLogs();
		sendWsMessage(ws, {
			type: "log/fetch",
			payload: { result: true, content: initialLogs, message: "初期データ" }
		});
	} catch (error) {
		console.error("初期データ送信エラー:", error);
	}
};

export const onMessage = async (evt: MessageEvent, ws: WSContext<WebSocket>) => { // ★型を変更
	const data: TWsMessage = JSON.parse(evt.data);

	if (data.type === 'log/fetch') {
		try {
			const logs = await fetchLogs();
			sendWsMessage(ws, { type: "log/fetch", payload: { result: true, content: logs, message: "在室データ" } });
		} catch (error) {
			sendWsMessage(ws, { type: "log/fetch", payload: { result: false, content: [], message: "ログ取得失敗" } });
		}
	}
};

export const onClose = (evt: CloseEvent, ws: WSContext<WebSocket>) => { // ★型を変更
	clients.delete(ws);
	console.log('クライアントが切断しました');
};

export const onError = (evt: Event, ws: WSContext<WebSocket>) => { // ★型を変更
	console.error("WebSocketエラー:", evt);
};