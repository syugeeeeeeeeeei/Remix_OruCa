// src/handlers/webSocketHandler.ts
import { prisma } from '@/db.js';
import type { TWsMessage, TWsPayLoad } from '@/types.js';
import { hasProps, sendWsMessage } from '@/utils.js';
import type { WSContext } from 'hono/ws';
import { createHash } from 'node:crypto';
import type { WebSocket } from 'ws'; // ★修正点: WebSocket型をインポート

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

// --- メッセージごとの処理ハンドラ ---

const handleUpdateName = async (ws: WSContext<WebSocket>, data: TWsMessage) => {
	const payloadContent = data.payload?.content?.[0];
	const responsePayload: TWsPayLoad = { result: false, content: [], message: "不明なエラー" };

	try {
		if (!payloadContent || !hasProps<{ student_ID: string; student_Name: string }>(payloadContent, ["student_ID", "student_Name"])) {
			responsePayload.message = "student_ID または student_Name がありません";
			return sendWsMessage(ws, { type: "user/update_name", payload: responsePayload });
		}

		const { student_ID, student_Name } = payloadContent;
		await prisma.user.update({
			where: { student_ID },
			data: { student_Name },
		});

		responsePayload.result = true;
		responsePayload.message = `更新完了（${student_ID}：${student_Name}）`;
		sendWsMessage(ws, { type: "user/update_name", payload: responsePayload });
		await broadcastData();

	} catch (err) {
		console.error("更新エラー:", err);
		responsePayload.message = "更新失敗";
		sendWsMessage(ws, { type: "user/update_name", payload: responsePayload });
	}
};

const handleAuth = async (ws: WSContext<WebSocket>, data: TWsMessage) => {
	const payloadContent = data.payload?.content?.[0];
	const responsePayload: TWsPayLoad = { result: false, content: [], message: "不明なエラー" };

	try {
		if (!payloadContent || !hasProps<{ student_ID: string; password: string }>(payloadContent, ["student_ID", "password"])) {
			responsePayload.message = "student_ID または password がありません";
			return sendWsMessage(ws, { type: "user/auth", payload: responsePayload });
		}

		const { student_ID, password } = payloadContent;
		const user = await prisma.user.findUnique({ where: { student_ID } });

		if (!user) {
			responsePayload.message = "ユーザーが存在しません";
			return sendWsMessage(ws, { type: "user/auth", payload: responsePayload });
		}

		const generateSHA256Hash = (input: string): string => createHash("sha256").update(input).digest("hex");
		const salt = generateSHA256Hash(student_ID);
		const expectedToken = generateSHA256Hash(`${student_ID}${password}${salt}`);

		const isValid = user.student_token === expectedToken;

		responsePayload.result = isValid;
		responsePayload.message = isValid ? "認証成功" : "認証エラー";
		sendWsMessage(ws, { type: "user/auth", payload: responsePayload });

	} catch (err) {
		console.error("認証エラー:", err);
		responsePayload.message = "サーバー内部エラー";
		sendWsMessage(ws, { type: "user/auth", payload: responsePayload });
	}
};

const handleDeleteUser = async (ws: WSContext<WebSocket>, data: TWsMessage) => {
	const payloadContent = data.payload?.content?.[0];
	const responsePayload: TWsPayLoad = { result: false, content: [], message: "不明なエラー" };

	try {
		if (!payloadContent || !hasProps<{ student_ID: string }>(payloadContent, ["student_ID"])) {
			responsePayload.message = "student_IDがありません";
			return sendWsMessage(ws, { type: "user/delete", payload: responsePayload });
		}

		const { student_ID } = payloadContent;
		await prisma.user.delete({ where: { student_ID } });

		responsePayload.result = true;
		responsePayload.message = `削除完了（${student_ID}）`;
		sendWsMessage(ws, { type: "user/delete", payload: responsePayload });
		await broadcastData();

	} catch (err) {
		console.error("削除エラー:", err);
		responsePayload.message = "削除失敗";
		sendWsMessage(ws, { type: "user/delete", payload: responsePayload });
	}
};

// --- Hono用WebSocketイベントハンドラ ---

export const onOpen = async (evt: Event, ws: WSContext<WebSocket>) => { // ★修正点: ws: WebSocket
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

export const onMessage = async (evt: MessageEvent, ws: WSContext<WebSocket>) => { // ★修正点: ws: WebSocket
	const data: TWsMessage = JSON.parse(evt.data);

	switch (data.type) {
		case 'log/fetch':
			try {
				const logs = await fetchLogs();
				sendWsMessage(ws, { type: "log/fetch", payload: { result: true, content: logs, message: "在室データ" } });
			} catch (error) {
				sendWsMessage(ws, { type: "log/fetch", payload: { result: false, content: [], message: "ログ取得失敗" } });
			}
			break;

		case 'user/update_name':
			await handleUpdateName(ws, data);
			break;

		case 'user/auth':
			await handleAuth(ws, data);
			break;

		case 'user/delete':
			await handleDeleteUser(ws, data);
			break;
	}
};

export const onClose = (evt: CloseEvent, ws: WSContext<WebSocket>) => { // ★修正点: ws: WebSocket
	clients.delete(ws);
	console.log('クライアントが切断しました');
};

export const onError = (evt: Event, ws: WSContext<WebSocket>) => { // ★修正点: ws: WebSocket
	console.error("WebSocketエラー:", evt);
};