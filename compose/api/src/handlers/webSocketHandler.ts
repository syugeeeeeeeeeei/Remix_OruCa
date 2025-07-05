import { prisma } from '@/db.js';
import { sendWsMessage } from '@/utils.js';
import { wsMessageSchema } from '@/validators.js';
import type { TWsMessage } from '@ShardTypes/UserDefTypes/api/types.js';
import type { WSContext } from 'hono/ws';
import type { WebSocket } from 'ws';

// 接続してきたクライアントに一意のIDを割り振るためのカウンター
let clientIdCounter = 0;

// HonoのWSContextにカスタムプロパティ（クライアントID）を追加するための型拡張
type CustomWSContext = WSContext<WebSocket> & { clientId: number };

// 接続中のクライアントをグローバルで管理
const clients = new Set<CustomWSContext>();

// ログ出力用のヘルパー関数
const log = (
	level: 'INFO' | 'ERROR' | 'DEBUG',
	eventType: 'SYSTEM' | 'CONNECT' | 'DISCONNECT' | 'INCOMING' | 'OUTGOING' | 'ERROR',
	clientId: number | null,
	message: string,
	details?: any
) => {
	const timestamp = new Date().toISOString();
	
	// ★★★ パディング処理を追加 ★★★
	const levelStr = `[${level}]`.padEnd(8); // [DEBUG] (7文字) より少し長い8文字に固定
	const eventTypeStr = `[${eventType}]`.padEnd(13); // [DISCONNECT] (12文字) より少し長い13文字に固定

	const clientIdStr = clientId !== null ? `[Client #${String(clientId).padStart(3, '0')}]` : '[SYSTEM]'.padEnd(13);
	const logMessage = `${timestamp} ${levelStr}${eventTypeStr}${clientIdStr} ${message}`;

	if (details) {
		console.log(logMessage, details);
	} else {
		console.log(logMessage);
	}
};


// 在室状況ログを取得する
const fetchLogs = async () => {
	try {
		const logs = await prisma.log.findMany({
			include: {
				user: true, // 関連するUser情報も取得
			},
			orderBy: {
				updated_at: 'desc',
			},
		});
		return logs;
	} catch (error) {
		log('ERROR', 'SYSTEM', null, 'データベースからのログ取得に失敗しました。', error);
		throw error;
	}
};

// 全クライアントへのデータブロードキャスト
export const broadcastData = async () => {
	log('INFO', 'SYSTEM', null, '全クライアントへのデータブロードキャストを開始します。');
	try {
		const logs = await fetchLogs();
		const message: TWsMessage = {
			type: "log/fetch",
			payload: { result: true, content: logs, message: "在室データ(ブロードキャスト)" }
		};

		if (clients.size === 0) {
			log('DEBUG', 'SYSTEM', null, '接続中のクライアントがいないため、ブロードキャストをスキップしました。');
			return;
		}

		clients.forEach(client => {
			if (client.readyState === 1) { // WebSocket.OPEN
				log('DEBUG', 'OUTGOING', client.clientId, `メッセージを送信: ${message.type}`);
				sendWsMessage(client, message);
			}
		});
		log('INFO', 'SYSTEM', null, `${clients.size}台のクライアントへのブロードキャストが完了しました。`);

	} catch (err) {
		log('ERROR', 'SYSTEM', null, 'データのブロードキャスト処理中にエラーが発生しました。', err);
	}
};

// --- Hono用WebSocketイベントハンドラ ---

export const onOpen = async (evt: Event, ws: WSContext<WebSocket>) => {
	const customWs = ws as CustomWSContext;
	customWs.clientId = ++clientIdCounter;
	clients.add(customWs);
	log('INFO', 'CONNECT', customWs.clientId, '新しいクライアントが接続しました。');

	try {
		log('DEBUG', 'SYSTEM', customWs.clientId, '初期データの取得と送信を開始します。');
		const initialLogs = await fetchLogs();
		const message: TWsMessage = {
			type: "log/fetch",
			payload: { result: true, content: initialLogs, message: "初期データ" }
		};
		log('DEBUG', 'OUTGOING', customWs.clientId, `メッセージを送信: ${message.type}`);
		sendWsMessage(customWs, message);
		log('INFO', 'SYSTEM', customWs.clientId, '初期データの送信が完了しました。');
	} catch (error) {
		log('ERROR', 'SYSTEM', customWs.clientId, '初期データの送信処理中にエラーが発生しました。', error);
	}
};

export const onMessage = async (evt: MessageEvent, ws: CustomWSContext) => {
	log('DEBUG', 'INCOMING', ws.clientId, 'メッセージを受信しました。', evt.data);

	let parsedData;
	try {
		parsedData = JSON.parse(evt.data);
	} catch (error) {
		log('ERROR', 'INCOMING', ws.clientId, '受信したメッセージのJSONパースに失敗しました。', error);
		return;
	}

	const validationResult = wsMessageSchema.safeParse(parsedData);
	if (!validationResult.success) {
		log('ERROR', 'INCOMING', ws.clientId, '無効な形式のWebSocketメッセージを受信しました。', validationResult.error.flatten());
		return;
	}
	
	log('INFO', 'INCOMING', ws.clientId, `メッセージタイプ '${validationResult.data.type}' の処理を実行します。`);
	// 現在はクライアントからのメッセージに対する具体的な処理はないため、ログ出力のみ
};

export const onClose = (evt: CloseEvent, ws: CustomWSContext) => {
	clients.delete(ws);
	log('INFO', 'DISCONNECT', ws.clientId, `クライアントが切断しました。 (Code: ${evt.code}, Reason: ${evt.reason || 'N/A'})`);
};

export const onError = (evt: Event, ws: CustomWSContext) => {
	log('ERROR', 'ERROR', ws.clientId, 'WebSocketエラーが発生しました。', evt);
};