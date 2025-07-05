import { prisma } from '@/db.js';
import { sendWsMessage } from '@/utils.js';
import { wsMessageSchema } from '@/validators.js';
import type { TWsMessage } from '@ShardTypes/UserDefTypes/api/types.js';
import type { WSContext } from 'hono/ws';
import type { WebSocket } from 'ws';

// 接続中のクライアントをグローバルで管理
const clients = new Set<WSContext<WebSocket>>();

// ログ取得
const fetchLogs = async () => {
	const logs = await prisma.log.findMany({
		// ★★★ 修正点1: select -> include に変更 ★★★
		// フロントエンドが期待する { ...log, user: { ... } } の形式で取得する
		include: {
			user: true
		},
		orderBy: {
			updated_at: 'desc',
		},
	});
	// ★★★ 修正点1: 不要なデータ変換(map)を削除 ★★★
	// データベースから取得した正しい構造のデータをそのまま返す
	return logs;
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

export const onOpen = async (evt: Event, ws: WSContext<WebSocket>) => {
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

export const onMessage = async (evt: MessageEvent, ws: WSContext<WebSocket>) => {
	const validationResult = wsMessageSchema.safeParse(JSON.parse(evt.data));
	if (!validationResult.success) {
		console.error("無効なWebSocketメッセージ:", validationResult.error);
		return;
	}

	// ★★★ 修正点2: log/fetch の処理を削除 ★★★
	// クライアントからのデータ要求には応答しないようにする
	// const data = validationResult.data;
	// if (data.type === 'log/fetch') { ... } の部分を削除
};

export const onClose = (evt: CloseEvent, ws: WSContext<WebSocket>) => {
	clients.delete(ws);
	console.log('クライアントが切断しました');
};

export const onError = (evt: Event, ws: WSContext<WebSocket>) => {
	console.error("WebSocketエラー:", evt);
};